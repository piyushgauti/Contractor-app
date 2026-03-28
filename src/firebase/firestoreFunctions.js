import {
  collection,
  collectionGroup,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

// Fetch all contractors
export const fetchContractors = async () => {
  try {
    const snapshot = await getDocs(collection(db, "contractors"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return [];
  }
};

// Fetch single contractor by ID
export const fetchContractorById = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "contractors", uid));
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
    return null;
  } catch (error) {
    console.error("Error fetching contractor:", error);
    return null;
  }
};

// Update contractor profile
export const updateContractorProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, "contractors", uid), data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload photo to Firebase Storage
export const uploadPhoto = async (uid, file, projectIndex) => {
  try {
    const path = `contractors/${uid}/work/${projectIndex}_${Date.now()}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return { success: true, url };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add photo URL to a work history project
export const addPhotoToProject = async (uid, projectIndex, photoUrl) => {
  try {
    const contractor = await fetchContractorById(uid);
    if (!contractor) return { success: false, error: "Contractor not found" };

    const workHistory = [...(contractor.workHistory || [])];
    if (!workHistory[projectIndex])
      return { success: false, error: "Project not found" };

    workHistory[projectIndex] = {
      ...workHistory[projectIndex],
      photos: [...(workHistory[projectIndex].photos || []), photoUrl],
    };

    await updateDoc(doc(db, "contractors", uid), { workHistory });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add a review to a contractor
export const addReview = async (contractorId, review) => {
  try {
    const contractorRef = doc(db, "contractors", contractorId);
    const contractorSnap = await getDoc(contractorRef);
    if (!contractorSnap.exists())
      return { success: false, error: "Contractor not found" };

    const data = contractorSnap.data();
    const reviews = data.reviews || [];
    const newReview = {
      ...review,
      createdAt: new Date().toISOString(),
    };

    // recalculate rating
    const allReviews = [...reviews, newReview];
    const newRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await updateDoc(contractorRef, {
      reviews: arrayUnion(newReview),
      rating: Math.round(newRating * 10) / 10,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Send a message
  export const sendMessage = async (
    senderId,
    receiverId,
    text,
    senderName = "Guest",
    receiverName = "Contractor",
  ) => {
    try {
      const chatId = [senderId, receiverId].sort().join("_");
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId,
        receiverId,
        text,
        senderName,
        receiverName,
        read: false,
        createdAt: serverTimestamp(),
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };


// Listen to messages in real time
export const listenToMessages = (senderId, receiverId, callback) => {
  const chatId = [senderId, receiverId].sort().join("_");
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

// Listen to all chats for a contractor (dashboard)
export const listenToContractorChats = (contractorId, callback) => {
  // query messages collection group across all chats
  const q = query(
    collectionGroup(db, "messages"),
    where("receiverId", "==", contractorId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    // group messages by chatId
    const chatMap = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const chatId = doc.ref.parent.parent.id;
      if (!chatMap[chatId]) {
        chatMap[chatId] = {
          chatId,
          lastMessage: data.text,
          senderId: data.senderId,
          senderName: data.senderName || "Guest",
          createdAt: data.createdAt,
        };
      }
    });
    callback(Object.values(chatMap));
  });
};

// Listen to unread message count for a user
export const listenToUnreadCount = (userId, callback) => {
  const q = query(
    collectionGroup(db, "messages"),
    where("receiverId", "==", userId),
    where("read", "==", false),
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.length);
  });
};

// Mark all messages in a chat as read
export const markMessagesAsRead = async (senderId, receiverId) => {
  try {
    const chatId = [senderId, receiverId].sort().join("_");
    const q = query(
      collection(db, "chats", chatId, "messages"),
      where("read", "==", false),
      where("receiverId", "==", receiverId),
    );
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map((d) => updateDoc(d.ref, { read: true }));
    await Promise.all(updates);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
// Listen to all chats for a customer (sent messages)
export const listenToCustomerChats = (customerId, callback) => {
  const q = query(
    collectionGroup(db, "messages"),
    where("senderId", "==", customerId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(q, async (snapshot) => {
    const chatMap = {};
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const chatId = doc.ref.parent.parent.id;
      if (!chatMap[chatId]) {
        chatMap[chatId] = {
          chatId,
          lastMessage: data.text,
          receiverId: data.receiverId,
          receiverName: data.receiverName || "Contractor",
          createdAt: data.createdAt,
        };
      }
    });
    callback(Object.values(chatMap));
  });
};
