const User = require("../models/User");

// =====================================================
// GET ALL REGISTERED USERS
// =====================================================

exports.getUsers = async (req, res) => {

    try {

        const users = await User.find()
            .select("-password -loginOTP -loginOTPExpiry")
            .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            count: users.length,

            users: users

        });

    } catch (error) {

        console.error(
            "Get Users Error:",
            error
        );


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};