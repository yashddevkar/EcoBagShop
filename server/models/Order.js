const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        customer: {
            name: {
                type: String,
                required: true,
                trim: true
            },

            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            }
        },

        shippingAddress: {
            address: {
                type: String,
                required: true
            },

            city: {
                type: String,
                required: true
            },

            state: {
                type: String,
                required: true
            },

            pincode: {
                type: String,
                required: true
            }
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                name: {
                    type: String,
                    required: true
                },

                price: {
                    type: Number,
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                image: {
                    type: String,
                    default: ""
                }
            }
        ],

        subtotal: {
            type: Number,
            required: true
        },

        deliveryCharge: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["COD"],
            default: "COD"
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid"],
            default: "Pending"
        },

        orderStatus: {
            type: String,
            enum: [
                "Placed",
                "Confirmed",
                "Packed",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Placed"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);