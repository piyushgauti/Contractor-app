import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBiSDXmRpUpuJp525SjsiVK3ae_mcePI-M",
  authDomain: "contractor-app-e7ec6.firebaseapp.com",
  projectId: "contractor-app-e7ec6",
  storageBucket: "contractor-app-e7ec6.firebasestorage.app",
  messagingSenderId: "297341127621",
  appId: "1:297341127621:web:3dd021d5ebd6602ebe99ac"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)