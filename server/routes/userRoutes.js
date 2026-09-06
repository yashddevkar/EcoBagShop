const express = require("express");

const router = express.Router();


const {

    getUsers

} = require("../controllers/userController");


const {

    protect,

    adminOnly

} = require("../middleware/authMiddleware");


// =====================================================
// GET ALL REGISTERED USERS
// ADMIN ONLY
// =====================================================

router.get(
    "/",
    protect,
    adminOnly,
    getUsers
);


module.exports = router;