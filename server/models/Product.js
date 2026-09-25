const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC PRODUCT INFORMATION
        // =====================================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            required: true
        },


        // =====================================================
        // PRICE & STOCK
        // =====================================================

        price: {
            type: Number,
            required: true,
            min: 0
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },


        // =====================================================
        // PRODUCT RATING & ECO INFORMATION
        // =====================================================

        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },

        ecoScore: {
            type: Number,
            default: 50,
            min: 0,
            max: 100
        },

        material: {
            type: String,
            default: "",
            trim: true
        },

        size: {
            type: String,
            default: "",
            trim: true
        },


        // =====================================================
        // PRODUCT DIMENSIONS
        // =====================================================

        dimensions: {
            length: {
                type: Number,
                default: 0,
                min: 0
            },

            width: {
                type: Number,
                default: 0,
                min: 0
            },

            height: {
                type: Number,
                default: 0,
                min: 0
            },

            unit: {
                type: String,
                default: "inch",
                trim: true
            }
        },


        // =====================================================
        // WEIGHT CAPACITY
        // =====================================================

        weightCapacity: {
            value: {
                type: Number,
                default: 0,
                min: 0
            },

            unit: {
                type: String,
                default: "kg",
                trim: true
            }
        },


        // =====================================================
        // PRODUCT WEIGHT
        // =====================================================

        productWeight: {
            value: {
                type: Number,
                default: 0,
                min: 0
            },

            unit: {
                type: String,
                default: "g",
                trim: true
            }
        }
    },

    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "Product",
    productSchema
);