const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

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

        category: {
            type: String,
            required: true,
            trim: true
        },

        image: {
            type: String,
            required: true
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

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
            default: ""
        },

        size: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);