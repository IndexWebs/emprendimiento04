const firebase = require('firebase/app');
require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDLQV1hup5UJw7pYbqFu6eVUQxs6wHn0w8',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'emprendimiento-03-52bab.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'emprendimiento-03-52bab',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const orderId = (params.orderId || '').trim();
    const transactionId = (params.transactionId || '').trim();

    if (!orderId && !transactionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'orderId_or_transactionId_required' }),
      };
    }

    let snapshot;

    if (orderId) {
      const doc = await db.collection('pedidos').doc(orderId).get();
      if (!doc.exists) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'order_not_found' }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ id: doc.id, order: doc.data() }),
      };
    }

    snapshot = await db
      .collection('pedidos')
      .where('transactionId', '==', transactionId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'order_not_found' }),
      };
    }

    const doc = snapshot.docs[0];
    return {
      statusCode: 200,
      body: JSON.stringify({ id: doc.id, order: doc.data() }),
    };
  } catch (error) {
    console.error('[get-order] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'internal_error' }),
    };
  }
};
