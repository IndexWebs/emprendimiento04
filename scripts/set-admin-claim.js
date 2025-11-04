require('dotenv').config();
const getFirebaseAdmin = require('../netlify/functions/_firebaseAdmin');

const admin = getFirebaseAdmin();
const uid = process.argv[2];

if (!uid) {
  console.error('Uso: node scripts/set-admin-claim.js <UID>');
  process.exit(1);
}

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Claim admin asignado a ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error asignando el claim:', err);
    process.exit(1);
  });
