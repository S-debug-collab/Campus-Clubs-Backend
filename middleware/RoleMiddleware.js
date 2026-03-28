export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

export const clubLeadOnly = (req, res, next) => {
  if (req.user.role !== "club-lead") {
    return res.status(403).json({ message: "Club leads only" });
  }
  next();
};

export const adminOrClubLead = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "club-lead") {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
};
