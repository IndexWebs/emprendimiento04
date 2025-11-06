import Vuex from "vuex";
import { db, firebase } from "@/plugins/firebase";
import "firebase/storage";

const CUSTOMER_FIELDS = [
  "nombres",
  "apellidos",
  "telefono",
  "departamento",
  "ciudad",
  "direccion",
];

const buildCustomerPayload = (datos = {}) => {
  const customer = {};

  CUSTOMER_FIELDS.forEach((field) => {
    if (datos[field]) {
      customer[field] = String(datos[field]).trim();
    }
  });

  if (!customer.nombres || !customer.apellidos || !customer.telefono) {
    throw new Error("Datos del cliente incompletos");
  }

  if (!/^[0-9]{10}$/.test(customer.telefono)) {
    throw new Error("Teléfono inválido");
  }

  return customer;
};

const buildCartItemsPayload = (items = []) => {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item) => {
    if (!item || !item.id) {
      throw new Error("Producto sin identificador");
    }

    const qty = parseInt(item.qty, 10);
    if (!Number.isInteger(qty) || qty <= 0 || qty > 99) {
      throw new Error("Cantidad inválida");
    }

    const payload = {
      id: String(item.id),
      qty,
    };

    if (item.color) {
      payload.color = String(item.color).trim();
    }

    return payload;
  });
};

const storeLastOrder = (order) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem("ultimoPedido", JSON.stringify(order));
    if (order?.id) {
      localStorage.setItem("ultimoPedidoId", String(order.id));
    }
  } catch (error) {
    console.warn("No se pudo guardar el último pedido:", error);
  }
};


const createStore = () => {
  return new Vuex.Store({
    state: {
      products: [],
      categories: [],
      filteredProducts: [],
      product: {},
      orders: [],
      cart: {
        items: [],
      },
    },
    mutations: {
      setProducts(state, products) {
        state.products = products;
      },
      setFilteredProducts(state, filteredProducts) {
        state.filteredProducts = filteredProducts;
      },
      setCategories(state, categories) {
        state.categories = categories;
      },
      setProduct(state, product) {
        state.product = product;
      },
      setOrders(state, orders) {
        state.orders = orders;
      },
      addItemToCart(state, item) {
        const newItem = {
          ...item,
          uid: Date.now() + Math.random(), // UID único por si querés identificarlo luego
        };

        state.cart.items.push(newItem);
      },
      removeItem(state, payload) {
        const index = state.cart.items.findIndex((item) => item.id === payload.id);
        if (index !== -1) {
          state.cart.items.splice(index, 1);
        }
      },
      vaciarCarrito(state) {
        state.cart.items = [];
      },
      UPDATE_PRODUCT_IMAGE(state, { productId, imageIndex, newImageUrl }) {
        const product = state.products.find((p) => p.id === productId);
        if (product) {
          product.images[imageIndex] = newImageUrl;
        }
      },
    },
    getters: {
      cartItems(state) {
        return state.cart.items;
      },
      cartSubtotal(state) {
        return state.cart.items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
      },
      cartDiscount(state, getters) {
        const cantidad = getters.cartItems.length;
        if (cantidad === 1) return 0;
        if (cantidad === 2) return 2000 * cantidad;
        if (cantidad >= 3) return 3000 * cantidad;
        return 0;
      },
      cartTotalWithDiscount(state, getters) {
        return getters.cartSubtotal - getters.cartDiscount;
      },
      cartTotal(state, getters) {
        // Para compatibilidad, cartTotal será igual a cartTotalWithDiscount
        return getters.cartTotalWithDiscount;
      },
    },
    actions: {
      async crearPedidoContraEntrega({ state, commit }, datosCliente = {}) {
        try {
          const itemsOrigen = state.cart.items.length
            ? state.cart.items
            : datosCliente.productos || [];

          const cartItems = buildCartItemsPayload(itemsOrigen);
          if (!cartItems.length) {
            throw new Error("El carrito está vacío");
          }

          const customer = buildCustomerPayload(datosCliente);
          const reference =
            String(datosCliente.referencia || datosCliente.referenciaPedido || "").trim() ||
            `pedido-${Date.now()}`;

          const response = await fetch("/.netlify/functions/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer,
              cartItems,
              payment: {
                method: "ContraEntrega",
                reference,
              },
            }),
          });

          const result = await response.json();
          if (!response.ok) {
            const message = result?.error || "Error al crear pedido contra entrega";
            throw new Error(message);
          }

          commit("vaciarCarrito");
          storeLastOrder({ ...result.order, id: result.id });

          return result.id;
        } catch (error) {
          console.error("Error al crear pedido contra entrega:", error);
          throw error;
        }
      },
      async crearPedidoWompi({ state, commit }, datosCliente = {}) {
        try {
          const itemsOrigen = state.cart.items.length
            ? state.cart.items
            : datosCliente.productos || [];
          const cartItems = buildCartItemsPayload(itemsOrigen);
          if (!cartItems.length) {
            throw new Error("El carrito está vacío");
          }

          const customer = buildCustomerPayload(datosCliente);
          const transactionId =
            String(
              datosCliente.transactionId ||
                datosCliente.id ||
                (datosCliente.transaction && datosCliente.transaction.id) ||
                ""
            ).trim();

          if (!transactionId) {
            throw new Error("ID de transacción de Wompi requerido");
          }

          const reference =
            String(
              datosCliente.referencia ||
                (datosCliente.transaction && datosCliente.transaction.reference) ||
                ""
            ).trim() || `pedido-${Date.now()}`;

          const response = await fetch("/.netlify/functions/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customer,
              cartItems,
              payment: {
                method: "Wompi",
                transactionId,
                reference,
              },
            }),
          });

          const result = await response.json();
          if (!response.ok) {
            const message = result?.error || "Error al crear pedido con Wompi";
            throw new Error(message);
          }

          commit("vaciarCarrito");
          storeLastOrder({ ...result.order, id: result.id });

          return result.id;
        } catch (error) {
          console.error("Error al crear pedido con Wompi:", error);
          throw error;
        }
      },
      
      enviarOrden({ getters }) {
        const number = "+573150361379";
        const pedido = getters.cartItems
          .map((item) => `x${item.qty} ${item.name}`)
          .join(" || ");
        const total = getters.cartTotal;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(
          `Pedido: ${pedido}. **SUBTOTAL: ${total}**`
        )}`;
        window.open(whatsappUrl);
      },

      addToCart({ commit }, { product, quantity, color }) {
        // Asegurarse de que el precio sea un número
        const priceNumber = Number(product.price);
        commit("addItemToCart", {
          id: product.id,
          name: product.name,
          image: product.images[0],
          qty: quantity,
          category: product.category,
          price: priceNumber,
          color: color
        });
      },
      async fetchProducts({ commit }) {
        try {
          const response = await db.collection("products").get();
          const products = response.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          commit("setProducts", products);
          commit("setFilteredProducts", products);
        } catch (error) {
          console.error("Error fetching products:", error);
        }
      },
      async fetchCategories({ commit }) {
        try {
          const response = await db.collection("categories").get();
          const categories = response.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          commit("setCategories", categories);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      },
      async addCategory({ dispatch }, name) {
        try {
          const trimmed = String(name || "").trim();
          if (!trimmed) {
            throw new Error("El nombre de la categoría es obligatorio");
          }
          const handle = trimmed.toLowerCase().replace(/\s+/g, "-");
          const docRef = await db.collection("categories").add({
            name: trimmed,
            handle,
            createdAt: Date.now(),
          });
          await docRef.update({ id: docRef.id });
          await dispatch("fetchCategories");
        } catch (error) {
          console.error("Error al crear la categoría:", error);
          throw error;
        }
      },
      async updateCategory({ dispatch }, { id, name }) {
        try {
          if (!id) throw new Error("Falta el ID de la categoría");
          const trimmed = String(name || "").trim();
          if (!trimmed) {
            throw new Error("El nombre de la categoría es obligatorio");
          }
          const handle = trimmed.toLowerCase().replace(/\s+/g, "-");
          await db.collection("categories").doc(id).update({
            name: trimmed,
            handle,
            updatedAt: Date.now(),
          });
          await dispatch("fetchCategories");
        } catch (error) {
          console.error("Error al actualizar la categoría:", error);
          throw error;
        }
      },
      async deleteCategory({ dispatch }, id) {
        try {
          if (!id) throw new Error("Falta el ID de la categoría");
          await db.collection("categories").doc(id).delete();
          await dispatch("fetchCategories");
        } catch (error) {
          console.error("Error al eliminar la categoría:", error);
          throw error;
        }
      },
      async fetchProductBySlug({ commit }, slug) {
        try {
          const ref = db.collection("products").where("handle", "==", slug);
          const snapshot = await ref.get();
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            commit("setProduct", {
              id: doc.id,
              ...doc.data(),
            });
          } else {
            commit("setProduct", {});
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          commit("setProduct", {});
        }
      },
      async filterProducts({ commit }, category) {
        try {
          let query = db.collection("products");

          // Si se ha seleccionado una categoría específica, hacer la consulta filtrada
          if (category !== "") {
            query = query.where("category", "==", category);
          }

          const snapshot = await query.get();
          const filteredProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          commit("setFilteredProducts", filteredProducts);
        } catch (error) {
          console.error("Error filtering products:", error);
        }
      },
      async updateProduct({ commit }, product) {
        try {
          if (!product.id) {
            throw new Error("El producto no tiene id");
          }
          const productRef = db.collection("products").doc(product.id);
          // Elimina cualquier campo undefined antes de actualizar
          const cleanProduct = {};
          Object.keys(product).forEach(key => {
            if (product[key] !== undefined) {
              cleanProduct[key] = product[key];
            }
          });
          await productRef.update(cleanProduct);
          console.log("Producto actualizado correctamente");
          // Refresca productos después de actualizar
          const response = await db.collection("products").get();
          const products = response.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          commit("setProducts", products);
        } catch (error) {
          console.error("Error al actualizar el producto:", error);
          throw error;
        }
      },

      async uploadImage({ commit }, { file, oldImageUrl, productName }) {
        try {
          const storageRef = firebase.storage().ref();

          // Ruta específica para la imagen del producto
          const fileRef = storageRef.child(`products/${productName}/${file.name}`);

          // Subir la nueva imagen
          const snapshot = await fileRef.put(file);
          const downloadURL = await snapshot.ref.getDownloadURL();

          // Eliminar la imagen anterior si existe
          if (oldImageUrl) {
            const oldFileRef = storageRef.storage.refFromURL(oldImageUrl);
            await oldFileRef.delete();
          }

          return downloadURL;
        } catch (error) {
          console.error("Error al manejar la imagen:", error);
          throw error;
        }
      },
      async updateProductImage({ commit }, { productId, imageIndex, newImageUrl }) {
        try {
          const productRef = firebase.firestore().collection("products").doc(productId);

          // Obtener el producto actual
          const productDoc = await productRef.get();
          if (!productDoc.exists) throw new Error("Producto no encontrado");

          const productData = productDoc.data();
          const updatedImages = [...productData.images];
          updatedImages[imageIndex] = newImageUrl;

          // Actualizar el array de imágenes en Firestore
          await productRef.update({ images: updatedImages });

          // Opcional: actualizar el store localmente
          commit("UPDATE_PRODUCT_IMAGE", { productId, imageIndex, newImageUrl });
        } catch (error) {
          console.error("Error al actualizar la imagen en el producto:", error);
          throw error;
        }
      },

      async addProduct({ commit }, product) {
        try {
          const storageRef = firebase.storage().ref();
          const imageUrls = [];

          // Subir todas las imágenes seleccionadas
          for (const image of product.images) {
            const imageRef = storageRef.child(`products/${product.name}/${image.name}`);
            const snapshot = await imageRef.put(image);
            const downloadURL = await snapshot.ref.getDownloadURL();
            imageUrls.push(downloadURL);
          }

          // Agregar las URLs de las imágenes al producto
          product.images = imageUrls;

          // Crear el documento en Firestore y obtener el ID
          const docRef = await db.collection("products").add(product);
          const productId = docRef.id;

          // Actualizar el producto en Firestore con su ID
          await db.collection("products").doc(productId).update({ id: productId });

          // Refrescar productos después de agregar uno nuevo
          const response = await db.collection("products").get();
          const products = response.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          commit("setProducts", products);
        } catch (error) {
          console.error("Error adding product:", error);
        }
      },

      async deleteProduct({ commit, dispatch }, id) {
        try {
          const ref = db.collection("products").doc(id);
          const doc = await ref.get();

          if (!doc.exists) {
            throw new Error("Producto no encontrado");
          }

          const data = doc.data();
          const imageUrl = data.image;

          await ref.delete();
          console.log("Documento eliminado correctamente");

          if (imageUrl) {
            const storageRef = firebase.storage().refFromURL(imageUrl);
            await storageRef.delete();
            console.log("Imagen eliminada de Firebase Storage.");
          }

          // Refresca los productos después de eliminar uno
          await dispatch("fetchProducts");
        } catch (error) {
          console.error("Error al eliminar el producto:", error);
          throw error;
        }
      },
      async fetchOrders({ commit }) {
        try {
          const snapshot = await db
            .collection("pedidos")
            .orderBy("fecha", "desc")
            .get();
          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          commit("setOrders", orders);
        } catch (error) {
          console.error("Error al obtener pedidos:", error);
          throw error;
        }
      },

      async actualizarEstadoPedido({ }, { id, estado }) {
        try {
          const currentUser = firebase.auth().currentUser;
          if (!currentUser) {
            throw new Error("No hay sesión activa");
          }

          const token = await currentUser.getIdToken();
          const response = await fetch('/.netlify/functions/admin-update-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ id, estado }),
          });

          if (!response.ok) {
            const detalle = await response.text();
            throw new Error(detalle || 'No se pudo actualizar el pedido');
          }
        } catch (error) {
          console.error("Error al actualizar el estado del pedido:", error);
          throw error;
        }
      },
    },
  });
};

export default createStore;
