import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-auth.js";
import FirebaseService from './FireBaseConfig.js';
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js";
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, setDoc, onSnapshot, where, 
    serverTimestamp, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyB6tpiYpOYmh9z2LCzWClPhC4IJCWgBaMc",
    authDomain: "utitbest-realchat.firebaseapp.com",
    projectId: "utitbest-realchat",
    storageBucket: "utitbest-realchat.appspot.com",
    messagingSenderId: "904249328831",
    appId: "1:904249328831:web:d60acbc92f7db54f0bb20a"
};


const firebaseService = new FirebaseService(firebaseConfig);

const firebaseApp = initializeApp(firebaseConfig); // Initialize Firebase
const storage = getStorage(firebaseApp); // Get Firebase Storage instance


const auth = firebaseService.auth;

// let currentUserId;   // Stores the logged-in user's ID
let currentUserId = firebaseService.auth.currentUser?.uid; // Make sure user is logged in
let otherUserId

let chatId = [currentUserId, otherUserId].sort().join('_');

var contentdrop = document.querySelectorAll('.comeins i');
var settings = document.querySelectorAll('.listOfcontents')
var droplist = document.querySelector('.dropdown1')
var containerRpy = document.querySelector('.contnet2')
var iconsdem = document.querySelectorAll('.iconsdem span');
var settingsPopup = document.querySelector('.settingsPopup')
var secondusers = document.querySelector('.secondusers')
var sendbutton = document.querySelector('.inputing div span')
var chatInputText = document.querySelector('.inputing div input')
var chatlies1 = document.querySelector('.chatlies1')
var Chatterinfordisply = document.querySelector('.chattername h3')
var profile = document.querySelector('.informs img')
var inputtag = document.querySelector('.nothings')
const maximum = 7;




function Settings(){
    settings[1].addEventListener('click', function(){
        containerRpy.innerHTML = `
            <div class="Chat">
                <h2>Chats</h2>
                <button>Clear all messages</button>
                <p>Delete all messages from chats</p>
            </div>
        `;
    })


    
    settings[2].addEventListener('click', function(){
        containerRpy.innerHTML = `
            <div class="vid_voce">
                <h2>Voice</h2>
                <h5>Microphone</h5>
                <div class="testingmicro">
                    <i class="fa fa-microphone"></i>
                    <h5>Device microphone</h5>
                </div>
                <div class="testingmicro1">
                    <h5>Speak into your device mic</h5>
                    <div class="">
                            <i class="fa fa-microphone"></i>
                            <progress max="100" min="0" value=""></progress>
                    </div>
                </div>
                <div class="speakers">
                    <h5>Speakers</h5>
                    <div class="Xbass">
                        <i class="fa fa-volume-up"></i>
                        <h5 style="padding-left:0;">Device speakers</h5>
                    </div>
                    <button class="">Click to test speak..</button>
                </div>
            </div>
        `;
    })

    settings[3].addEventListener('click',function(){
        containerRpy.innerHTML = `
            <div class="Customize">
                <p class="fa-shake">&#128540;</p>
                <h2 class="fa-bounce">COMING SOON!!</h2>
            </div>
        `;
    })
}
Settings()


// Set up user authentication and fetch logged-in user's data
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                currentUserId = user.uid;
                const userData = await firebaseService.getUserData(currentUserId);
                settings[0].addEventListener('click', function(){
                    containerRpy.innerHTML =  `
                        <div class="Profile_i">
                        <h2>Profile</h2>
                            <label for="eel">
                                <img src="./Super icons/f4c1820a-74a2-4fb3-ab1f-bfc13b1db462.jfif" alt="">
                                <i class="fa fa-edit rr"></i>
                            </label>
                           <input type="file" accept="image/*" id="eel" class="nothings">
                           <div class="namecoms">
                                <div class="informs" title="Firstname">
                                    <p>${userData.firstname}</p>
                                    <span class="EditName">
                                        <i class="fa fa-edit"></i>
                                    </span>
                                </div>
                                <div style="margin-top:.6em;" class="informs" title="Lastname">
                                    <p>${userData.lastname}</p>
                                    <span class="EditName">
                                        <i class="fa fa-edit"></i>
                                    </span>
                                </div>
                                <div style="margin-top:.6em;" class="informs" title="Email">
                                    <p>${userData.email}</p>
                                    <span class="EditName">
                                        <i class="fa fa-edit"></i>
                                    </span>
                                </div>
                                <button style="margin-top:5em;" type="button">Log out</button>
                           </div>
                        </div>
                    `;
                    Tologout()
                    updateprofilepic()
                })

            } catch (error) {
                console.error("Error retrieving user data:", error);
            }
        } else {
            window.location.href = './indexLogin.html';
        }
    });
});



function updateprofilepic(){
     inputtag = document.querySelector('.nothings')
     inputtag.addEventListener("change", async(event) =>{
     profile = document.querySelector('.informs img')

    try {
        let profilePictureFile = event.target.files;


        if (!profilePictureFile) {
            throw new Error("No file selected.");
        }

        const currentUserId = firebaseService.getCurrentUserId(); // Ensure this function exists
        const storageRef = getStorage(firebaseApp); // Replace firebaseApp with your Firebase app instance
        const profilePicRef = ref(storageRef, `profilePictures/${currentUserId}`);

        // Upload file
        const uploadTask = uploadBytesResumable(profilePicRef, profilePictureFile);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                throw new Error(`Error during upload: ${error.message}`);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Profile picture uploaded:", downloadURL);

                // Optionally: Update Firestore with profile picture URL
                await firebaseService.updateUserProfile(currentUserId, { profilePicture: downloadURL });
                alert("Profile picture uploaded successfully.");
            }
        );
    } catch (error) {
        console.error("Error uploading profile picture:", error);
    }
});

}


async function loadAllUsers() {
    try{
        const users = await firebaseService.getAllUsers();
        if(users.length === 0){
            secondusers.innerHTML = 'No other users found.';
            return
        }
        users.forEach((user) => {
            if(user.id !== currentUserId){  
                const userElement = document.createElement("div");
                userElement.className = 'individualchat';
                userElement.setAttribute('data-user-id', user.id)
                userElement.innerHTML = `
                    <div style="display: flex; width: 100%; height: 100%; align-items: center;">
                        <div style="display: flex; align-items: center; justify-content: center; width: 20%; height: 100%; position: relative;" class="allactaive">
                        <span class="user-status" style="position: absolute; top:11px; left:5px; border-radius:50%; width:7px; height:7px;"></span>
                            <figure>
                                <img src="./Super icons/manssincon.png" alt="">
                            </figure>
                        </div>
                        <div style="display: flex; align-items: center; width: 80%; height: 100%;">
                            <div class="username_chat">
                                <h3>${user.firstname + ' '+ user.lastname}</h3>
                                <p>Last message preview</p>
                            </div>
                            <div class="times">
                                <p>20:30</p>
                                <span>
                                    <span></span>
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Set otherUserId and chatId when a user is clicked
                userElement.addEventListener('click', async() => {
                    otherUserId = user.id;
                    chatId = [currentUserId, otherUserId].sort().join('_'); // Create unique chatId for the two users
                    // alert('ehoo')
                    Chatterinfordisply.innerHTML = user.firstname + user.lastname;
                    const lastMessage = await firebaseService.getLastMessage([currentUserId, user.id].sort().join('_'));
                    userElement.querySelector('.username_chat p').textContent = lastMessage;
                    
                    initializeChat(chatId, otherUserId); 
                });
                secondusers.appendChild(userElement);
                
            }

        });
    } catch (error) {
        console.error("Error loading users:", error);
    }
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid;

        // Set the user to active when they load the page
        updateUserStatus(userId, true);

        // Set the user to inactive when the page is closed or inactive
        window.addEventListener("beforeunload", () => {
            updateUserStatus(userId, false);
        });

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                updateUserStatus(userId, false);
            } else {
                updateUserStatus(userId, true);
            }
        });
    }
});

async function updateUserStatus(userId, isActive) {
    const userRef = doc(firebaseService.db, "users", userId); // Reference to the user's document
    try {
        await updateDoc(userRef, {
            isActive: isActive, // true for active, false for inactive
            lastActive: serverTimestamp(), // Update timestamp
        });
        console.log(`User status updated to ${isActive ? "online" : "offline"}`);
    } catch (error) {
        console.error("Error updating user status:", error);
    }
}

function listenForUserStatusUpdates() {
    const usersRef = collection(firebaseService.db, "users"); // Reference to the users collection

    // Listen for changes in the users' collection
    onSnapshot(usersRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            const userId = change.doc.id;
            const userData = change.doc.data();
            console.log(userId)
            if (change.type === "modified") {
                // Check if the isActive status changed
                if (userData.isActive !== undefined) {
                    updateUserUI(userId, userData.isActive); // Update the UI with the active status
                }
            }
        });
    });
}

function updateUserUI(userId, isActive) {
    const userElement = document.querySelector(`.individualchat[data-user-id="${userId}"]`);
    if (!userElement) {
        console.warn(`No DOM element found for userId: ${userId}`);
        return; // Skip updating the UI if the element is not found
    }
    console.log(userId)
    if (userElement) {
        const statusElement = userElement.querySelector(".allactaive span");
        if(!statusElement){
            console.warn(`No were to be found`)
            return;
        }
        statusElement.textContent = isActive ? "Online" : "Offline"; // Update the status display
        statusElement.className = `user-status ${isActive ? "online" : "offline"}`; // Add CSS classes
        alert(statusElement.className)
    }
}

listenForUserStatusUpdates();

async function fetchAndDisplayLastMessages() {
    try {
        // Get all users (excluding the current user)
        const users = await firebaseService.getAllUsers();
        if (!users || users.length === 0) {
            console.log("No users found.");
            return;
        }

        // Loop through each user to fetch their last chat message
        for (const user of users) {
            if (user.id !== currentUserId) { // Exclude the current user
                const chatId = [currentUserId, user.id].sort().join("_"); // Generate the chatId

                // Fetch the last message from Firestore
                const lastMessage = await firebaseService.getLastMessage1(chatId);
                // Find the corresponding DOM element for the user in the chat list
                const userElement = document.querySelector(
                    `.individualchat[data-user-id="${user.id}"]`
                );
                   
                if (userElement) {
                    const messagetime = userElement.querySelector('.times p')
                    const messagePreviewElement = userElement.querySelector(".username_chat p");
                    messagePreviewElement.textContent = lastMessage.text || "No messages yet";
                    if(messagePreviewElement.textContent.length > 25){
                        messagePreviewElement.textContent = messagePreviewElement.textContent.slice(0, 25) + '...'
                    } 
                    const sec = lastMessage.timestamp.seconds;
                    messagetime.textContent = getRelativeTime1(sec) || '';
                    if (messagetime.textContent.length > maximum) {
                        messagetime.textContent = messagetime.textContent.slice(0, maximum) + "...";
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error fetching and displaying last messages:", error);
    }
}

fetchAndDisplayLastMessages()


function getRelativeTime1(timestamp) {
    if(timestamp == null){
        return ''
    }
    const currentTime = new Date();
    const messageTime = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const timeDiff = currentTime - messageTime; // Difference in milliseconds

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (days > 0) {
        return days === 1 ? 'Yesterday' : `${days}days ago`;
    }
    if (hours > 0) return `${hours}hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes}minute${minutes > 1 ? 's' : ''}`;
    return `just now`;

}

function getRelativeTime(timestamp) {
    const currentTime = new Date();
    const messageTime = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const timeDiff = currentTime - messageTime; // Difference in milliseconds

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) {
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    }
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `Just now`; 
}


async function initializeChat(chatId, otherUserId) {
    try {

        // Real-time listener for messages in the chat
        firebaseService.listenForMessages(chatId, (messages) => {
            // Clear the chat UI before updating
            chatlies1.innerHTML = ""; 

            // Populate the chat UI with messages
            messages.forEach((message) => {
                const messageElement = document.createElement("div");
                const user_reponse = message.senderId === currentUserId;
                if(user_reponse){
                    messageElement.className = 'user_response';
                    messageElement.innerHTML = `
                    <div class="user_response1">
                        <div>
                            <p>${message.content}</p>
                            <span class="finn">
                                <i class="fa fa-check-double"></i>
                                <h6>${getRelativeTime(message.timestamp.seconds)}</h6>
                            </span>
                        </div>
                    </div>
                    `;
                }else{
                    messageElement.className = 'replyer';
                    messageElement.innerHTML = `
                    <div class="replyer1">
                        <figure>
                            <img src="./Super icons/f4c1820a-74a2-4fb3-ab1f-bfc13b1db462.jfif" alt="">
                        </figure>
                        <span>
                            <p>${message.content}</p>
                            <h6>${getRelativeTime(message.timestamp.seconds)}</h6>
                        </span>
                    </div>
                    `;
                }
                chatlies1.appendChild(messageElement);
            });

            // Scroll to the latest message
            chatlies1.scrollTop = chatlies1.scrollHeight;
        });
    } catch (error) {
        console.error("Error initializing chat:", error);
    }
}
    sendbutton.addEventListener("click", async function () {
        const messageContent = chatInputText.value.trim();
        if (messageContent){
            try {
                await firebaseService.sendMessage(
                    chatId, // Current chatId
                    currentUserId, // Sender (logged-in user)
                    otherUserId, // Recipient
                    messageContent // Message content
                );
                chatInputText.value = ""; // Clear the input field
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
});
    









function HideSettings(){
    iconsdem[2].addEventListener('click', function(){
        if(settingsPopup.classList.contains('steeze')){
            settingsPopup.classList.add('steeze1')
            settingsPopup.classList.remove('steeze')
        }
    })
}



async function logoutUser() {
    const auth = getAuth();
    try {
      await signOut(auth);
      window.location.href = './indexLogin.html';
    }catch(error) {
      console.error('Error logging out:', error);
      alert('Failed to log out. Please try again.');
    }
}
  
function Tologout(){
    let logoutbud = document.querySelector('.namecoms button')
    logoutbud.onclick = () => {
        logoutUser()
    }
}


function ContentDrop(){
    contentdrop[1].addEventListener('click', function(){
        if(droplist.classList.contains('insidehide')){
            droplist.classList.remove('insidehide')
            droplist.classList.add('outsideshow')
        }else{
            droplist.classList.remove('outsideshow')
            droplist.classList.add('insidehide')
        }
    })
}

window.onclick = function(event){
    if(!event.target.matches('.comeins i') && !event.target.matches('.dropdown1')){
        droplist.classList.remove('outsideshow')
        droplist.classList.add('insidehide')
    }
}

document.addEventListener('click', function(event){
    if( iconsdem[2].contains(event.target)){
        settingsPopup.classList.add('steeze1')
        settingsPopup.classList.remove('steeze')
    }else if(!settingsPopup.contains(event.target)){
        settingsPopup.classList.remove('steeze1')
        settingsPopup.classList.add('steeze')
    }
})
ContentDrop()
HideSettings()
document.addEventListener("DOMContentLoaded", loadAllUsers());
