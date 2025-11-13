import admin from "./firebase/firebaseAdmin.js";

const setAdminClaim = async () => {
  const uid = "C9jZKx6fE2WgB9XU9N81TIHjfvi1"; // replace with your admin UID
  try {
    // 1️⃣ mark email as verified
    await admin.auth().updateUser(uid, { emailVerified: true });
    console.log("✅ Email marked as verified");

    // 2️⃣ set custom claims (admin role, etc.)
    await admin.auth().setCustomUserClaims(uid, { role: "admin", verified: true });
    console.log("✅ Admin custom claim set successfully!");
  } catch (err) {
    console.error("❌ Error setting claim:", err);
  }
};

setAdminClaim();
