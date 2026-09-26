const express = require("express");

const router = express.Router();

const {
    register,
    login,
    verifyOTP,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} = require("../controllers/authController");


// =====================================================
// REGISTER
// =====================================================

router.post(
    "/register",
    register
);


// =====================================================
// LOGIN - SEND OTP
// =====================================================

router.post(
    "/login",
    login
);


// =====================================================
// VERIFY OTP
// =====================================================

router.post(
    "/verify-otp",
    verifyOTP
);


// =====================================================
// RESEND LOGIN OTP
// =====================================================

router.post(
    "/resend-otp",
    resendOTP
);


// =====================================================
// FORGOT PASSWORD - SEND RESET OTP
// =====================================================

router.post(
    "/forgot-password",
    forgotPassword
);


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

router.post(
    "/verify-reset-otp",
    verifyResetOTP
);


// =====================================================
// RESET PASSWORD
// =====================================================

router.post(
    "/reset-password",
    resetPassword
);


module.exports = router;