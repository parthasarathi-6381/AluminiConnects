 export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (req.user && allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: "You don't have permission to perform this action" });
    }
  };
};

