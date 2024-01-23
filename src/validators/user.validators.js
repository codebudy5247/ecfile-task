const { body, param } = require("express-validator");
const { AvailableUserRoles } = require("../constants");

exports.userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at lease 3 characters long"),
    body("phone")
      .notEmpty()
      .withMessage("Mobile number is required")
      // .isNumeric()
      .withMessage("Mobile number must contain only numbers")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile number must be 10 digits long")
      .custom((value) => /^[6-9]\d{9}$/.test(value))
      .withMessage("Mobile number must start with 6, 7, 8, or 9"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("Invalid user role"),
  ];
};

exports.userLoginValidator = () => {
  return [
    body("phone").notEmpty().withMessage("Phone is invalid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

exports.userAssignRoleValidator = () => {
  return [
    body("role")
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage("Invalid user role"),
  ];
};
