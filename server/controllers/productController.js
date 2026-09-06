const Product = require("../models/Product");


// =====================================================
// GET ALL PRODUCTS
// =====================================================

exports.getProducts = async (req, res) => {

    try {

        const products =
            await Product.find()
                .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            count: products.length,

            products: products

        });

    } catch (error) {

        console.error("Get Products Error:", error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

exports.getProduct = async (req, res) => {

    try {

        const product =
            await Product.findById(req.params.id);

        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product not found"

            });

        }

        res.status(200).json({

            success: true,

            product: product

        });

    } catch (error) {

        console.error("Get Product Error:", error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// CREATE PRODUCT
// =====================================================

exports.createProduct = async (req, res) => {

    try {

        const {

            name,
            description,
            price,
            discount,
            category,
            image,
            stock,
            rating,
            ecoScore,
            material,
            size

        } = req.body;


        // -------------------------------------------------
        // PRICE VALIDATION
        // -------------------------------------------------

        const productPrice =
            Number(price);

        if (
            !Number.isFinite(productPrice) ||
            productPrice < 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid product price."

            });

        }


        // -------------------------------------------------
        // DISCOUNT VALIDATION
        // -------------------------------------------------

        const productDiscount =
            discount === undefined ||
                discount === null ||
                discount === ""
                ? 0
                : Number(discount);


        if (
            !Number.isFinite(productDiscount) ||
            productDiscount < 0 ||
            productDiscount > 100
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Discount must be between 0 and 100."

            });

        }


        const product =
            new Product({

                name,

                description,

                price:
                    productPrice,

                discount:
                    productDiscount,

                category,

                image,

                stock,

                rating,

                ecoScore,

                material,

                size

            });


        await product.save();


        res.status(201).json({

            success: true,

            message:
                "Product created successfully",

            product:
                product

        });

    } catch (error) {

        console.error(
            "Create Product Error:",
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
// UPDATE PRODUCT
// ADMIN ONLY
//
// Used for:
// - Price
// - Discount
// - Other product information
// =====================================================

exports.updateProduct = async (req, res) => {

    try {

        const productId =
            req.params.id;


        // -------------------------------------------------
        // FIND PRODUCT
        // -------------------------------------------------

        const product =
            await Product.findById(
                productId
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        // =================================================
        // PRICE
        // =================================================

        if (
            req.body.price !== undefined
        ) {

            const newPrice =
                Number(
                    req.body.price
                );


            if (
                !Number.isFinite(newPrice) ||
                newPrice < 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Price must be a valid number greater than or equal to 0."

                });

            }


            product.price =
                newPrice;

        }


        // =================================================
        // DISCOUNT
        // =================================================

        if (
            req.body.discount !== undefined
        ) {

            const newDiscount =
                Number(
                    req.body.discount
                );


            if (
                !Number.isFinite(newDiscount) ||
                newDiscount < 0 ||
                newDiscount > 100
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Discount must be between 0 and 100."

                });

            }


            product.discount =
                newDiscount;

        }


        // =================================================
        // OTHER PRODUCT FIELDS
        // =================================================

        const allowedFields = [

            "name",
            "description",
            "category",
            "image",
            "stock",
            "rating",
            "ecoScore",
            "material",
            "size"

        ];


        allowedFields.forEach(
            field => {

                if (
                    req.body[field] !== undefined
                ) {

                    product[field] =
                        req.body[field];

                }

            }
        );


        // =================================================
        // SAVE
        // =================================================

        await product.save();


        // =================================================
        // CALCULATE SELLING PRICE
        // =================================================

        const originalPrice =
            Number(
                product.price
            ) || 0;


        const discount =
            Number(
                product.discount
            ) || 0;


        const sellingPrice =
            Math.round(
                originalPrice -
                (
                    originalPrice *
                    discount /
                    100
                )
            );


        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({

            success: true,

            message:
                "Product updated successfully",

            product:
                product,

            sellingPrice:
                sellingPrice

        });

    } catch (error) {

        console.error(
            "Update Product Error:",
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
// DELETE PRODUCT
// =====================================================

exports.deleteProduct = async (req, res) => {

    try {

        const product =
            await Product.findByIdAndDelete(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Product deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete Product Error:",
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
// ADD STOCK
// =====================================================

exports.addStock = async (req, res) => {

    try {

        const {
            quantity
        } = req.body;


        // -------------------------------------------------
        // VALIDATE QUANTITY
        // -------------------------------------------------

        if (
            quantity === undefined ||
            quantity === null ||
            Number(quantity) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a valid stock quantity."

            });

        }


        const addQuantity =
            Number(quantity);


        if (
            !Number.isInteger(
                addQuantity
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Stock quantity must be a whole number."

            });

        }


        // -------------------------------------------------
        // FIND PRODUCT
        // -------------------------------------------------

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        // -------------------------------------------------
        // INCREASE STOCK
        // -------------------------------------------------

        product.stock +=
            addQuantity;


        await product.save();


        res.status(200).json({

            success: true,

            message:
                `${addQuantity} stock added successfully.`,

            product:
                product

        });

    } catch (error) {

        console.error(
            "Add Stock Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};