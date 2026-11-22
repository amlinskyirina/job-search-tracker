import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyBPZMsF1SSO027aVw7sbUI9i4qAQ9l6TwU",
  authDomain: "job-search-tracker-1f53c.firebaseapp.com",
  projectId: "job-search-tracker-1f53c",
  storageBucket: "job-search-tracker-1f53c.firebasestorage.app",
  messagingSenderId: "187362417912",
  appId: "1:187362417912:web:456d31a0916b41c5c2af0d"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);