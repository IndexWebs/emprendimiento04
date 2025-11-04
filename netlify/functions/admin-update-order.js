const getFirebaseAdmin = require('./_firebaseAdmin');

const allowedStates = ['pendiente', 'enviado', 'entregado', 'cancelado'];

const buildCorsHeaders = () => ({
  'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
});

exports.handler = async (event) => {
  const corsHeaders = buildCorsHeaders();

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const admin = getFirebaseAdmin();
    const { authorization } = event.headers || {};
    if (!authorization) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing Authorization header' }),
      };
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid Authorization header format' }),
      };
    }

    let body = {};
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON body' }),
      };
    }

    const { id, estado } = body;
    if (!id || typeof id !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Order ID is required' }),
      };
    }

    if (!allowedStates.includes(estado)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Estado inválido' }),
      };
    }

    const token = parts[1];
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
      console.error('[admin-update-order] Token verification failed', error);
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    if (!decoded.admin) {
      return {
        statusCode: 403,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Insufficient permissions' }),
      };
    }

    const db = admin.firestore();
    const pedidoRef = db.collection('pedidos').doc(id);
    await pedidoRef.update({
      estado,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: decoded.uid,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ id, estado }),
    };
  } catch (error) {
    console.error('[admin-update-order] Unexpected error', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
