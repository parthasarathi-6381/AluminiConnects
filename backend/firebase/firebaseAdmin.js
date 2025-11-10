import admin from "firebase-admin";
import { readFileSync } from "fs";
const serviceAccount = JSON.parse(
  readFileSync("./firebase/serviceAccountKey.json", "utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
