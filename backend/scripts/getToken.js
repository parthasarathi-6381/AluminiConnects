import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDY_xT4KIEtKK-N2qlIwP6nKnTwPU7VTAc",
  authDomain: "alumini-connects-dcb37.firebaseapp.com",
  projectId: "alumini-connects-dcb37",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = "teststudent@citchennai.net";
const password = "test1234";

(async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    console.log("✅ Firebase ID Token:");
    console.log(token);
  } catch (error) {
    console.error("Error getting token:", error);
  }
})();
