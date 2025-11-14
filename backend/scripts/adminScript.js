import admin from "../firebase/firebaseAdmin.js";

const setAdminClaim = async () => {
  const uid = "9Pkn7FRqnFbvJ6sz4VC3RtVuj8y1"; // replace with your actual admin Firebase UID
  try {
    await admin.auth().setCustomUserClaims(uid, { role: "admin", verified: true });
    console.log("✅ Admin claim set successfully!");
  } catch (err) {
    console.error("Error setting claim:", err);
  }
};

setAdminClaim();
