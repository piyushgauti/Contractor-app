import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./config"

// Register a new contractor
export const registerContractor = async (formData) => {
  try {
    // create the user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    )

    const user = userCredential.user

    // save contractor profile in Firestore
    await setDoc(doc(db, "contractors", user.uid), {
      uid: user.uid,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      state: formData.state,
      city: formData.city,
      experience: Number(formData.experience),
      about: formData.about,
      specialties: formData.specialties,
      specialty: formData.specialties[0] || "",
      location: formData.city,
      grade: "B",
      rating: 0,
      projects: 0,
      available: true,
      workHistory: [],
      createdAt: new Date().toISOString()
    })

    return { success: true, uid: user.uid }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Login existing contractor
export const loginContractor = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, uid: userCredential.user.uid }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Logout
export const logoutContractor = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Listen to auth state — tells us if user is logged in or not
export const listenToAuthState = (callback) => {
  return onAuthStateChanged(auth, callback)
}