import admin from "../firebase/firebaseAdmin.js";

const setAdminClaim = async () => {
  const uid = "TM0NqI8bVjTiIh6Rzr350eWiVH12"; // replace with your actual admin Firebase UID
  try {
    await admin.auth().setCustomUserClaims(uid, { role: "admin", verified: true });
    console.log("✅ Admin claim set successfully!");
  } catch (err) {
    console.error("Error setting claim:", err);
  }
};

setAdminClaim();
