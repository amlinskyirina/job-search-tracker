import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
} from "firebase/firestore";

const isE2E =
  import.meta.env.DEV && import.meta.env.MODE === "e2e";

const productionConfig = {
  apiKey: "AIzaSyBPZMsF1SSO027aVw7sbUI9i4qAQ9l6TwU",
  authDomain: "job-search-tracker-1f53c.firebaseapp.com",
  projectId: "job-search-tracker-1f53c",
  storageBucket: "job-search-tracker-1f53c.firebasestorage.app",
  messagingSenderId: "187362417912",
  appId: "1:187362417912:web:456d31a0916b41c5c2af0d",
};

const testConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-job-search-tracker.firebaseapp.com",
  projectId: "demo-job-search-tracker",
  appId: "demo-job-search-tracker-web",
};

const app = initializeApp(
  isE2E ? testConfig : productionConfig,
);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

if (isE2E) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true,
  });

  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export async function signInTestUser() {
  if (!isE2E) {
    throw new Error("Test sign-in is available only in E2E mode.");
  }

  const email = `test-${crypto.randomUUID()}@example.com`;

  await createUserWithEmailAndPassword(
    auth,
    email,
    "Test-password-123!",
  );
}