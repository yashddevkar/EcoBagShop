const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");


// =====================================================
// HELPER - FIND PRODUCT
// =====================================================

async function findProduct(item) {

    const productId =
        item?.productId ||
        item?._id;


    if (
        productId &&
        mongoose.Types.ObjectId.isValid(productId)
    ) {

        const product =
            await Product.findById(productId);


        if (product) {
            return product;
        }

    }


    // Legacy fallback
    if (item?.name) {

        const product =
            await Product.findOne({
                name: item.name
            });


        if (product) {
            return product;
        }

    }


    return null;

}


// =====================================================
// HELPER - CHECK ORDER OWNERSHIP
// =====================================================

function isAdmin(req) {

    return (
        req.user &&
        req.user.role === "admin"
    );

}


function isOrderOwner(
    req,
    order
) {

    if (!req.user || !order) {
        return false;
    }


    const loggedInEmail =
        String(
            req.user.email || ""
        )
            .trim()
            .toLowerCase();


    const orderEmail =
        String(
            order.customer?.email || ""
        )
            .trim()
            .toLowerCase();


    return (
        loggedInEmail &&
        orderEmail &&
        loggedInEmail === orderEmail
    );

}


// =====================================================
// CREATE ORDER
// =====================================================

exports.createOrder = async (
    req,
    res
) => {

    try {

        const {
            customer,
            shippingAddress,
            items,
            paymentMethod
        } = req.body;


        if (
            !customer ||
            !customer.email ||
            !shippingAddress ||
            !shippingAddress.pincode ||
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Customer email, shipping address, pincode and cart items are required."

            });

        }


        const email =
            String(
                customer.email
            )
                .trim()
                .toLowerCase();


        // IMPORTANT:
        // The logged-in account must place the order
        // for its own email.

        if (
            req.user &&
            req.user.email &&
            String(
                req.user.email
            )
                .trim()
                .toLowerCase() !== email
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only place an order using your logged-in account."

            });

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid customer email."

            });

        }


        const pincode =
            String(
                shippingAddress.pincode
            )
                .trim();


        if (
            !/^[1-9][0-9]{5}$/.test(
                pincode
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please provide a valid 6-digit pincode."

            });

        }


        let subtotal = 0;

        const orderItems = [];


        // =================================================
        // CHECK PRODUCTS + STOCK
        // =================================================

        for (
            const item of items
        ) {

            const product =
                await findProduct(item);


            if (!product) {

                return res.status(404).json({

                    success: false,

                    message:
                        `Product not found: ${item?.name ||
                        "Unknown product"
                        }`

                });

            }


            const quantity =
                Number(
                    item.quantity
                );


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `Invalid quantity for ${product.name}`

                });

            }


            if (
                product.stock < quantity
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `${product.name} has only ${product.stock} items available`

                });

            }


            const discount =
                Number(
                    product.discount
                ) || 0;


            const finalPrice =
                product.price -
                (
                    product.price *
                    discount /
                    100
                );


            const roundedPrice =
                Math.round(
                    finalPrice
                );


            subtotal +=
                roundedPrice *
                quantity;


            const orderItem = {

                productId:
                    product._id,

                name:
                    product.name,

                price:
                    roundedPrice,

                quantity:
                    quantity,

                image:
                    product.image

            };


            if (
                item.customization
            ) {

                orderItem.customization =
                    item.customization;

            }


            orderItems.push(
                orderItem
            );

        }


        // =================================================
        // DELIVERY
        // =================================================

        const deliveryCharge =
            subtotal >= 500
                ? 0
                : 50;


        const totalAmount =
            subtotal +
            deliveryCharge;


        // =================================================
        // CUSTOMER
        // =================================================

        const normalizedCustomer = {

            ...customer,

            email:
                email

        };


        // =================================================
        // ADDRESS
        // =================================================

        const normalizedShippingAddress = {

            ...shippingAddress,

            pincode:
                pincode

        };


        // =================================================
        // CREATE ORDER
        // =================================================

        const order =
            new Order({

                customer:
                    normalizedCustomer,

                shippingAddress:
                    normalizedShippingAddress,

                items:
                    orderItems,

                subtotal:
                    Math.round(subtotal),

                deliveryCharge:
                    deliveryCharge,

                totalAmount:
                    Math.round(totalAmount),

                paymentMethod:
                    paymentMethod ||
                    "COD",

                paymentStatus:
                    "Pending",

                orderStatus:
                    "Placed"

            });


        await order.save();


        // =================================================
        // REDUCE STOCK
        // =================================================

        for (
            const item of orderItems
        ) {

            await Product.findByIdAndUpdate(

                item.productId,

                {

                    $inc: {

                        stock:
                            -item.quantity

                    }

                }

            );

        }


        return res.status(201).json({

            success: true,

            message:
                "Order placed successfully",

            order:
                order

        });


    } catch (error) {

        console.error(
            "Create Order Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to create order."

        });

    }

};


// =====================================================
// GET SINGLE ORDER
// ADMIN = ANY ORDER
// CUSTOMER = OWN ORDER ONLY
// =====================================================

exports.getOrder = async (
    req,
    res
) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // Admin can view any order
        if (!isAdmin(req)) {

            if (
                !isOrderOwner(
                    req,
                    order
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to view this order."

                });

            }

        }


        return res.status(200).json({

            success: true,

            order:
                order

        });


    } catch (error) {

        console.error(
            "Get Order Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// GET ALL ORDERS - ADMIN
// =====================================================

exports.getOrders = async (
    req,
    res
) => {

    try {

        const orders =
            await Order.find()
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            orders:
                orders

        });


    } catch (error) {

        console.error(
            "Get Orders Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// GET ORDERS BY EMAIL
// CUSTOMER = OWN EMAIL ONLY
// ADMIN = ANY EMAIL
// =====================================================

exports.getOrdersByEmail = async (
    req,
    res
) => {

    try {

        const requestedEmail =
            String(
                req.params.email
            )
                .trim()
                .toLowerCase();


        const loggedInEmail =
            String(
                req.user?.email || ""
            )
                .trim()
                .toLowerCase();


        // ---------------------------------------------
        // CUSTOMER CANNOT REQUEST SOMEONE ELSE'S EMAIL
        // ---------------------------------------------

        if (
            !isAdmin(req) &&
            requestedEmail !== loggedInEmail
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only view your own orders."

            });

        }


        const orders =
            await Order.find({

                "customer.email":
                    requestedEmail

            })
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            count:
                orders.length,

            orders:
                orders

        });


    } catch (error) {

        console.error(
            "Get User Orders Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// CANCEL ORDER
// CUSTOMER = OWN ORDER
// ADMIN = ANY ORDER
// =====================================================

exports.cancelOrder = async (
    req,
    res
) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // ---------------------------------------------
        // OWNERSHIP CHECK
        // ---------------------------------------------

        if (!isAdmin(req)) {

            if (
                !isOrderOwner(
                    req,
                    order
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You are not authorized to cancel this order."

                });

            }

        }


        // ---------------------------------------------
        // STATUS CHECK
        // ---------------------------------------------

        if (
            order.orderStatus !== "Placed" &&
            order.orderStatus !== "Confirmed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Order cannot be cancelled because it is already ${order.orderStatus}.`

            });

        }


        // ---------------------------------------------
        // RESTORE STOCK
        // ---------------------------------------------

        for (
            const item of order.items
        ) {

            await Product.findByIdAndUpdate(

                item.productId,

                {

                    $inc: {

                        stock:
                            item.quantity

                    }

                }

            );

        }


        order.orderStatus =
            "Cancelled";


        await order.save();


        return res.status(200).json({

            success: true,

            message:
                "Order cancelled successfully",

            order:
                order

        });


    } catch (error) {

        console.error(
            "Cancel Order Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// DELETE ORDER - ADMIN
// =====================================================

exports.deleteOrder = async (
    req,
    res
) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        await Order.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({

            success: true,

            message:
                "Order deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete Order Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// UPDATE ORDER STATUS - ADMIN
// =====================================================

exports.updateOrderStatus = async (
    req,
    res
) => {

    try {

        const {
            orderStatus
        } = req.body;


        const allowedStatuses = [

            "Placed",
            "Confirmed",
            "Packed",
            "Shipped",
            "Delivered",
            "Cancelled"

        ];


        if (
            !allowedStatuses.includes(
                orderStatus
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status"

            });

        }


        const order =
            await Order.findById(
                req.params.id
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // ---------------------------------------------
        // RESTORE STOCK IF ADMIN CANCELS
        // ---------------------------------------------

        if (
            order.orderStatus !== "Cancelled" &&
            orderStatus === "Cancelled"
        ) {

            for (
                const item of order.items
            ) {

                await Product.findByIdAndUpdate(

                    item.productId,

                    {

                        $inc: {

                            stock:
                                item.quantity

                        }

                    }

                );

            }

        }


        // ---------------------------------------------
        // PREVENT REOPENING CANCELLED ORDER
        // ---------------------------------------------

        if (
            order.orderStatus === "Cancelled" &&
            orderStatus !== "Cancelled"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "A cancelled order cannot be reopened."

            });

        }


        order.orderStatus =
            orderStatus;


        await order.save();


        return res.status(200).json({

            success: true,

            message:
                "Order status updated successfully",

            order:
                order

        });


    } catch (error) {

        console.error(
            "Update Order Status Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};