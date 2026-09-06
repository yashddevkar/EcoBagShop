// =====================================================
// ECOBAG SHOP - MY ORDERS
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
// LOAD ORDERS
// =====================================================

async function loadOrders() {

    let user = null;


    // =================================================
    // GET USER
    // =================================================

    try {

        user =
            JSON.parse(
                localStorage.getItem("user")
            );

    } catch (error) {

        console.error(
            "User data error:",
            error
        );

    }


    const message =
        document.getElementById(
            "ordersMessage"
        );


    const container =
        document.getElementById(
            "ordersContainer"
        );


    // =================================================
    // CHECK LOGIN
    // =================================================

    if (
        !user ||
        !user.email
    ) {

        if (message) {

            message.textContent =
                "Please login to view your orders.";

        }

        return;

    }


    // =================================================
    // GET ORDERS
    // =================================================

    try {

        const token =
            localStorage.getItem(
                "token"
            );


        const response =
            await fetch(

                `${API_BASE_URL}/api/orders/user/${encodeURIComponent(
                    user.email
                )}`,

                {

                    method:
                        "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token || ""}`

                    }

                }

            );


        // =================================================
        // READ RESPONSE SAFELY
        // =================================================

        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (error) {

            console.error(
                "Invalid server response:",
                responseText
            );


            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );

        }


        console.log(
            "Orders:",
            data
        );


        // =================================================
        // AUTHENTICATION ERROR
        // =================================================

        if (
            response.status === 401
        ) {

            if (message) {

                message.textContent =
                    "Your session has expired. Please login again.";

            }


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );


            return;

        }


        // =================================================
        // SERVER ERROR
        // =================================================

        if (
            !response.ok ||
            !data.success
        ) {

            if (message) {

                message.textContent =
                    data.message ||
                    "Unable to load orders.";

            }

            return;

        }


        // =================================================
        // ORDER COUNT
        // =================================================

        if (message) {

            message.textContent =
                `${data.count || 0} order(s) found`;

        }


        // =================================================
        // NO ORDERS
        // =================================================

        if (
            !data.orders ||
            data.orders.length === 0
        ) {

            if (container) {

                container.innerHTML = `

                    <div class="no-orders">

                        <i
                            class="fa-solid fa-box-open"
                        ></i>


                        <h2>
                            No Orders Yet
                        </h2>


                        <p>
                            Start shopping and your orders
                            will appear here.
                        </p>


                        <a href="shop.html">
                            Start Shopping
                        </a>

                    </div>

                `;

            }

            return;

        }


        // =================================================
        // CHECK CONTAINER
        // =================================================

        if (!container) {

            return;

        }


        // =================================================
        // CLEAR CONTAINER
        // =================================================

        container.innerHTML = "";


        // =================================================
        // DISPLAY ORDERS
        // =================================================

        data.orders.forEach(
            order => {

                const orderCard =
                    document.createElement(
                        "div"
                    );


                orderCard.className =
                    "order-card";


                // =================================================
                // DATE
                // =================================================

                const orderDate =
                    order.createdAt
                        ?
                        new Date(
                            order.createdAt
                        ).toLocaleDateString(
                            "en-IN",
                            {

                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"

                            }
                        )
                        :
                        "Date unavailable";


                // =================================================
                // CANCEL BUTTON
                // =================================================

                let cancelButton =
                    "";


                if (

                    order.orderStatus ===
                    "Placed"

                    ||

                    order.orderStatus ===
                    "Confirmed"

                ) {

                    cancelButton = `

                        <button
                            class="cancel-order-btn"
                            onclick="cancelOrder('${escapeHTML(
                        order._id
                    )}')"
                            type="button"
                        >

                            <i
                                class="fa-solid fa-xmark"
                            ></i>

                            Cancel Order

                        </button>

                    `;

                }


                // =================================================
                // ORDER PRODUCTS
                // =================================================

                const productsHTML =
                    (order.items || [])
                        .map(
                            item => {

                                const image =
                                    item.image ||
                                    "";


                                return `

                                    <div
                                        class="order-product"
                                    >

                                        <div
                                            class="order-product-image"
                                        >

                                            ${image
                                        ?
                                        `
                                                        <img
                                                            src="${escapeHTML(
                                            image
                                        )}"
                                                            alt="${escapeHTML(
                                            item.name ||
                                            "EcoBag"
                                        )}"
                                                            onerror="
                                                                this.style.display='none'
                                                            "
                                                        >
                                                    `
                                        :
                                        `
                                                        <div
                                                            class="order-product-placeholder"
                                                        >
                                                            👜
                                                        </div>
                                                    `
                                    }

                                        </div>


                                        <div>

                                            <h3>

                                                ${escapeHTML(
                                        item.name ||
                                        "EcoBag"
                                    )}

                                            </h3>


                                            <p>

                                                ₹${Number(
                                        item.price ||
                                        0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}

                                                ×

                                                ${Number(
                                        item.quantity ||
                                        1
                                    )}

                                            </p>


                                            ${item.customization
                                        ?
                                        `
                                                        <span
                                                            class="custom-order-label"
                                                        >

                                                            🎨 Customized

                                                        </span>
                                                    `
                                        :
                                        ""
                                    }

                                        </div>

                                    </div>

                                `;

                            }
                        )
                        .join("");


                // =================================================
                // ORDER CARD
                // =================================================

                orderCard.innerHTML = `

                    <div class="order-header">


                        <div>

                            <strong>

                                Order #${escapeHTML(
                    order._id
                )}

                            </strong>


                            <p>

                                ${orderDate}

                            </p>

                        </div>


                        <span
                            class="order-status
                            ${String(
                    order.orderStatus ||
                    "Placed"
                ).toLowerCase()}"
                        >

                            ${escapeHTML(
                    order.orderStatus ||
                    "Placed"
                )}

                        </span>


                    </div>


                    <div class="order-products">

                        ${productsHTML}

                    </div>


                    <div class="order-footer">


                        <strong>

                            Total:

                            ₹${Number(
                    order.totalAmount ||
                    0
                ).toLocaleString(
                    "en-IN"
                )}

                        </strong>


                        <div
                            class="order-buttons"
                        >

                            <button
                                class="view-order-btn"
                                onclick="viewOrder('${escapeHTML(
                    order._id
                )}')"
                                type="button"
                            >

                                <i
                                    class="fa-solid fa-eye"
                                ></i>

                                View Order

                            </button>


                            ${cancelButton}

                        </div>


                    </div>

                `;


                container.appendChild(
                    orderCard
                );

            }
        );


    } catch (error) {

        console.error(
            "Orders error:",
            error
        );


        if (message) {

            message.textContent =
                error.message ||
                "Unable to connect to server.";

        }

    }

}


// =====================================================
// VIEW ORDER
// =====================================================

function viewOrder(
    orderId
) {

    if (!orderId) {

        return;

    }


    window.location.href =
        `order-details.html?id=${encodeURIComponent(
            orderId
        )}`;

}


// =====================================================
// CANCEL ORDER
// =====================================================

async function cancelOrder(
    orderId
) {

    if (!orderId) {

        alert(
            "Invalid order."
        );

        return;

    }


    const confirmCancel =
        confirm(
            "Are you sure you want to cancel this order?"
        );


    if (!confirmCancel) {

        return;

    }


    try {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            alert(
                "Please login again."
            );

            return;

        }


        const response =
            await fetch(

                `${API_BASE_URL}/api/orders/${encodeURIComponent(
                    orderId
                )}/cancel`,

                {

                    method:
                        "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    }

                }

            );


        // =================================================
        // READ RESPONSE SAFELY
        // =================================================

        const responseText =
            await response.text();


        let data = {};


        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (error) {

            console.error(
                "Invalid cancel response:",
                responseText
            );


            throw new Error(
                `Server returned an invalid response (${response.status}).`
            );

        }


        console.log(
            "Cancel Order Response:",
            data
        );


        // =================================================
        // AUTHENTICATION ERROR
        // =================================================

        if (
            response.status === 401
        ) {

            alert(
                "Your session has expired. Please login again."
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            return;

        }


        // =================================================
        // CANCEL ERROR
        // =================================================

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to cancel order."
            );

            return;

        }


        // =================================================
        // SUCCESS
        // =================================================

        alert(
            "Order cancelled successfully."
        );


        // Reload orders

        await loadOrders();

    } catch (error) {

        console.error(
            "Cancel Order Error:",
            error
        );


        alert(
            error.message ||
            "Server error. Please try again."
        );

    }

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
// LOAD ORDERS WHEN PAGE IS READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrders();

    }
);