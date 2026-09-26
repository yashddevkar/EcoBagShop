const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Brevo Email API uses HTTPS, so it works on Render Free
const crypto = require("crypto");

// =====================================================
// REGISTER
// =====================================================

exports.register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            address
        });

        await user.save();

        res.status(201).json({
            success: true,
            message: "Registration Successful"
        });

    } catch (error) {
        console.error(
            "Registration Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// LOGIN - SEND OTP
// =====================================================

exports.login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // =================================================
        // GENERATE 6 DIGIT OTP
        // =================================================

        const otp = crypto.randomInt(
            100000,
            1000000
        ).toString();

        // OTP valid for configured minutes
        const otpExpiryMinutes =
            Number(process.env.OTP_EXPIRY_MINUTES) || 5;

        const expiry = new Date(
            Date.now() +
            otpExpiryMinutes * 60 * 1000
        );

        user.loginOTP = otp;
        user.loginOTPExpiry = expiry;

        await user.save();

        // =================================================
        // SEND OTP EMAIL USING BREVO
        // =================================================

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },

                body: JSON.stringify({
                    sender: {
                        name:
                            process.env.BREVO_FROM_NAME ||
                            "EcoBag Shop",

                        email:
                            process.env.BREVO_FROM_EMAIL
                    },

                    to: [
                        {
                            email: user.email
                        }
                    ],

                    subject:
                        "EcoBag Shop - Login OTP",

                    htmlContent: `
                        <h2>EcoBag Shop</h2>

                        <p>Your login OTP is:</p>

                        <h1>${otp}</h1>

                        <p>
                            This OTP will expire in
                            ${otpExpiryMinutes} minutes.
                        </p>

                        <p>
                            If you did not request this email,
                            please ignore it.
                        </p>
                    `
                })
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                "Brevo email error:",
                errorText
            );

            throw new Error(
                "Unable to send OTP email"
            );
        }

        // IMPORTANT:
        // Do NOT send JWT here.
        // JWT will only be created after OTP verification.

        res.status(200).json({
            success: true,
            otpRequired: true,
            message:
                `OTP has been sent to ${maskEmail(user.email)}`
        });

    } catch (error) {
        console.error(
            "Login / OTP Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to send OTP. Please try again."
        });
    }
};


// =====================================================
// VERIFY OTP
// =====================================================

exports.verifyOTP = async (req, res) => {
    try {
        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =================================================
        // CHECK OTP EXISTS
        // =================================================

        if (!user.loginOTP) {
            return res.status(400).json({
                success: false,
                message:
                    "No OTP found. Please request a new OTP."
            });
        }

        // =================================================
        // CHECK EXPIRY
        // =================================================

        if (
            !user.loginOTPExpiry ||
            user.loginOTPExpiry < new Date()
        ) {
            user.loginOTP = null;
            user.loginOTPExpiry = null;

            await user.save();

            return res.status(400).json({
                success: false,
                message:
                    "OTP has expired. Please login again."
            });
        }

        // =================================================
        // CHECK OTP
        // =================================================

        if (
            user.loginOTP !==
            otp.toString().trim()
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // =================================================
        // OTP CORRECT
        // =================================================

        user.loginOTP = null;
        user.loginOTPExpiry = null;

        await user.save();

        // =================================================
        // CREATE JWT ONLY AFTER OTP
        // =================================================

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,

            message:
                "Login successful",

            token,

            user: {
                id: user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role
            }
        });

    } catch (error) {
        console.error(
            "OTP Verification Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


// =====================================================
// RESEND LOGIN OTP
// =====================================================

exports.resendOTP = async (req, res) => {
    try {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = crypto.randomInt(
            100000,
            1000000
        ).toString();

        const otpExpiryMinutes =
            Number(process.env.OTP_EXPIRY_MINUTES) || 5;

        const expiry = new Date(
            Date.now() +
            otpExpiryMinutes * 60 * 1000
        );

        user.loginOTP = otp;
        user.loginOTPExpiry = expiry;

        await user.save();

        // =================================================
        // SEND NEW LOGIN OTP USING BREVO
        // =================================================

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },

                body: JSON.stringify({
                    sender: {
                        name:
                            process.env.BREVO_FROM_NAME ||
                            "EcoBag Shop",

                        email:
                            process.env.BREVO_FROM_EMAIL
                    },

                    to: [
                        {
                            email: user.email
                        }
                    ],

                    subject:
                        "EcoBag Shop - New Login OTP",

                    htmlContent: `
                        <h2>EcoBag Shop</h2>

                        <p>Your new login OTP is:</p>

                        <h1>${otp}</h1>

                        <p>
                            This OTP will expire in
                            ${otpExpiryMinutes} minutes.
                        </p>

                        <p>
                            If you did not request this email,
                            please ignore it.
                        </p>
                    `
                })
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                "Brevo email error:",
                errorText
            );

            throw new Error(
                "Unable to send OTP email"
            );
        }

        res.status(200).json({
            success: true,
            message:
                "New OTP sent successfully"
        });

    } catch (error) {
        console.error(
            "Brevo OTP Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to resend OTP"
        });
    }
};


// =====================================================
// FORGOT PASSWORD - SEND RESET OTP
// =====================================================

exports.forgotPassword = async (req, res) => {
    try {
        const {
            email
        } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =================================================
        // GENERATE RESET OTP
        // =================================================

        const otp = crypto.randomInt(
            100000,
            1000000
        ).toString();

        const otpExpiryMinutes =
            Number(process.env.OTP_EXPIRY_MINUTES) || 5;

        const expiry = new Date(
            Date.now() +
            otpExpiryMinutes * 60 * 1000
        );

        // IMPORTANT:
        // Use separate fields so login OTP is not affected.
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpiry = expiry;

        await user.save();

        // =================================================
        // SEND RESET OTP USING BREVO
        // =================================================

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    "accept": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                    "content-type": "application/json"
                },

                body: JSON.stringify({
                    sender: {
                        name:
                            process.env.BREVO_FROM_NAME ||
                            "EcoBag Shop",

                        email:
                            process.env.BREVO_FROM_EMAIL
                    },

                    to: [
                        {
                            email: user.email
                        }
                    ],

                    subject:
                        "EcoBag Shop - Password Reset OTP",

                    htmlContent: `
                        <h2>EcoBag Shop</h2>

                        <p>
                            Your password reset OTP is:
                        </p>

                        <h1>${otp}</h1>

                        <p>
                            This OTP will expire in
                            ${otpExpiryMinutes} minutes.
                        </p>

                        <p>
                            If you did not request a password reset,
                            please ignore this email.
                        </p>
                    `
                })
            }
        );

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                "Brevo password reset email error:",
                errorText
            );

            throw new Error(
                "Unable to send password reset OTP"
            );
        }

        res.status(200).json({
            success: true,
            message:
                `Password reset OTP sent to ${maskEmail(user.email)}`
        });

    } catch (error) {
        console.error(
            "Forgot Password Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to send password reset OTP. Please try again."
        });
    }
};


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

exports.verifyResetOTP = async (req, res) => {
    try {
        const {
            email,
            otp
        } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and OTP are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =================================================
        // CHECK RESET OTP EXISTS
        // =================================================

        if (!user.resetPasswordOTP) {
            return res.status(400).json({
                success: false,
                message:
                    "No password reset OTP found. Please request a new OTP."
            });
        }

        // =================================================
        // CHECK RESET OTP EXPIRY
        // =================================================

        if (
            !user.resetPasswordOTPExpiry ||
            user.resetPasswordOTPExpiry < new Date()
        ) {
            user.resetPasswordOTP = null;
            user.resetPasswordOTPExpiry = null;

            await user.save();

            return res.status(400).json({
                success: false,
                message:
                    "Password reset OTP has expired. Please request a new OTP."
            });
        }

        // =================================================
        // CHECK RESET OTP
        // =================================================

        if (
            user.resetPasswordOTP !==
            otp.toString().trim()
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid password reset OTP"
            });
        }

        // =================================================
        // OTP VERIFIED
        // =================================================
        // Keep the OTP until the password is actually changed.
        // This prevents an OTP from being consumed before
        // the new password is submitted.

        res.status(200).json({
            success: true,
            message:
                "OTP verified successfully"
        });

    } catch (error) {
        console.error(
            "Reset OTP Verification Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to verify reset OTP"
        });
    }
};


// =====================================================
// RESET PASSWORD
// =====================================================

exports.resetPassword = async (req, res) => {
    try {
        const {
            email,
            otp,
            newPassword
        } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Email, OTP and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =================================================
        // CHECK RESET OTP
        // =================================================

        if (!user.resetPasswordOTP) {
            return res.status(400).json({
                success: false,
                message:
                    "No password reset OTP found. Please request a new OTP."
            });
        }

        // =================================================
        // CHECK RESET OTP EXPIRY
        // =================================================

        if (
            !user.resetPasswordOTPExpiry ||
            user.resetPasswordOTPExpiry < new Date()
        ) {
            user.resetPasswordOTP = null;
            user.resetPasswordOTPExpiry = null;

            await user.save();

            return res.status(400).json({
                success: false,
                message:
                    "Password reset OTP has expired. Please request a new OTP."
            });
        }

        // =================================================
        // CHECK RESET OTP
        // =================================================

        if (
            user.resetPasswordOTP !==
            otp.toString().trim()
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid password reset OTP"
            });
        }

        // =================================================
        // HASH NEW PASSWORD
        // =================================================

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        user.password = hashedPassword;

        // =================================================
        // CLEAR RESET OTP AFTER SUCCESS
        // =================================================

        user.resetPasswordOTP = null;
        user.resetPasswordOTPExpiry = null;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Password reset successfully"
        });

    } catch (error) {
        console.error(
            "Reset Password Error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to reset password. Please try again."
        });
    }
};


// =====================================================
// MASK EMAIL
// =====================================================

function maskEmail(email) {
    const parts =
        email.split("@");

    if (
        !parts[0] ||
        !parts[1]
    ) {
        return email;
    }

    const name =
        parts[0];

    if (name.length <= 2) {
        return (
            name[0] +
            "*".repeat(
                Math.max(
                    name.length - 1,
                    1
                )
            ) +
            "@" +
            parts[1]
        );
    }

    return (
        name.substring(0, 2) +
        "*".repeat(
            name.length - 2
        ) +
        "@" +
        parts[1]
    );
}