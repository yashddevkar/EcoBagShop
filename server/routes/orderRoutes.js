const express = require("express");

const router = express.Router();


// =====================================================
// CONTROLLERS
// =====================================================

const {

    createOrder,

    getOrder,

    getOrders,

    getOrdersByEmail,

    cancelOrder,

    deleteOrder,

    updateOrderStatus

} = require("../controllers/orderController");


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const {

    protect,

    adminOnly

} = require("../middleware/authMiddleware");


// =====================================================
// CREATE ORDER
// PUBLIC / CUSTOMER
// =====================================================

router.post(
    "/",
    protect,
    createOrder
);


// =====================================================
// GET ALL ORDERS
// ADMIN ONLY
// =====================================================

router.get(
    "/",
    protect,
    adminOnly,
    getOrders
);


// =====================================================
// GET USER ORDERS
// LOGGED-IN USER
// =====================================================

router.get(
    "/user/:email",
    protect,
    getOrdersByEmail
);


// =====================================================
// CANCEL ORDER
// LOGGED-IN USER
// =====================================================

router.put(
    "/:id/cancel",
    protect,
    cancelOrder
);


// =====================================================
// UPDATE ORDER STATUS
// ADMIN ONLY
// =====================================================

router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateOrderStatus
);


// =====================================================
// DELETE ORDER
// ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteOrder
);


// =====================================================
// GET SINGLE ORDER
// LOGGED-IN USER / ADMIN
// =====================================================

router.get(
    "/:id",
    protect,
    getOrder
);


module.exports = router;