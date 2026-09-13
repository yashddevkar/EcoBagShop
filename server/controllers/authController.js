const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Resend } = require("resend");
const crypto = require("crypto");

const resend = new Resend(process.env.RESEND_API_KEY);


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

                message:
                    "Name, email and password are required"

            });

        }


        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(400).json({

                success: false,

                message:
                    "User already exists"

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const user = new User({

            name,

            email:
                email.toLowerCase(),

            password:
                hashedPassword,

            phone,

            address

        });


        await user.save();


        res.status(201).json({

            success: true,

            message:
                "Registration Successful"

        });


    } catch (error) {

        console.error(
            "Registration Error:",
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

                message:
                    "Email and password are required"

            });

        }


        const user =
            await User.findOne({

                email:
                    email.toLowerCase()

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password"

            });

        }


        // =================================================
        // GENERATE 6 DIGIT OTP
        // =================================================

        const otp =
            crypto.randomInt(
                100000,
                1000000
            ).toString();


        // OTP valid for 5 minutes
        const otpExpiryMinutes =
            Number(process.env.OTP_EXPIRY_MINUTES) || 5;

        const expiry =
            new Date(
                Date.now() +
                otpExpiryMinutes * 60 * 1000
            );


        user.loginOTP =
            otp;

        user.loginOTPExpiry =
            expiry;


        await user.save();


        // =================================================
        // SEND OTP EMAIL
        // =================================================

        const { data, error } = await resend.emails.send({
            from: "EcoBag Shop <onboarding@resend.dev>",
            to: [user.email],
            subject: "EcoBag Shop - Login OTP",
            html: `
        <h2>EcoBag Shop</h2>
        <p>Your login OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in ${otpExpiryMinutes} minutes.</p>
        <p>If you did not request this OTP, please ignore this email.</p>
    `
        });

        if (error) {
            console.error("Resend email error:", error);
            throw new Error(error.message || "Unable to send OTP email");
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

                message:
                    "Email and OTP are required"

            });

        }


        const user =
            await User.findOne({

                email:
                    email.toLowerCase()

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

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

                message:
                    "Invalid OTP"

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

        const token =
            jwt.sign(

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

                id:
                    user._id,

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
// RESEND OTP
// =====================================================

exports.resendOTP = async (req, res) => {

    try {

        const {
            email
        } = req.body;


        if (!email) {

            return res.status(400).json({

                success: false,

                message:
                    "Email is required"

            });

        }


        const user =
            await User.findOne({

                email:
                    email.toLowerCase()

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        const otp =
            crypto.randomInt(
                100000,
                1000000
            ).toString();


        const otpExpiryMinutes =
            Number(process.env.OTP_EXPIRY_MINUTES) || 5;

        const expiry =
            new Date(
                Date.now() +
                otpExpiryMinutes * 60 * 1000
            );


        user.loginOTP =
            otp;

        user.loginOTPExpiry =
            expiry;


        await user.save();


        const { data, error } = await resend.emails.send({
            from: "EcoBag Shop <onboarding@resend.dev>",
            to: [user.email],
            subject: "EcoBag Shop - New Login OTP",
            html: `
        <h2>EcoBag Shop</h2>
        <p>Your new login OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in ${otpExpiryMinutes} minutes..</p>
        <p>If you did not request this OTP, please ignore this email.</p>
    `
        });

        if (error) {
            console.error("Resend email error:", error);
            throw new Error(error.message || "Unable to send OTP email");
        }


        res.status(200).json({

            success: true,

            message:
                "New OTP sent successfully"

        });


    } catch (error) {

        console.error(
            "Resend OTP Error:",
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