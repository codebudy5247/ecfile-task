const crypto = require("crypto");
const User = require("../models/user.model.js");
const fs = require("fs");

const {
  emailVerificationMailgenContent,
  sendEmail,
} = require("../utils/mail.js");

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { email, username, phone, password, role } = req.body;

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      return res.status(409).json({
        status: "error",
        message: "User with email or username already exists",
      });
    }
    const user = await User.create({
      email,
      password,
      phone,
      username,
      isEmailVerified: false,
      role: role || UserRolesEnum.USER,
    });

    /**
     * unHashedToken: unHashed token is something we will send to the user's mail
     * hashedToken: we will keep record of hashedToken to validate the unHashedToken in verify email controller
     * tokenExpiry: Expiry to be checked before validating the incoming token
     */
    const { unHashedToken, hashedToken, tokenExpiry } =
      user.generateTemporaryToken();

    /**
     * assign hashedToken and tokenExpiry in DB till user clicks on email verification link
     * The email verification is handled by {@link verifyEmail}
     */
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: emailVerificationMailgenContent(
        user.username,
        `${req.protocol}://${req.get(
          "host"
        )}/api/users/verify-email/${unHashedToken}`
      ),
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!createdUser) {
      return res.status(500).json({
        status: "error",
        message: "Something went wrong while registering the user",
      });
    }
    res.status(201).json({
      status: "success",
      user: createdUser,
      message:
        "Users registered successfully and verification email has been sent on your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone) {
      return res.status(401).json({
        status: "error",
        message: "Phone is required",
      });
    }

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User does not exist",
      });
    }

    // Compare the incoming password with hashed password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid user credentials",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    // get the user document ignoring the password and refreshToken field
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    // TODO: Add more options to make cookie more secure and reliable
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options) // set the access token in the cookie
      .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged in successfully",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Mail
exports.verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;

    if (!verificationToken) {
      return res.status(400).json({
        status: "error",
        message: "Email verification token is missing",
      });
    }

    let hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(489).json({
        status: "error",
        message: "Token is invalid or expired",
      });
    }

    // If we found the user that means the token is valid
    // Now we can remove the associated email token and expiry date as we no  longer need them
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    // Tun the email verified flag to `true`
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      status: "success",
      isEmailVerified: true,
      message: "Email is verified.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
exports.getCurrentUser = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ user: req.user, message: "Current user fetched successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user avatar {Image file}
exports.updateUserAvatar = async (req, res) => {
  try {
    if (!req.file?.filename) {
      return res.status(400).json({
        status: "error",
        message: "Avatar image is required",
      });
    }

    // get avatar file system url and local path
    const avatarUrl = getStaticFilePath(req, req.file?.filename);
    const avatarLocalPath = getLocalPath(req.file?.filename);

    const user = await User.findById(req.user._id);

    let updatedUser = await User.findByIdAndUpdate(
      req.user._id,

      {
        $set: {
          avatar: {
            url: avatarUrl,
            localPath: avatarLocalPath,
          },
        },
      },
      { new: true }
    ).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    // remove the old avatar
    removeLocalFile(user.avatar.localPath);

    res
      .status(200)
      .json({ updatedUser, message: "Avatar updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user list
exports.getUsers = async (req, res) => {
  try {
    let users = await User.find();
    return res.status(200).send(users)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getStaticFilePath = (req, fileName) => {
  return `${req.protocol}://${req.get("host")}/images/${fileName}`;
};
const getLocalPath = (fileName) => {
  return `public/images/${fileName}`;
};
const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) console.log("Error while removing local files: ", err);
    else {
      console.log("Removed local: ", localPath);
    }
  });
};
