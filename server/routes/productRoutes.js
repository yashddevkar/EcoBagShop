const express = require("express");

const router = express.Router();


// =====================================================
// CONTROLLER
// =====================================================

const {

    getProducts,

    getProduct,

    createProduct,

    updateProduct,

    deleteProduct,

    addStock

} = require("../controllers/productController");


// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

const {

    protect,

    adminOnly

} = require("../middleware/authMiddleware");


// =====================================================
// GET ALL PRODUCTS
// PUBLIC
// =====================================================

router.get(
    "/",
    getProducts
);


// =====================================================
// CREATE PRODUCT
// ADMIN ONLY
// =====================================================

router.post(
    "/",
    protect,
    adminOnly,
    createProduct
);


// =====================================================
// ADD STOCK
// ADMIN ONLY
// =====================================================

router.put(
    "/:id/add-stock",
    protect,
    adminOnly,
    addStock
);


// =====================================================
// UPDATE PRODUCT
// ADMIN ONLY
// =====================================================

router.put(
    "/:id",
    protect,
    adminOnly,
    updateProduct
);


// =====================================================
// DELETE PRODUCT
// ADMIN ONLY
// =====================================================

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteProduct
);


// =====================================================
// GET SINGLE PRODUCT
// PUBLIC
// =====================================================

router.get(
    "/:id",
    getProduct
);


module.exports = router;