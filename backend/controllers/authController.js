import admin from "../firebase/firebaseAdmin.js";
export const verifyUser = async (req, res,) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decodedValue = await admin.auth().verifyIdToken(token);
    res.status(200).json({ message: "User verified", user: decodedValue });
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error });
  }
  
};
