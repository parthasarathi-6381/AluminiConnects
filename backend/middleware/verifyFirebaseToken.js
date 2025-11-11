import admin from "../firebase/firebaseAdmin.js";
 const verifyFirebaseToken = async (req, res,next) => {
    console.log("Verify token is triggered !!!!");
    const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    req.user = decodedValue;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

export default verifyFirebaseToken;