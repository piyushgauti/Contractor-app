import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore"
import { db } from "./config"

// Fetch all contractors from Firestore
export const fetchContractors = async () => {
  try {
    const snapshot = await getDocs(collection(db, "contractors"))
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error("Error fetching contractors:", error)
    return []
  }
}

// Fetch a single contractor by ID
export const fetchContractorById = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "contractors", uid))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error("Error fetching contractor:", error)
    return null
  }
}

// Send a message
export const sendMessage = async (senderId, receiverId, text) => {
  try {
    // chat ID is always the two UIDs sorted and joined — same for both sides
    const chatId = [senderId, receiverId].sort().join("_")
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      receiverId,
      text,
      createdAt: serverTimestamp()
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Listen to messages in real time
export const listenToMessages = (senderId, receiverId, callback) => {
  const chatId = [senderId, receiverId].sort().join("_")
  
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc")
  )

  // onSnapshot fires every time a new message arrives
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(messages)
  })
}