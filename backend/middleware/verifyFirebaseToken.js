import admin from "../firebase/firebaseAdmin.js";

const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - Token malformed" });
  }

  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    // decodedValue usually has { uid, name, email, ... customClaims }
    req.user = {
      uid: decodedValue.uid,
      role: decodedValue.role || decodedValue.admin || "student",
      email: decodedValue.email,
      name: decodedValue.name,
      verified: decodedValue.verified,
    };
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

export default verifyFirebaseToken;
