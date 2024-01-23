const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.verifyJWT = async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(401).json({ message: "Unauthorized request" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );
    if (!user) {
      res.status(401).json({ message: "Invalid access token" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error?.message || "Invalid access token" });
  }
};

exports.verifyPermission =
  (roles = []) =>
  async (req, res, next) => {
    if (!req.user?._id) {
      res.status(401).json({ message: "Unauthorized request" });
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      res.status(403).json({ message: "Unauthorized request" });
    }
  };
