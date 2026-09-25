const Product = require("../models/Product");

// =====================================================
// GET ALL PRODUCTS
// =====================================================

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            products
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
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
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
            size,
            dimensions,
            weightCapacity,
            productWeight
        } = req.body;


        // =================================================
        // REQUIRED FIELDS
        // =================================================

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required."
            });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product description is required."
            });
        }

        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product category is required."
            });
        }

        if (!image || !image.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product image is required."
            });
        }


        // =================================================
        // PRICE
        // =================================================

        const productPrice = Number(price);

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


        // =================================================
        // DISCOUNT
        // =================================================

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


        // =================================================
        // STOCK
        // =================================================

        const productStock =
            stock === undefined ||
            stock === null ||
            stock === ""
                ? 0
                : Number(stock);

        if (
            !Number.isFinite(productStock) ||
            productStock < 0 ||
            !Number.isInteger(productStock)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Stock must be a valid whole number."
            });
        }


        // =================================================
        // RATING
        // =================================================

        const productRating =
            rating === undefined ||
            rating === null ||
            rating === ""
                ? 0
                : Number(rating);

        if (
            !Number.isFinite(productRating) ||
            productRating < 0 ||
            productRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating must be between 0 and 5."
            });
        }


        // =================================================
        // ECO SCORE
        // =================================================

        const productEcoScore =
            ecoScore === undefined ||
            ecoScore === null ||
            ecoScore === ""
                ? 50
                : Number(ecoScore);

        if (
            !Number.isFinite(productEcoScore) ||
            productEcoScore < 0 ||
            productEcoScore > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Eco Score must be between 0 and 100."
            });
        }


        // =================================================
        // DIMENSIONS
        // =================================================

        const productDimensions = {
            length:
                Number(
                    dimensions?.length || 0
                ),

            width:
                Number(
                    dimensions?.width || 0
                ),

            height:
                Number(
                    dimensions?.height || 0
                ),

            unit:
                dimensions?.unit ||
                "inch"
        };


        if (
            !Number.isFinite(
                productDimensions.length
            ) ||
            productDimensions.length < 0 ||

            !Number.isFinite(
                productDimensions.width
            ) ||
            productDimensions.width < 0 ||

            !Number.isFinite(
                productDimensions.height
            ) ||
            productDimensions.height < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Dimensions must contain valid numbers."
            });
        }


        // =================================================
        // WEIGHT CAPACITY
        // =================================================

        const productWeightCapacity = {
            value:
                Number(
                    weightCapacity?.value || 0
                ),

            unit:
                weightCapacity?.unit ||
                "kg"
        };


        if (
            !Number.isFinite(
                productWeightCapacity.value
            ) ||
            productWeightCapacity.value < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Weight capacity must contain a valid number."
            });
        }


        // =================================================
        // PRODUCT WEIGHT
        // =================================================

        const productWeightData = {
            value:
                Number(
                    productWeight?.value || 0
                ),

            unit:
                productWeight?.unit ||
                "g"
        };


        if (
            !Number.isFinite(
                productWeightData.value
            ) ||
            productWeightData.value < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Product weight must contain a valid number."
            });
        }


        // =================================================
        // CREATE PRODUCT
        // =================================================

        const product = new Product({

            name:
                name.trim(),

            description:
                description.trim(),

            price:
                productPrice,

            discount:
                productDiscount,

            category:
                category.trim(),

            image:
                image.trim(),

            stock:
                productStock,

            rating:
                productRating,

            ecoScore:
                productEcoScore,

            material:
                material
                    ? material.trim()
                    : "",

            size:
                size
                    ? size.trim()
                    : "",

            dimensions:
                productDimensions,

            weightCapacity:
                productWeightCapacity,

            productWeight:
                productWeightData
        });


        await product.save();


        // =================================================
        // SELLING PRICE
        // =================================================

        const sellingPrice =
            Math.round(
                product.price -
                (
                    product.price *
                    product.discount /
                    100
                )
            );


        // =================================================
        // RESPONSE
        // =================================================

        res.status(201).json({

            success: true,

            message:
                "Product created successfully",

            product,

            sellingPrice

        });

    } catch (error) {

        console.error(
            "Create Product Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// UPDATE PRODUCT
// ADMIN ONLY
//
// Supports:
// - Name
// - Description
// - Price
// - Discount
// - Category
// - Image
// - Stock
// - Rating
// - Eco Score
// - Material
// - Size
// - Dimensions
// - Weight Capacity
// - Product Weight
// =====================================================

exports.updateProduct = async (req, res) => {

    try {

        const productId =
            req.params.id;


        // =================================================
        // FIND PRODUCT
        // =================================================

        const product =
            await Product.findById(
                productId
            );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }


        // =================================================
        // BASIC PRODUCT FIELDS
        // =================================================

        const basicFields = [
            "name",
            "description",
            "category",
            "image",
            "material",
            "size"
        ];


        basicFields.forEach(
            field => {

                if (
                    req.body[field] !== undefined
                ) {

                    if (
                        typeof req.body[field] ===
                        "string"
                    ) {

                        product[field] =
                            req.body[field].trim();

                    } else {

                        product[field] =
                            req.body[field];

                    }

                }

            }
        );


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
        // STOCK
        // =================================================

        if (
            req.body.stock !== undefined
        ) {

            const newStock =
                Number(
                    req.body.stock
                );


            if (
                !Number.isInteger(newStock) ||
                newStock < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Stock must be a valid whole number."
                });

            }


            product.stock =
                newStock;

        }


        // =================================================
        // RATING
        // =================================================

        if (
            req.body.rating !== undefined
        ) {

            const newRating =
                Number(
                    req.body.rating
                );


            if (
                !Number.isFinite(newRating) ||
                newRating < 0 ||
                newRating > 5
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Rating must be between 0 and 5."
                });

            }


            product.rating =
                newRating;

        }


        // =================================================
        // ECO SCORE
        // =================================================

        if (
            req.body.ecoScore !== undefined
        ) {

            const newEcoScore =
                Number(
                    req.body.ecoScore
                );


            if (
                !Number.isFinite(newEcoScore) ||
                newEcoScore < 0 ||
                newEcoScore > 100
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Eco Score must be between 0 and 100."
                });

            }


            product.ecoScore =
                newEcoScore;

        }


        // =================================================
        // DIMENSIONS
        // =================================================

        if (
            req.body.dimensions !== undefined
        ) {

            const dimensions =
                req.body.dimensions;


            const length =
                Number(
                    dimensions?.length || 0
                );

            const width =
                Number(
                    dimensions?.width || 0
                );

            const height =
                Number(
                    dimensions?.height || 0
                );


            if (
                !Number.isFinite(length) ||
                length < 0 ||

                !Number.isFinite(width) ||
                width < 0 ||

                !Number.isFinite(height) ||
                height < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Dimensions must contain valid numbers."
                });

            }


            product.dimensions = {

                length,

                width,

                height,

                unit:
                    dimensions.unit ||
                    product.dimensions?.unit ||
                    "inch"

            };

        }


        // =================================================
        // WEIGHT CAPACITY
        // =================================================

        if (
            req.body.weightCapacity !== undefined
        ) {

            const weightCapacity =
                req.body.weightCapacity;


            const value =
                Number(
                    weightCapacity?.value || 0
                );


            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Weight capacity must contain a valid number."
                });

            }


            product.weightCapacity = {

                value,

                unit:
                    weightCapacity.unit ||
                    product.weightCapacity?.unit ||
                    "kg"

            };

        }


        // =================================================
        // PRODUCT WEIGHT
        // =================================================

        if (
            req.body.productWeight !== undefined
        ) {

            const productWeight =
                req.body.productWeight;


            const value =
                Number(
                    productWeight?.value || 0
                );


            if (
                !Number.isFinite(value) ||
                value < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product weight must contain a valid number."
                });

            }


            product.productWeight = {

                value,

                unit:
                    productWeight.unit ||
                    product.productWeight?.unit ||
                    "g"

            };

        }


        // =================================================
        // SAVE
        // =================================================

        await product.save();


        // =================================================
        // SELLING PRICE
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

            product,

            sellingPrice

        });

    } catch (error) {

        console.error(
            "Update Product Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
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
                message: "Product not found"
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
            message: error.message
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


        // =================================================
        // VALIDATE QUANTITY
        // =================================================

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
            !Number.isInteger(addQuantity)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Stock quantity must be a whole number."
            });

        }


        // =================================================
        // FIND PRODUCT
        // =================================================

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


        // =================================================
        // INCREASE STOCK
        // =================================================

        product.stock +=
            addQuantity;


        await product.save();


        res.status(200).json({

            success: true,

            message:
                `${addQuantity} stock added successfully.`,

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