const firebase = require('firebase/app');
require('firebase/firestore');
const nodemailer = require('nodemailer');

const WOMPI_TRANSACTIONS_URL =
  process.env.WOMPI_TRANSACTIONS_URL || 'https://production.wompi.co/v1/transactions';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDLQV1hup5UJw7pYbqFu6eVUQxs6wHn0w8',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'emprendimiento-03-52bab.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'emprendimiento-03-52bab',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'emprendimiento-03-52bab.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '183837083318',
  appId: process.env.FIREBASE_APP_ID || '1:183837083318:web:e75800407f74a5305c8817',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

const formatCurrency = (value = 0) => {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);
  } catch (error) {
    const number = Math.round(Number(value) || 0);
    return `COP ${number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }
};

const sanitizeString = (value, max = 200) => {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
};

const normalizeCartItems = async (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    throw new Error('CART_EMPTY');
  }

  const sanitized = [];
  let subtotal = 0;

  for (const item of items) {
    const id = sanitizeString(item.id || '', 100);
    const qty = Number(item.qty);

    if (!id) {
      throw new Error('ITEM_ID_REQUIRED');
    }

    if (!Number.isInteger(qty) || qty <= 0 || qty > 99) {
      throw new Error('INVALID_QUANTITY');
    }

    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) {
      throw new Error('PRODUCT_NOT_FOUND');
    }

    const product = doc.data();
    const price = Number(product.price);
    if (Number.isNaN(price) || price < 0) {
      throw new Error('INVALID_PRODUCT_PRICE');
    }

    const line = {
      id,
      name: sanitizeString(product.name || '', 150),
      image: Array.isArray(product.images) ? product.images[0] || null : null,
      qty,
      price,
    };

    const color = sanitizeString(item.color || '', 60);
    if (color) {
      line.color = color;
    }

    subtotal += price * qty;
    sanitized.push(line);
  }

  return { sanitizedItems: sanitized, subtotal };
};

const calculateDiscount = (itemCount) => {
  if (itemCount === 2) return 2000 * itemCount;
  if (itemCount >= 3) return 3000 * itemCount;
  return 0;
};

const validateCustomer = (data = {}) => {
  const allowedFields = [
    'nombres',
    'apellidos',
    'telefono',
    'departamento',
    'ciudad',
    'direccion',
  ];

  const customer = {};

  allowedFields.forEach((field) => {
    if (data[field]) {
      customer[field] = sanitizeString(data[field], 200);
    }
  });

  if (!customer.nombres || !customer.apellidos || !customer.telefono) {
    throw new Error('CUSTOMER_DATA_INCOMPLETE');
  }

  if (!/^[0-9]{10}$/.test(customer.telefono)) {
    throw new Error('INVALID_PHONE');
  }

  return customer;
};

const verifyWompiPayment = async ({ transactionId, expectedTotal, referenceHint }) => {
  const secret = process.env.WOMPI_PRIVATE_KEY;
  if (!secret) {
    throw new Error('MISSING_WOMPI_SECRET');
  }

  const response = await fetch(`${WOMPI_TRANSACTIONS_URL}/${transactionId}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${secret}`,
    },
  });

  if (!response.ok) {
    throw new Error('WOMPI_LOOKUP_FAILED');
  }

  const payload = await response.json();
  const data = payload?.data;

  if (!data) {
    throw new Error('WOMPI_INVALID_RESPONSE');
  }

  if (data.status !== 'APPROVED') {
    throw new Error('WOMPI_NOT_APPROVED');
  }

  if (data.amount_in_cents !== Math.round(expectedTotal * 100)) {
    throw new Error('WOMPI_AMOUNT_MISMATCH');
  }

  if (referenceHint && data.reference !== referenceHint) {
    throw new Error('WOMPI_REFERENCE_MISMATCH');
  }

  return {
    reference: data.reference,
    transactionId: data.id,
    raw: data,
  };
};

const sendOrderEmail = async ({ orderId, order }) => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const to = process.env.ORDER_NOTIFICATION_EMAIL || user;

  if (!user || !pass) {
    console.warn('[create-order] EMAIL_USER or EMAIL_PASS missing. Skipping email notification.');
    return { skipped: true, reason: 'missing_credentials' };
  }

  if (!to) {
    console.warn('[create-order] ORDER_NOTIFICATION_EMAIL missing. Skipping email notification.');
    return { skipped: true, reason: 'missing_recipient' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    const itemsHtml = (order.productos || [])
      .map(
        (producto) =>
          `<li>${sanitizeString(producto.name || '', 150)} (${producto.qty} unidades) - ${formatCurrency(
            Number(producto.price) * Number(producto.qty || 1)
          )}</li>`
      )
      .join('');

    const itemsText = (order.productos || [])
      .map((producto) => `- ${sanitizeString(producto.name || '', 150)} (${producto.qty} unidades)`)
      .join('\n');

    const subject = `Nuevo Pedido #${orderId}`;
    const text = [
      `¡Nuevo Pedido #${orderId}!`,
      '',
      `Cliente: ${order.nombres} ${order.apellidos}`,
      `Teléfono: ${order.telefono}`,
      `Dirección: ${order.direccion}, ${order.ciudad} - ${order.departamento}`,
      '',
      'Productos:',
      itemsText,
      '',
      `Subtotal: ${formatCurrency(order.subtotal)}`,
      `Descuento: ${formatCurrency(order.descuento)}`,
      `Total: ${formatCurrency(order.total)}`,
      '',
      `Método de pago: ${order.metodoPago}`,
    ].join('\n');

    const html = `
      <h2>¡Nuevo Pedido #${orderId}!</h2>
      <p><strong>Cliente:</strong> ${order.nombres} ${order.apellidos}</p>
      <p><strong>Teléfono:</strong> ${order.telefono}</p>
      <p><strong>Dirección:</strong> ${order.direccion}, ${order.ciudad} - ${order.departamento}</p>
      <p><strong>Método de pago:</strong> ${order.metodoPago}</p>
      <h3>Productos:</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}</p>
      <p><strong>Descuento:</strong> ${formatCurrency(order.descuento)}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
    `;

    await transporter.sendMail({
      from: user,
      to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error('[create-order] Error sending email notification:', error);
    return { sent: false, error: error.message };
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const customer = validateCustomer(body.customer);
    const { sanitizedItems, subtotal } = await normalizeCartItems(body.cartItems);

    const discount = calculateDiscount(sanitizedItems.length);
    const total = Math.max(subtotal - discount, 0);

    const paymentMethod = sanitizeString(body?.payment?.method || '', 40);
    if (!paymentMethod) {
      throw new Error('PAYMENT_METHOD_REQUIRED');
    }

    const reference = sanitizeString(body?.payment?.reference || '', 80) || `pedido-${Date.now()}`;

    const order = {
      ...customer,
      productos: sanitizedItems,
      subtotal,
      descuento: discount,
      total,
      metodoPago: paymentMethod,
      estado: paymentMethod === 'Wompi' ? 'pagado' : 'pendiente',
      referencia: reference,
      fecha: Date.now(),
    };

    if (paymentMethod === 'Wompi') {
      const transactionId = sanitizeString(body?.payment?.transactionId || '', 120);
      if (!transactionId) {
        throw new Error('WOMPI_TRANSACTION_REQUIRED');
      }

      const existing = await db
        .collection('pedidos')
        .where('transactionId', '==', transactionId)
        .limit(1)
        .get();

      if (!existing.empty) {
        const doc = existing.docs[0];
        return {
          statusCode: 200,
          body: JSON.stringify({ id: doc.id, order: doc.data(), reused: true }),
        };
      }

      const wompiData = await verifyWompiPayment({
        transactionId,
        expectedTotal: total,
        referenceHint: reference,
      });

      order.referencia = wompiData.reference || reference;
      order.transactionId = wompiData.transactionId;
      order.estado = 'pagado';
    }

    const docRef = await db.collection('pedidos').add(order);
    await docRef.update({ id: docRef.id });

    const emailResult = await sendOrderEmail({ orderId: docRef.id, order });

    return {
      statusCode: 201,
      body: JSON.stringify({ id: docRef.id, order, email: emailResult }),
    };
  } catch (error) {
    console.error('[create-order] Error:', error);

    const errorMap = {
      CART_EMPTY: 400,
      ITEM_ID_REQUIRED: 400,
      INVALID_QUANTITY: 400,
      PRODUCT_NOT_FOUND: 404,
      INVALID_PRODUCT_PRICE: 400,
      CUSTOMER_DATA_INCOMPLETE: 400,
      INVALID_PHONE: 400,
      PAYMENT_METHOD_REQUIRED: 400,
      WOMPI_TRANSACTION_REQUIRED: 400,
      WOMPI_LOOKUP_FAILED: 502,
      WOMPI_INVALID_RESPONSE: 502,
      WOMPI_NOT_APPROVED: 409,
      WOMPI_AMOUNT_MISMATCH: 409,
      WOMPI_REFERENCE_MISMATCH: 409,
      MISSING_WOMPI_SECRET: 500,
    };

    const statusCode = errorMap[error.message] || 500;
    return {
      statusCode,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
