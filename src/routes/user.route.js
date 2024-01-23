const express = require("express");
const {
  registerUser,
  loginUser,
  verifyEmail,
  updateUserAvatar,
  getCurrentUser,
  getUsers,
} = require("../controller/user.controller");
const {
  userLoginValidator,
  userRegisterValidator,
} = require("../validators/user.validators");
const { validate } = require("../validators/validate");
const {
  verifyJWT,
  verifyPermission,
} = require("../middleware/auth.middleware");
const { UserRolesEnum } = require("../constants");
const { upload } = require("../middleware/multer.middleware");

const router = express.Router();

// Unprotected Routes
router.post("/register", userRegisterValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);
router.get("/verify-email/:verificationToken", verifyEmail);

// Protected Routes
router.patch(
  "/avatar-image",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

router.get("/me", verifyJWT, getCurrentUser);

// Admin Protected Routes
router.get(
  "/admin",
  verifyJWT,
  verifyPermission([UserRolesEnum.ADMIN]),
  getUsers
);

module.exports = router;
