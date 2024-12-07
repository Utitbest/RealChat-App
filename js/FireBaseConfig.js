
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, onSnapshot, where, 
  serverTimestamp, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js';
import { getStorage, uploadBytes, getDownloadURL, ref, uploadBytesResumable } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";

export default class FirebaseService {
  constructor(config) {
    this.app = initializeApp(config);
    this.db = getFirestore();
    this.auth = getAuth();
    this.storage = getStorage();
  }

  // Display toast notifications
  showToast(message, type = "success") {
    Toastify({
      text: message,
      duration: 4000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: type === "success" ? "green" : "red",
    }).showToast();
  }

  

  async uploadProfilePicture(file, userId) {
    try {
        const storageRef = firebase.storage().ref(`profile_pictures/${userId}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile picture:", error);
        throw new Error("Failed to upload profile picture.");
    }
}

async getCurrentUserId() {
  const user = this.auth.currentUser;
  if (user) {
      return user.uid;
  } else {
      throw new Error("No user is currently logged in.");
  }
}

  async createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), data);
      this.showToast("Document created successfully!");
      return docRef.id;
    } catch (error) {
      this.showToast(`Error creating document: ${error.message}`, "error");
      throw error;
    }
  }

  async readDocument(collectionName, documentId) {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.showToast("Document retrieved successfully!");
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        this.showToast("No such document found", "error");
        return null;
      }
    } catch (error) {
      this.showToast(`Error reading document: ${error.message}`, "error");
      throw error;
    }
  }

  async readAllDocuments(collectionName) {
    try {
      const snapshot = await getDocs(collection(this.db, collectionName));
      this.showToast("All documents retrieved successfully!");
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.showToast(`Error reading documents: ${error.message}`, "error");
      throw error;
    }
  }

  async updateDocument(collectionName, documentId, data) {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await updateDoc(docRef, data);
      this.showToast("Document updated successfully!");
    } catch (error) {
      this.showToast(`Error updating document: ${error.message}`, "error");
      throw error;
    }
  }

  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = doc(this.db, collectionName, documentId);
      await deleteDoc(docRef);
      this.showToast("Document deleted successfully!");
    } catch (error) {
      this.showToast(`Error deleting document: ${error.message}`, "error");
      throw error;
    }
  }

  async registerUser(credentials, userData) {
    try {
      const { email, password } = credentials;
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const userId = userCredential.user.uid;

      // Store user data in Firestore using UID as document ID
      await setDoc(doc(this.db, "users", userId), {
        uid: userId,
        ...userData,
        createdAt: new Date()
      });

      this.showToast("User registered successfully!");
      return userId;
    } catch (error) {
      this.showToast(`Error registering user: ${error.message}`, "error");
      throw error;
    }
  }

  async getUserData(uid) {
    const userDoc = await getDoc(doc(this.db, "users", uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() }; // Return user data along with the ID
    } else {
      throw new Error("User not found");
    }
  }
  async loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.showToast("Login successful!");
      return userCredential.user.uid;
    } catch (error) {
      this.showToast(`Error logging in: ${error.message}`, "error");
      throw error;
    }
  }

  async getAllUsers() {
    try {
        const usersSnapshot = await getDocs(collection(this.db, "users"));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return users;
    } catch (error) {
        console.error("Error retrieving users:", error);
        throw error;
    }
}



async sendMessage(chatId, senderId, recipientId, messageContent) {
  try {
      const chatRef = doc(this.db, "chats", chatId);
      const chatMessagesRef = collection(chatRef, "messages");

      // Ensure the chat document exists
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
          await setDoc(chatRef, {
              lastMessage: messageContent,
              lastMessageTimestamp: serverTimestamp(),
              participants: [senderId, recipientId],
          });
      }

      // Add message to messages subcollection
      const messageData = {
        senderId,
        recipientId,
        content: messageContent,
        timestamp: serverTimestamp(), // Always include this
    };
    
      await addDoc(chatMessagesRef, messageData);

      // Update parent chat document
      await updateDoc(chatRef, {
          lastMessage: messageContent,
          lastMessageTimestamp: serverTimestamp(),
      });

      
  } catch (error) {
      console.error("Error sending message:", error);
  }
}



// async sendMessage(chatId, senderId, recipientId, messageContent) {
//   try {
//     if (!chatId || typeof chatId !== "string") throw new Error("Invalid chatId");
//     if (!senderId || typeof senderId !== "string") throw new Error("Invalid senderId");
//     if (!recipientId || typeof recipientId !== "string") throw new Error("Invalid recipientId");
//     if (!messageContent || typeof messageContent !== "string") throw new Error("Invalid messageContent");

//       const chatRef = doc(this.db, "chats", chatId);
//       const chatMessagesRef = collection(chatRef, "messages");

//       // Ensure the chat document exists
//       const chatDoc = await getDoc(chatRef);
//       if (!chatDoc.exists()) {
//           await setDoc(chatRef, {
//               lastMessage: messageContent,
//               lastMessageTimestamp: serverTimestamp(),
//               participants: [senderId, recipientId],
//           });
//       }

//       // Add message to messages subcollection
//       const messageData = {
//         senderId,
//         recipientId,
//         content: messageContent,
//         timestamp: serverTimestamp(), // Always include this
//     };
    
//       await addDoc(chatMessagesRef, messageData);

//       // Update parent chat document
//       await updateDoc(chatRef, {
//           lastMessage: messageContent,
//           lastMessageTimestamp: serverTimestamp(),
//       });
//   } catch (error) {
//       console.error("Error sending message:", error);
//   }
// }



async addMessageToChat(chatId, messageData) {
  const chatRef = doc(this.db, "chats", chatId);
  const chatMessagesRef = collection(chatRef, "messages");
  await addDoc(chatMessagesRef, messageData);
}

async getLastMessage(chatId) {
  const chatDoc = await getDoc(doc(this.db, "chats", chatId));
  if (chatDoc.exists()) {
      return chatDoc.data().lastMessage || "No messages yet";
  }
  return "No messages yet";
}

async getLastMessage1(chatId) {
  const chatDoc = await getDoc(doc(this.db, "chats", chatId));
  if (chatDoc.exists()) {
      const chatData = chatDoc.data();
      return {
          text: chatData.lastMessage || "No messages yet",
          timestamp: chatData.lastMessageTimestamp, // Ensure timestamp is included
      };
  }
  if(!chatDoc.exists()){
    return {
      text: "No messages yet",
      timestamp: '', // Default value if no message or timestamp exists
    };
  }
  
}



// async listenForMessages(chatId, callback) {
//   try {
//       const messagesRef = collection(this.db, "chats", chatId, "messages");
//       const q = query(messagesRef, orderBy("timestamp", "asc"));

//       onSnapshot(q, (snapshot) => {
//           const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//           callback(messages);
//       });
//   } catch (error) {
//       console.error("Error listening for messages:", error);
//   }
// }


async listenForMessages(chatId, callback) {
  try {
      const messagesRef = collection(this.db, "chats", chatId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));

      onSnapshot(q, (snapshot) => {
          const messages = snapshot.docs.map((doc) => {
              const data = doc.data();
              
              // Ensure the timestamp field exists and is valid
              const validTimestamp = data.timestamp || { seconds: 0, nanoseconds: 0 };

              return {
                  id: doc.id,
                  ...data,
                  timestamp: validTimestamp || null, // Provide default if missing
              };
          });

          // Pass the messages to the callback function
          callback(messages);
      });
  } catch (error) {
      console.error("Error listening for messages:", error);
  }
}
  

}

