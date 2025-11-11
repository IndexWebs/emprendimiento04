import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/firebase-auth'

if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: "AIzaSyD9Wc3UBZb4YPZxLq52QiAEipk7en4v8Ns",
    authDomain: "atscanner-1c6bc.firebaseapp.com",
    projectId: "atscanner-1c6bc",
    storageBucket: "atscanner-1c6bc.firebasestorage.app",
    messagingSenderId: "860316812760",
    appId: "1:860316812760:web:908920c0b911aacb881ead",
    measurementId: "G-N4FS19K1E8"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
}
const db = firebase.firestore()
export { db, firebase }
