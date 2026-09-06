const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// JWT SECRET
// =====================================================
// JWT_SECRET must be defined in server/.env
// No hardcoded fallback is used in production.
// =====================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error(
        "❌ JWT_SECRET is missing. Add JWT_SECRET to your server/.env file."
    );
}

// =====================================================
// VERIFY LOGIN
// =====================================================

exports.protect = async (req, res, next) => {
    try {
        // -------------------------------------------------
        // CHECK JWT SECRET
        // -------------------------------------------------

        if (!JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Server authentication configuration error"
            });
        }

        // -------------------------------------------------
        // CHECK AUTHORIZATION HEADER
        // -------------------------------------------------

        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // -------------------------------------------------
        // GET TOKEN
        // -------------------------------------------------

        const token = authHeader
            .split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            });
        }

        // -------------------------------------------------
        // VERIFY TOKEN
        // -------------------------------------------------

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        // -------------------------------------------------
        // CHECK TOKEN PAYLOAD
        // -------------------------------------------------

        if (!decoded || !decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        const user = await User.findById(
            decoded.id
        ).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // -------------------------------------------------
        // ATTACH USER TO REQUEST
        // -------------------------------------------------

        req.user = user;

        next();

    } catch (error) {
        console.error(
            "Authentication Error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

// =====================================================
// ADMIN ONLY
// =====================================================

exports.adminOnly = (req, res, next) => {

    // -------------------------------------------------
    // USER MUST BE AUTHENTICATED
    // -------------------------------------------------

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required"
        });
    }

    // -------------------------------------------------
    // USER MUST BE ADMIN
    // -------------------------------------------------

    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};