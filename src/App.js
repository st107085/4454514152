import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth'; // Re-added signInAnonymously
import { MessageSquare, PlusCircle, LogIn, UserPlus, LogOut, Users, ChevronLeft } from 'lucide-react'; // For icons

// Global variables provided by the Canvas environment (for Canvas preview only)
// eslint-disable-next-line no-undef
const canvasAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Firebase Configuration (IMPORTANT: REPLACE ALL "YOUR_..." PLACEHOLDERS WITH YOUR ACTUAL FIREBASE PROJECT CONFIG) ---
// When deploying outside of Canvas (e.g., GitHub Pages), __firebase_config is not available.
// You MUST replace the placeholder values below with your actual Firebase project configuration.
// To get these values:
// 1. Go to your Firebase project in the Firebase Console: https://console.firebase.google.com/
// 2. Click on "Project settings" (the gear icon) in the left navigation.
// 3. Under "Your apps", select your web app (usually indicated by a `</>` icon).
// 4. Copy the `firebaseConfig` object provided there and paste it below.
const firebaseConfig = {
  apiKey: "AIzaSyC7fN4YKU8hBODHLPuYWmc_uMAarDkx1_M", // <-- REPLACED WITH YOUR ACTUAL API KEY
  authDomain: "w0d-af047.firebaseapp.com", // <-- REPLACED WITH YOUR ACTUAL AUTH DOMAIN
  projectId: "w0d-af047", // <-- REPLACED WITH YOUR ACTUAL PROJECT ID
  storageBucket: "w0d-af047.firebasestorage.app", // <-- REPLACED WITH YOUR ACTUAL STORAGE BUCKET
  messagingSenderId: "590475681719", // <-- REPLACED WITH YOUR ACTUAL MESSAGING SENDER ID
  appId: "1:590475681719:web:70fe72a37b39c07fdc5232", // <-- REPLACED WITH YOUR ACTUAL APP ID
  measurementId: "G-KHCH1GFKG3" // measurementId is optional and not directly used in this app's core functionality
};

// Use the Canvas-provided appId if available, otherwise use a default or derive from firebaseConfig.projectId
const appId = canvasAppId !== 'default-app-id' ? canvasAppId : firebaseConfig.projectId;


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Auth

// --- Helper function to generate a random password (no longer used for group founders, but kept if needed elsewhere) ---
const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

// --- Custom Authentication Data (Hardcoded for demonstration) ---
// This data is for client-side UI login only. Firebase Security Rules will use Firebase Auth UID.
const hardcodedUsers = {
    // Specific roles with provided passwords
    '團隊總理最高執行發布人': { password: 'dwr5aw0r1.2', username: '團隊總理最高執行發布人', uid: 'uid-team-premier', role: 'teamPremier' },
    '行政執行最高長': { password: '3rdfqw532.q3', username: '行政執行最高長', uid: 'uid-admin-chief', role: 'adminChief' },
    '行政執行最高秘書長': { password: 'fwq3rewr.3', username: '行政執行最高秘書長', uid: 'uid-admin-secretary', role: 'adminSecretary' },
    '行政執行訊息管理長': { password: 'rdsaww3r.rwr3t', username: '行政執行訊息管理長', uid: 'uid-admin-message', role: 'adminMessage' },
    '行政執行外交管理長': { password: 'sawdaqq.155e', username: '行政執行外交管理長', uid: 'uid-admin-diplomatic', role: 'adminDiplomatic' },
    '行政執行法律管理長': { password: 'qsdddwwwqe.1', username: '行政執行法律管理長', uid: 'uid-admin-legal', role: 'adminLegal' },
};

// Specific passwords for group founders provided by the user
const specificGroupFounderPasswords = {
    "group_founder_001": "pE9@F*&5Z!7q",
    "group_founder_002": "h$2#bT6@L!wV",
    "group_founder_003": "jK1%yR8&X*pW",
    "group_founder_004": "mN3^qS7#D!zU",
    "group_founder_005": "aB4*cV9$G@eY",
    "group_founder_006": "fC5&dX0!H#iO",
    "group_founder_007": "gD6@eY1%J*kP",
    "group_founder_008": "kE7#fZ2^L!mQ",
    "group_founder_009": "lF8$gA3*M@nR",
    "group_founder_010": "nJ9&hB4!O#sS",
    "group_founder_011": "oK0@iC5%P*tT",
    "group_founder_012": "qL1#jD6^R!uU",
    "group_founder_013": "sM2$kE7*S@vV",
    "group_founder_014": "tN3&lF8!U#wW",
    "group_founder_015": "vO4@mG9%X*yZ",
    "group_founder_016": "wP5#nJ0^Y!aB",
    "group_founder_017": "xQ6$oK1*Z@cD",
    "group_founder_018": "yR7&pL2!a#eF",
    "group_founder_019": "zS8@qM3%b*gH",
    "group_founder_020": "aT9#rN4^c!iJ",
    "group_founder_021": "bU0$sO5*d@kL",
    "group_founder_022": "cD1&tP6!e#mM",
    "group_founder_023": "eF2@uQ7%f*nO",
    "group_founder_024": "gH3#vR8^h!pQ",
    "group_founder_025": "iJ4$wS9*j@rS",
    "group_founder_026": "kL5&xT0!l#uV",
    "group_founder_027": "mM6@yU1%n*wX",
    "group_founder_028": "oP7#zV2^q!yZ",
    "group_founder_029": "rS8$aW3*s@bC",
    "group_founder_030": "tU9&bD4!u#eF",
    "group_founder_031": "vW0@cE5%v*gH",
    "group_founder_032": "xY1#dF6^x!iJ",
    "group_founder_033": "zZ2$eG7*z@kL",
    "group_founder_034": "aB3&fH8!a#mM",
    "group_founder_035": "cD4@gI9%c*nO`",
    "group_founder_036": "eF5#hJ0^e!pQ",
    "group_founder_037": "gH6$iK1*g@rS",
    "group_founder_038": "iJ7&jL2!i#uV",
    "group_founder_039": "kL8@kM3%k*wX",
    "group_founder_040": "mN9#lO4^m!yZ",
    "group_founder_041": "oP0$nQ5*o@bC",
    "group_founder_042": "qR1&pR6!q#eF",
    "group_founder_043": "sT2@sS7%s*gH",
    "group_founder_044": "uV3#tU8^u!iJ",
    "group_founder_045": "wX4$vW9*w@kL",
    "group_founder_046": "yZ5&xY0!y#mM",
    "group_founder_047": "aB6@zZ1%a*nO",
    "group_founder_048": "cD7#bA2^c!pQ",
    "group_founder_049": "eF8$dC3*e@rS",
    "group_founder_050": "gH9&fD4!g#uV",
    "group_founder_051": "iJ0@hE5%i*wX",
    "group_founder_052": "kL1#jF6^k!yZ",
    "group_founder_053": "mN2$lG7*m@bC",
    "group_founder_054": "oP3&nH8!o#eF",
    "group_founder_055": "qR4@pI9%q*gH",
    "group_founder_056": "sT5#rJ0^s!iJ",
    "group_founder_057": "uV6$tK1*u@kL",
    "group_founder_058": "wX7&vL2!w#mM",
    "group_founder_059": "yZ8@xM3%y*nO",
    "group_founder_060": "aB9#zN4^a!pQ",
    "group_founder_061": "cD0$bP5*c@rS",
    "group_founder_062": "eF1&dR6!e#uV",
    "group_founder_063": "gH2@fS7%g*wX",
    "group_founder_064": "iJ3#hT8^i!yZ",
    "group_founder_065": "kL4$jU9*k@bC",
    "group_founder_066": "mN5&lV0!m#eF",
    "group_founder_067": "oP6@nQ1%o*gH",
    "group_founder_068": "qR7#pS2^q!iJ",
    "group_founder_069": "sT8$rU3*s@kL",
    "group_founder_070": "uV9&tW4!u#mM",
    "group_founder_071": "wX0@vX5%w*nO",
    "group_founder_072": "yZ1#xY6^y!pQ",
    "group_founder_073": "aB2$zZ7*a@rS",
    "group_founder_074": "cD3&bA8!c#uV",
    "group_founder_075": "eF4@dC9%e*wX",
    "group_founder_076": "gH5#fD0^g!yZ",
    "group_founder_077": "iJ6$hE1*i@bC",
    "group_founder_078": "kL7&jF2!k#eF",
    "group_founder_079": "mN8@lG3%m*gH",
    "group_founder_080": "oP9#nH4^o!iJ",
    "group_founder_081": "qR0$pI5*q@kL",
    "group_founder_082": "sT1&rJ6!s#mM",
    "group_founder_083": "uV2@tK7%u*nO",
    "group_founder_084": "wX3#vL8^w!pQ",
    "group_founder_085": "yZ4$xM9*y@rS",
    "group_founder_086": "aB5&zN0!a#uV",
    "group_founder_087": "cD6@bP1%c*wX",
    "group_founder_088": "eF7#dR2^e!yZ",
    "group_founder_089": "gH8$fS3*g@bC",
    "group_founder_090": "iJ9&hT4!i#eF",
    "group_founder_091": "kL0@jU5%k*gH",
    "group_founder_092": "mN1#lV6^m!iJ",
    "group_founder_093": "oP2$nQ7*o@kL",
    "group_founder_094": "qR3&pS8!q#mM",
    "group_founder_095": "sT4@rU9%s*nO",
    "group_founder_096": "uV5#tW0^u!pQ",
    "group_founder_097": "wX6$vX1*w@rS",
    "group_founder_098": "yZ7&xY2!y#uV",
    "group_founder_099": "aB8@zZ3%a*wX",
    "group_founder_100": "cD9#bA4^c!yZ"
};

// Generate 100 group local users (各聯合群組創辦人) with the provided specific passwords
for (let i = 1; i <= 100; i++) {
    const userNum = String(i).padStart(3, '0');
    const internalKey = `group_founder_${userNum}`; // Key used in the specificGroupFounderPasswords object
    hardcodedUsers[internalKey] = { // Use the internal key as the main key for hardcodedUsers
        password: specificGroupFounderPasswords[internalKey], // Use the specific password
        username: internalKey, // 將登入使用者名稱設定為 'group_founder_XXX'
        uid: `uid-group-founder-${userNum}`, // Unique ID
        role: 'groupFounder' // Assign a role
    };
}
// --- End Custom Authentication Data ---

// Create a context for Auth state
const AuthContext = createContext(null);

// AuthProvider component to manage Firebase Authentication state
function AuthProvider({ children }) {
    const [firebaseUser, setFirebaseUser] = useState(null); // Firebase User object
    const [currentUser, setCurrentUser] = useState(null); // Custom user data (username, role)
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [userId, setUserId] = useState(null); // Firebase Auth UID for Firestore paths

    useEffect(() => {
        console.log("AuthProvider useEffect: Initializing auth listener...");
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("onAuthStateChanged fired. User:", user);
            if (user) {
                // User is signed in (e.g., anonymously or via other methods)
                setFirebaseUser(user);
                setUserId(user.uid); // Set Firebase Auth UID
                console.log("Firebase user signed in. UID:", user.uid);

                // Check if we have a custom user logged in via localStorage
                const storedCustomUser = localStorage.getItem('currentUser');
                if (storedCustomUser) {
                    const parsedUser = JSON.parse(storedCustomUser);
                    // Use the custom username and role, but ensure the UID is the Firebase Auth UID
                    setCurrentUser({
                        username: parsedUser.username,
                        uid: user.uid, // Always use the Firebase Auth UID for currentUser.uid
                        role: parsedUser.role
                    });
                    console.log("Custom user data loaded from localStorage and associated with Firebase UID:", user.uid);
                } else {
                    // If no custom user from localStorage, and Firebase user is present (e.g., from a previous anonymous session)
                    // We will treat them as an unauthenticated generic user for our custom system.
                    // The UI will show the login screen if userId is null, which is what we want.
                    // If they were anonymously logged in before, their UID is still valid for Firebase rules.
                    setCurrentUser(null); // Explicitly set to null if no custom login
                    console.log("No custom user in localStorage. User is currently Firebase authenticated (e.g., anonymously), but no custom profile loaded.");
                }
            } else {
                // No Firebase user found, and we are NOT attempting anonymous sign-in automatically.
                console.log("No Firebase user found. Not attempting anonymous sign-in.");
                setFirebaseUser(null);
                setCurrentUser(null);
                setUserId(null); // Ensure userId is null if no Firebase user
            }
            setLoadingAuth(false); // Auth state is determined, stop loading.
            console.log("Auth loading complete. Final Firebase Auth UID:", user ? user.uid : "null (no Firebase user)");
        });

        return () => {
            console.log("AuthProvider useEffect: Cleaning up auth listener.");
            unsubscribe();
        };
    }, []); // Empty dependency array means this runs once on mount

    // Custom login function to map hardcoded credentials to UI state
    const customLogin = async (usernameInput, passwordInput) => {
        console.log("customLogin: Attempting login for username:", usernameInput);
        const trimmedUsername = usernameInput.trim();
        const trimmedPassword = passwordInput.trim();

        const userFound = Object.values(hardcodedUsers).find(
            (u) => u.username === trimmedUsername && u.password === trimmedPassword
        );

        if (userFound) {
            // Attempt to sign in anonymously first if not already signed in via Firebase Auth
            // This ensures we get a Firebase UID for Firestore rules.
            let firebaseAuthUid = auth.currentUser?.uid;
            if (!firebaseAuthUid) {
                console.log("customLogin: No active Firebase user, attempting anonymous sign-in to get UID...");
                try {
                    const userCredential = await signInAnonymously(auth); // Corrected: signInAnonymously is now imported
                    firebaseAuthUid = userCredential.user.uid;
                    console.log("customLogin: Anonymous Firebase sign-in successful, UID:", firebaseAuthUid);
                } catch (error) {
                    console.error("customLogin: Error during anonymous Firebase sign-in:", error);
                    return { success: false, message: 'Firebase 登入失敗，請稍後再試。' };
                }
            }

            const updatedCustomUser = {
                username: userFound.username,
                uid: firebaseAuthUid, // Associate custom user with the Firebase Auth UID
                role: userFound.role
            };
            setCurrentUser(updatedCustomUser);
            setUserId(firebaseAuthUid); // Update userId state as well
            localStorage.setItem('currentUser', JSON.stringify(updatedCustomUser));
            console.log("customLogin: Login successful. Custom user set:", updatedCustomUser);
            return { success: true, user: updatedCustomUser };
        }
        console.log("customLogin: Login failed for:", trimmedUsername, " - Incorrect credentials.");
        return { success: false, message: '使用者名稱或密碼錯誤。' };
    };

    const customLogout = async () => {
        try {
            console.log("Attempting Firebase signOut...");
            await signOut(auth); // Sign out from Firebase Auth
            setCurrentUser(null);
            setUserId(null);
            localStorage.removeItem('currentUser'); // Clear custom user from localStorage
            console.log("Firebase signOut successful. Custom user data cleared.");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    // Provide db, firebaseUser, currentUser (custom data), userId (Firebase Auth UID), loadingAuth, and custom auth functions
    return (
        <AuthContext.Provider value={{ db, firebaseUser, currentUser, userId, loadingAuth, customLogin, customLogout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use AuthContext
function useAuth() {
    return useContext(AuthContext);
}

// --- Components ---

// Custom Login Screen Component
function CustomAuthScreen() {
    const { customLogin } = useAuth();
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        console.log("handleLogin: Login button clicked.");
        setMessage(''); // Clear previous messages
        const result = await customLogin(usernameInput, passwordInput); // Await customLogin
        if (!result.success) {
            setMessage(result.message);
            console.log("handleLogin: Login failed, message set:", result.message);
        } else {
            console.log("handleLogin: Login successful, redirecting...");
            // No explicit redirect needed here, as AuthProvider's useEffect will update userId
            // and MainAppContent will re-render, showing the main app.
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">登入</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            使用者名稱
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            密碼
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            required
                        />
                    </div>
                    {message && (
                        <p className={`text-center text-sm ${message.includes('錯誤') ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out flex items-center justify-center"
                    >
                        <LogIn className="mr-2" size={20} /> 登入
                    </button>
                </form>
                {/* 移除 '其他測試帳號 (僅限聊天)' 區塊 */}
            </div>
        </div>
    );
}

// Chat Room Component (reusable for General and Meeting chats)
function ChatRoom({ collectionPath, title, onBack }) {
    const { db, currentUser, userId } = useAuth(); // Use custom currentUser and Firebase Auth UID
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        console.log(`ChatRoom useEffect for ${title}: userId is`, userId);
        if (!userId) { // userId is Firebase Auth UID
            setMessages([]); // Clear messages if user logs out or not authenticated by Firebase
            return;
        }

        // Listen for messages from Firestore
        const q = query(collection(db, ...collectionPath), orderBy('timestamp'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            console.log(`Fetched ${msgs.length} messages for ${title}.`);
        }, (error) => {
            console.error(`Error fetching messages for ${title}:`, error);
        });

        return () => {
            console.log(`ChatRoom useEffect cleanup for ${title}.`);
            unsubscribe();
        };
    }, [db, collectionPath, userId, title]);

    const sendMessage = async (e) => {
            e.preventDefault();
            if (newMessage.trim() === '' || !currentUser || !userId) {
                console.log("Cannot send message: Message empty, or currentUser/userId not available.");
                return; // Ensure user is logged in via custom system AND Firebase Auth
            }

            try {
                await addDoc(collection(db, ...collectionPath), {
                    text: newMessage,
                    senderId: userId, // Use Firebase Auth UID for Firestore rules
                    senderUsername: currentUser.username, // Use custom username for display
                    timestamp: serverTimestamp(),
                });
                setNewMessage('');
                console.log("Message sent successfully.");
            } catch (error) {
                console.error("Error sending message:", error);
            }
        };

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between rounded-t-lg shadow-md">
                {onBack && (
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-blue-700 transition duration-200">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <h2 className="text-xl font-semibold flex-grow text-center">{title}</h2>
                {onBack && <div className="w-8"></div> /* Placeholder for alignment */}
            </div>
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">還沒有訊息。發送第一條訊息吧！</p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                                msg.senderId === userId // Compare with Firebase Auth UID
                                    ? 'bg-blue-200 ml-auto text-right'
                                    : 'bg-gray-200 mr-auto text-left'
                            }`}
                        >
                            <span className="font-semibold text-sm text-gray-700">
                                {msg.senderId === userId ? '你' : msg.senderUsername}:
                            </span>
                            <p className="text-gray-800 break-words">{msg.text}</p>
                            <span className="text-xs text-gray-500">
                                {msg.timestamp?.toDate().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
            </div>
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="輸入訊息..."
                    className="flex-grow border border-gray-300 rounded-full py-2 px-4 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    disabled={!currentUser || !userId}
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center"
                    disabled={!currentUser || !userId}
                >
                    <MessageSquare size={20} className="mr-1" /> 發送
                </button>
            </form>
        </div>
    );
}

// Meetings List Component
function MeetingsList({ onSelectMeeting, onCreateNewMeeting }) {
    const { db, currentUser, userId } = useAuth(); // Use custom currentUser and Firebase Auth UID
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        console.log("MeetingsList useEffect: userId is", userId);
        if (!userId) return; // userId is Firebase Auth UID
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'meetings'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const meetingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMeetings(meetingList);
            console.log(`Fetched ${meetingList.length} meetings.`);
        }, (error) => {
            console.error("Error fetching meetings:", error);
        });
        return () => {
            console.log("MeetingsList useEffect cleanup.");
            unsubscribe();
        };
    }, [db, userId]);

    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white p-4 flex items-center justify-between rounded-t-lg shadow-md">
                <h2 className="text-xl font-semibold">會議聊天室</h2>
                <button
                    onClick={onCreateNewMeeting}
                    className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center justify-center"
                    // Disable based on custom role (client-side UI only)
                    disabled={!currentUser || !(currentUser.role === 'teamPremier' || currentUser.role === 'adminChief')}
                >
                    <PlusCircle size={20} className="mr-1" /> 新增會議
                </button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                {meetings.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">目前沒有會議。點擊「新增會議」來建立一個吧！</p>
                ) : (
                    <ul className="space-y-3">
                        {meetings.map((meeting) => (
                            <li key={meeting.id}>
                                <button
                                    onClick={() => onSelectMeeting(meeting)}
                                    className="w-full text-left bg-white hover:bg-gray-100 p-4 rounded-lg shadow-sm border border-gray-200 transition duration-200 ease-in-out flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-semibold text-lg text-gray-800">{meeting.name}</p>
                                        <p className="text-sm text-gray-500">
                                            建立者: {meeting.creatorUsername || '未知'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {meeting.createdAt?.toDate().toLocaleString('zh-TW')}
                                        </p>
                                    </div>
                                    <ChevronLeft size={20} className="rotate-180 text-gray-500" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

// Create New Meeting Modal
function CreateMeetingModal({ onClose, onCreate }) {
    const [meetingName, setMeetingName] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (meetingName.trim() === '') {
            setMessage('會議名稱不能為空。');
            return;
        }
        onCreate(meetingName);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">新增會議</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="meetingName">
                            會議名稱
                        </label>
                        <input
                            type="text"
                            id="meetingName"
                            className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={meetingName}
                            onChange={(e) => setMeetingName(e.target.value)}
                            required
                        />
                    </div>
                    {message && <p className="text-red-500 text-sm text-center">{message}</p>}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center"
                        >
                            <PlusCircle size={20} className="mr-1" /> 建立會議
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Main App Content Component (renamed from App)
function MainAppContent() {
    const { currentUser, loadingAuth, userId, customLogout } = useAuth();
    const [currentPage, setCurrentPage] = useState('home'); // 'home', 'generalChat', 'meetings', 'meetingChat'
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);

    // Added for debugging: Log userId and currentUser whenever they change
    useEffect(() => {
        console.log("MainAppContent useEffect: userId changed to", userId);
        console.log("MainAppContent useEffect: currentUser changed to", currentUser);
    }, [userId, currentUser]);


    // Function to handle creating a new meeting (now uses Firebase Auth UID)
    const handleCreateMeeting = async (name) => {
        if (!currentUser || !userId) {
            console.log("Cannot create meeting: currentUser or userId not available.");
            return; // Ensure user is logged in via custom system AND Firebase Auth
        }
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'meetings'), {
                name: name,
                createdAt: serverTimestamp(),
                creatorId: userId, // Use Firebase Auth UID for Firestore rules
                creatorUsername: currentUser.username, // Use custom username for display
            });
            console.log("Meeting created successfully!");
        } catch (error) {
            console.error("Error creating meeting:", error);
        }
    };

    console.log("MainAppContent render: loadingAuth =", loadingAuth, ", userId =", userId);
    if (loadingAuth) {
        console.log("MainAppContent: Still loading auth, rendering loading spinner.");
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600 delay-75"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse bg-blue-600 delay-150"></div>
                    <p className="text-gray-700">載入中...</p>
                </div>
            </div>
        );
    }

    // If Firebase Auth is not ready or no user is signed in via Firebase Auth, show login screen.
    // This ensures userId is always populated when MainAppContent is rendered.
    if (!userId) { // Check for Firebase Auth UID
        console.log("MainAppContent: userId is null, rendering CustomAuthScreen.");
        return <CustomAuthScreen />; // Use custom login screen, which will trigger anonymous auth
    }

    console.log("MainAppContent: userId is present, rendering main app content.");
    return (
        <div className="min-h-screen bg-gray-100 font-inter flex flex-col">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 shadow-lg flex items-center justify-between">
                <h1 className="text-2xl font-bold">聊天網頁</h1>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">
                        嗨，{currentUser?.username || `匿名用戶-${userId.substring(0, 6)}`}！ (ID: {userId})
                    </span>
                    <button
                        onClick={customLogout} // Use custom logout
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out flex items-center"
                    >
                        <LogOut size={18} className="mr-1" /> 登出
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-grow p-4 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                {/* Sidebar Navigation */}
                <nav className="bg-white p-4 rounded-lg shadow-md md:w-1/4 flex flex-col space-y-3">
                    <button
                        onClick={() => { setCurrentPage('generalChat'); setSelectedMeeting(null); }}
                        className={`w-full text-left py-3 px-4 rounded-lg font-semibold flex items-center transition duration-200 ease-in-out ${
                            currentPage === 'generalChat' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <MessageSquare size={20} className="mr-3" /> 一般聊天室
                    </button>
                    <button
                        onClick={() => { setCurrentPage('meetings'); setSelectedMeeting(null); }}
                        className={`w-full text-left py-3 px-4 rounded-lg font-semibold flex items-center transition duration-200 ease-in-out ${
                            currentPage === 'meetings' || currentPage === 'meetingChat' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                    >
                        <Users size={20} className="mr-3" /> 會議聊天室
                    </button>
                </nav>

                {/* Chat/Meeting Display Area */}
                <main className="flex-grow md:w-3/4">
                    {currentPage === 'home' && (
                        <div className="bg-white p-8 rounded-lg shadow-md h-full flex items-center justify-center text-center">
                            <p className="text-xl text-gray-600">
                                歡迎來到聊天網頁！請從左側選單選擇一個聊天室。
                            </p>
                        </div>
                    )}
                    {currentPage === 'generalChat' && (
                        <ChatRoom
                            collectionPath={['artifacts', appId, 'public', 'data', 'general_chat']}
                            title="一般聊天室"
                        />
                    )}
                    {currentPage === 'meetings' && (
                        <MeetingsList
                            onSelectMeeting={(meeting) => {
                                setSelectedMeeting(meeting);
                                setCurrentPage('meetingChat');
                            }}
                            onCreateNewMeeting={() => setShowCreateMeetingModal(true)}
                        />
                    )}
                    {currentPage === 'meetingChat' && selectedMeeting && (
                        <ChatRoom
                            collectionPath={['artifacts', appId, 'public', 'data', 'meetings', selectedMeeting.id, 'messages']}
                            title={`會議: ${selectedMeeting.name}`}
                            onBack={() => { setCurrentPage('meetings'); setSelectedMeeting(null); }}
                        />
                    )}
                </main>
            </div>

            {showCreateMeetingModal && (
                <CreateMeetingModal
                    onClose={() => setShowCreateMeetingModal(false)}
                    onCreate={handleCreateMeeting}
                />
            )}
        </div>
    );
}

// Root App Component that wraps MainAppContent with AuthProvider
export default function App() { // Corrected: Added '()' after App
    return (
        <AuthProvider>
            <MainAppContent />
        </AuthProvider>
    );
}
