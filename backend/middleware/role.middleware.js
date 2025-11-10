

export const isClubMemberOrAdmin = (req, res, next) => {
  try {
    const { role } = req.user;

    // Ensure user role exists
    if (!role)
      return res.status(403).json({ message: "User role not found. Unauthorized access." });

    // Allow access only to admin or clubMember
    if (role === "admin" || role === "clubMember") {
      return next(); // proceed to controller
    }

    return res.status(403).json({ message: "Access denied. Only club members or admins allowed." });
  } catch (error) {
    console.error("Role check error:", error);
    res.status(500).json({ message: "Error verifying user role", error });
  }
};
