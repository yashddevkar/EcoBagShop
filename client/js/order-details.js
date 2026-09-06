// =====================================================
// ECOBAG SHOP - ORDER DETAILS
// =====================================================


// =====================================================
// API CONFIGURATION
// =====================================================

const API_BASE_URL =
    window.ECOBAG_API_BASE
        ? window.ECOBAG_API_BASE
        : (
            window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000"
                : ""
        );


// =====================================================
// LOAD ORDER
// =====================================================

async function loadOrder() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get("id");


    const loading =
        document.getElementById(
            "loading"
        );


    const orderContent =
        document.getElementById(
            "orderContent"
        );


    // =================================================
    // CHECK ORDER ID
    // =================================================

    if (!orderId) {

        if (loading) {

            loading.textContent =
                "Order ID is missing.";

        }

        return;

    }


    console.log(
        "Order ID:",
        orderId
    );


    try {

        // =================================================
        // GET TOKEN
        // =================================================

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            if (loading) {

                loading.textContent =
                    "Please login to view this order.";

            }

            return;

        }


        // =================================================
        // GET ORDER FROM SERVER
        // =================================================

        const response =
            await fetch(

                `${API_BASE_URL}/api/orders/${encodeURIComponent(
                    orderId
                )}`,

                {

                    method:
                        "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    }

                }

            );


        console.log(
            "API Status:",
            response.status
        );


        // =================================================
        // READ RESPONSE
        // =================================================

        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                responseText
                    ?
                    JSON.parse(
                        responseText
                    )
                    :
                    {};

        } catch (parseError) {

            console.error(
                "Response JSON parsing error:",
                parseError
            );


            console.error(
                "Server response:",
                responseText
            );


            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );

        }


        console.log(
            "Order Data:",
            data
        );


        // =================================================
        // AUTHENTICATION ERROR
        // =================================================

        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            if (loading) {

                loading.textContent =
                    "Your session has expired. Please login again.";

            }

            return;

        }


        // =================================================
        // ACCESS DENIED
        // =================================================

        if (
            response.status === 403
        ) {

            if (loading) {

                loading.textContent =
                    data.message ||
                    "You are not authorized to view this order.";

            }

            return;

        }


        // =================================================
        // SERVER ERROR
        // =================================================

        if (!response.ok) {

            if (loading) {

                loading.textContent =
                    data.message ||
                    "Unable to load order.";

            }

            return;

        }


        // =================================================
        // ORDER NOT FOUND
        // =================================================

        if (
            !data.success ||
            !data.order
        ) {

            if (loading) {

                loading.textContent =
                    data.message ||
                    "Order information not found.";

            }

            return;

        }


        // =================================================
        // DISPLAY ORDER
        // =================================================

        displayOrder(
            data.order
        );


        // =================================================
        // SHOW CONTENT
        // =================================================

        if (loading) {

            loading.style.display =
                "none";

        }


        if (orderContent) {

            orderContent.style.display =
                "block";

        }


    } catch (error) {

        console.error(
            "Order Details Error:",
            error
        );


        if (loading) {

            loading.textContent =
                error.message ||
                "Unable to connect to the server.";

        }

    }

}


// =====================================================
// DISPLAY ORDER
// =====================================================

function displayOrder(
    order
) {

    console.log(
        "Displaying order:",
        order
    );


    // =================================================
    // ORDER STATUS
    // =================================================

    const orderStatus =
        document.getElementById(
            "orderStatus"
        );


    if (orderStatus) {

        const status =
            order.orderStatus ||
            "Placed";


        orderStatus.textContent =
            status;


        orderStatus.className =
            "order-status " +
            status.toLowerCase();

    }


    // =================================================
    // ORDER DATE
    // =================================================

    const orderDate =
        document.getElementById(
            "orderDate"
        );


    if (orderDate) {

        const date =
            order.createdAt
                ?
                new Date(
                    order.createdAt
                )
                    .toLocaleDateString(
                        "en-IN",
                        {

                            day:
                                "2-digit",

                            month:
                                "long",

                            year:
                                "numeric"

                        }
                    )
                :
                "Date unavailable";


        orderDate.textContent =
            `Order ID: ${order._id} • ${date}`;

    }


    // =================================================
    // PRODUCTS
    // =================================================

    const productsContainer =
        document.getElementById(
            "orderProducts"
        );


    if (productsContainer) {

        productsContainer.innerHTML =
            "";


        if (
            !order.items ||
            order.items.length === 0
        ) {

            productsContainer.innerHTML =
                "<p>No products found.</p>";

        } else {

            order.items.forEach(
                item => {

                    const product =
                        document.createElement(
                            "div"
                        );


                    product.className =
                        "details-product";


                    const quantity =
                        Number(
                            item.quantity
                        ) || 1;


                    const price =
                        Number(
                            item.price
                        ) || 0;


                    const total =
                        price *
                        quantity;


                    product.innerHTML = `

                        <img
                            src="${escapeHTML(
                        item.image ||
                        "https://via.placeholder.com/100"
                    )}"
                            alt="${escapeHTML(
                        item.name ||
                        "Product"
                    )}"
                            onerror="
                                this.src='https://via.placeholder.com/100?text=EcoBag'
                            "
                        >


                        <div
                            class="details-product-info"
                        >

                            <h3>

                                ${escapeHTML(
                        item.name ||
                        "Product"
                    )}

                            </h3>


                            <p>

                                ₹${price.toLocaleString(
                        "en-IN"
                    )}

                                ×

                                ${quantity}

                            </p>

                            ${item.customization
                            ?
                            `
                                        <span class="custom-order-label">
                                            🎨 Customized
                                        </span>
                                    `
                            :
                            ""
                        }

                        </div>


                        <strong>

                            ₹${total.toLocaleString(
                            "en-IN"
                        )}

                        </strong>

                    `;


                    productsContainer.appendChild(
                        product
                    );

                }
            );

        }

    }


    // =================================================
    // CUSTOMER INFORMATION
    // =================================================

    const customer =
        order.customer ||
        {};


    const shipping =
        order.shippingAddress ||
        {};


    const deliveryAddress =
        document.getElementById(
            "deliveryAddress"
        );


    if (deliveryAddress) {

        deliveryAddress.innerHTML = `

            <p>

                <strong>

                    ${escapeHTML(
            customer.name ||
            "Customer"
        )}

                </strong>

            </p>


            <p>

                ${escapeHTML(
            shipping.address ||
            ""
        )}

            </p>


            <p>

                ${escapeHTML(
            shipping.city ||
            ""
        )}

                ${shipping.city &&
                shipping.state
                ?
                ","
                :
                ""
            }

                ${escapeHTML(
                shipping.state ||
                ""
            )}

            </p>


            <p>

                Pincode:

                ${escapeHTML(
                shipping.pincode ||
                ""
            )}

            </p>


            <p>

                📞

                ${escapeHTML(
                customer.phone ||
                "Not provided"
            )}

            </p>


            <p>

                ✉️

                ${escapeHTML(
                customer.email ||
                "Not provided"
            )}

            </p>

        `;

    }


    // =================================================
    // PAYMENT INFORMATION
    // =================================================

    const paymentDetails =
        document.getElementById(
            "paymentDetails"
        );


    if (paymentDetails) {

        paymentDetails.innerHTML = `

            <p>

                <strong>
                    Payment Method:
                </strong>

                ${escapeHTML(
            order.paymentMethod ||
            "Cash on Delivery"
        )}

            </p>


            <p>

                <strong>
                    Payment Status:
                </strong>

                ${escapeHTML(
            order.paymentStatus ||
            "Pending"
        )}

            </p>


            <p>

                <strong>
                    Order Status:
                </strong>

                ${escapeHTML(
            order.orderStatus ||
            "Placed"
        )}

            </p>

        `;

    }


    // =================================================
    // PRICE DETAILS
    // =================================================

    const priceDetails =
        document.getElementById(
            "priceDetails"
        );


    if (priceDetails) {

        const subtotal =
            Number(
                order.subtotal
            ) ||
            calculateSubtotal(
                order.items
            );


        const deliveryCharge =
            Number(
                order.deliveryCharge
            ) || 0;


        const totalAmount =
            Number(
                order.totalAmount
            ) ||
            Number(
                order.total
            ) ||
            (
                subtotal +
                deliveryCharge
            );


        priceDetails.innerHTML = `

            <div class="price-row">

                <span>
                    Subtotal
                </span>


                <strong>

                    ₹${subtotal.toLocaleString(
            "en-IN"
        )}

                </strong>

            </div>


            <div class="price-row">

                <span>
                    Delivery
                </span>


                <strong>

                    ${deliveryCharge === 0
                ?
                "FREE"
                :
                "₹" +
                deliveryCharge.toLocaleString(
                    "en-IN"
                )
            }

                </strong>

            </div>


            <hr>


            <div class="price-row total">

                <span>
                    Total
                </span>


                <strong>

                    ₹${totalAmount.toLocaleString(
                "en-IN"
            )}

                </strong>

            </div>

        `;

    }


    // =================================================
    // ORDER TRACKING
    // =================================================

    updateTracking(
        order.orderStatus ||
        "Placed"
    );

}


// =====================================================
// CALCULATE SUBTOTAL
// =====================================================

function calculateSubtotal(
    items
) {

    if (
        !items ||
        !Array.isArray(items)
    ) {

        return 0;

    }


    return items.reduce(
        (
            total,
            item
        ) => {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            return (
                total +
                (
                    price *
                    quantity
                )
            );

        },
        0
    );

}


// =====================================================
// ORDER TRACKING
// =====================================================

function updateTracking(
    status
) {

    const statuses = [

        "Placed",

        "Confirmed",

        "Packed",

        "Shipped",

        "Delivered"

    ];


    let currentIndex =
        statuses.indexOf(
            status
        );


    // =================================================
    // CANCELLED ORDER
    // =================================================

    if (
        status === "Cancelled"
    ) {

        statuses.forEach(
            currentStatus => {

                const step =
                    document.getElementById(
                        "step" +
                        currentStatus
                    );


                if (step) {

                    step.classList.remove(
                        "completed"
                    );

                }

            }
        );


        const placedStep =
            document.getElementById(
                "stepPlaced"
            );


        if (placedStep) {

            placedStep.classList.add(
                "completed"
            );

        }


        return;

    }


    // =================================================
    // UNKNOWN STATUS
    // =================================================

    if (
        currentIndex === -1
    ) {

        currentIndex = 0;

    }


    statuses.forEach(
        (
            currentStatus,
            index
        ) => {

            const step =
                document.getElementById(
                    "step" +
                    currentStatus
                );


            if (!step) {

                return;

            }


            if (
                index <=
                currentIndex
            ) {

                step.classList.add(
                    "completed"
                );

            } else {

                step.classList.remove(
                    "completed"
                );

            }

        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================================
// START
// =====================================================

loadOrder();