// ============================================================
// ECOBAG SHOP - ADMIN DASHBOARD
// Complete Admin Dashboard JavaScript
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================

const API =
    window.ECOBAG_API_BASE ||
    (
        window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000/api"
            : "/api"
    );


// ============================================================
// COMMON HELPERS
// ============================================================

function safeNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


function formatCurrency(value) {
    return `₹${safeNumber(value).toLocaleString("en-IN")}`;
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ============================================================
// CHECK ADMIN
// ============================================================

function checkAdmin() {

    const token =
        localStorage.getItem("token");

    let user = null;

    try {

        user = JSON.parse(
            localStorage.getItem("user")
        );

    } catch (error) {

        console.error(
            "Unable to read user data:",
            error
        );
    }


    if (!token || !user) {

        window.location.href =
            "login.html";

        return false;
    }


    if (user.role !== "admin") {

        alert(
            "Admin access required."
        );

        window.location.href =
            "shop.html";

        return false;
    }


    const adminName =
        document.getElementById("adminName");


    if (adminName) {

        adminName.textContent =
            user.name || "Admin";
    }


    return true;
}


// ============================================================
// AUTH HEADERS
// ============================================================

function authHeaders() {

    const token =
        localStorage.getItem("token");


    return {

        "Content-Type":
            "application/json",

        "Authorization":
            "Bearer " + token
    };
}


// ============================================================
// API RESPONSE HELPER
// ============================================================

async function getJSONResponse(response) {

    const text =
        await response.text();

    let data = {};


    try {

        data =
            text
                ? JSON.parse(text)
                : {};

    } catch (error) {

        console.error(
            "Invalid server response:",
            text
        );

        throw new Error(
            "Server returned an invalid response."
        );
    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            `Server error (${response.status})`
        );
    }


    return data;
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        // ----------------------------------------------------
        // GET ORDERS
        // ----------------------------------------------------

        const ordersResponse =
            await fetch(
                `${API}/orders`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const ordersData =
            await getJSONResponse(
                ordersResponse
            );


        if (!ordersData.success) {

            throw new Error(
                ordersData.message ||
                "Unable to load orders."
            );
        }


        const orders =
            Array.isArray(
                ordersData.orders
            )
                ? ordersData.orders
                : [];


        // ----------------------------------------------------
        // GET PRODUCTS
        // ----------------------------------------------------

        const productsResponse =
            await fetch(
                `${API}/products`
            );


        const productsData =
            await getJSONResponse(
                productsResponse
            );


        if (!productsData.success) {

            throw new Error(
                productsData.message ||
                "Unable to load products."
            );
        }


        const products =
            Array.isArray(
                productsData.products
            )
                ? productsData.products
                : [];


        // ----------------------------------------------------
        // GET USERS
        // ----------------------------------------------------

        const usersResponse =
            await fetch(
                `${API}/users`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const usersData =
            await getJSONResponse(
                usersResponse
            );


        if (!usersData.success) {

            throw new Error(
                usersData.message ||
                "Unable to load customers."
            );
        }


        const users =
            Array.isArray(
                usersData.users
            )
                ? usersData.users
                : [];


        // ----------------------------------------------------
        // STATISTICS
        // ----------------------------------------------------

        const totalOrders =
            orders.length;


        const validOrders =
            orders.filter(function (order) {

                return String(
                    order.orderStatus || ""
                ).toLowerCase() !== "cancelled";

            });


        const revenueValue =
            validOrders.reduce(
                function (total, order) {

                    return total +
                        safeNumber(
                            order.totalAmount
                        );

                },
                0
            );


        const totalCustomers =
            users.filter(function (user) {

                return user &&
                    user.role !== "admin";

            }).length;


        const totalProducts =
            products.length;


        const pendingOrders =
            orders.filter(function (order) {

                const status =
                    String(
                        order.orderStatus ||
                        "Placed"
                    ).toLowerCase();


                return (
                    status !== "delivered" &&
                    status !== "cancelled"
                );

            }).length;


        const deliveredOrders =
            orders.filter(function (order) {

                return String(
                    order.orderStatus || ""
                ).toLowerCase() === "delivered";

            }).length;


        const lowStockProducts =
            products.filter(function (product) {

                return safeNumber(
                    product.stock
                ) <= 10;

            }).length;


        // ----------------------------------------------------
        // UPDATE DASHBOARD CARDS
        // ----------------------------------------------------

        setText(
            "totalOrders",
            totalOrders
        );


        setText(
            "revenue",
            formatCurrency(
                revenueValue
            )
        );


        setText(
            "totalCustomers",
            totalCustomers
        );


        setText(
            "totalProducts",
            totalProducts
        );


        setText(
            "pendingOrders",
            pendingOrders
        );


        setText(
            "deliveredOrders",
            deliveredOrders
        );


        setText(
            "lowStockProducts",
            lowStockProducts
        );


        console.log(
            "Dashboard loaded:",
            {
                totalOrders,
                revenueValue,
                totalCustomers,
                totalProducts,
                pendingOrders,
                deliveredOrders,
                lowStockProducts
            }
        );

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );
    }
}


// ============================================================
// SALES ANALYTICS
// ============================================================

async function loadSalesAnalytics() {

    try {

        const response =
            await fetch(
                `${API}/orders`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load sales data."
            );
        }


        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        // ----------------------------------------------------
        // IGNORE CANCELLED ORDERS
        // ----------------------------------------------------

        const validOrders =
            orders.filter(function (order) {

                return String(
                    order.orderStatus || ""
                ).toLowerCase() !== "cancelled";

            });


        // ----------------------------------------------------
        // TOTAL REVENUE
        // ----------------------------------------------------

        const totalRevenue =
            validOrders.reduce(
                function (total, order) {

                    return total +
                        safeNumber(
                            order.totalAmount
                        );

                },
                0
            );


        // ----------------------------------------------------
        // TODAY'S SALES
        // ----------------------------------------------------

        const today =
            new Date();


        const todayString =
            today.toDateString();


        let todaySales = 0;


        validOrders.forEach(
            function (order) {

                if (!order.createdAt) {
                    return;
                }


                const orderDate =
                    new Date(
                        order.createdAt
                    );


                if (
                    !isNaN(
                        orderDate.getTime()
                    ) &&
                    orderDate.toDateString() ===
                    todayString
                ) {

                    todaySales +=
                        safeNumber(
                            order.totalAmount
                        );
                }

            }
        );


        // ----------------------------------------------------
        // AVERAGE ORDER VALUE
        // ----------------------------------------------------

        const averageOrder =
            validOrders.length > 0
                ? totalRevenue /
                validOrders.length
                : 0;


        // ----------------------------------------------------
        // UPDATE ANALYTICS CARDS
        // ----------------------------------------------------

        setText(
            "analyticsTotalRevenue",
            formatCurrency(
                totalRevenue
            )
        );


        setText(
            "analyticsTodaySales",
            formatCurrency(
                todaySales
            )
        );


        setText(
            "analyticsTotalOrders",
            validOrders.length
        );


        setText(
            "analyticsAverageOrder",
            formatCurrency(
                averageOrder
            )
        );


        // ----------------------------------------------------
        // DAILY SALES
        // ----------------------------------------------------

        const dailySales =
            {};


        for (
            let i = 6;
            i >= 0;
            i--
        ) {

            const date =
                new Date();


            date.setHours(
                0,
                0,
                0,
                0
            );


            date.setDate(
                date.getDate() - i
            );


            const year =
                date.getFullYear();


            const month =
                String(
                    date.getMonth() + 1
                ).padStart(
                    2,
                    "0"
                );


            const day =
                String(
                    date.getDate()
                ).padStart(
                    2,
                    "0"
                );


            const key =
                `${year}-${month}-${day}`;


            dailySales[key] = {

                amount: 0,

                date: date
            };
        }


        validOrders.forEach(
            function (order) {

                if (!order.createdAt) {
                    return;
                }


                const orderDate =
                    new Date(
                        order.createdAt
                    );


                if (
                    isNaN(
                        orderDate.getTime()
                    )
                ) {
                    return;
                }


                const year =
                    orderDate.getFullYear();


                const month =
                    String(
                        orderDate.getMonth() + 1
                    ).padStart(
                        2,
                        "0"
                    );


                const day =
                    String(
                        orderDate.getDate()
                    ).padStart(
                        2,
                        "0"
                    );


                const key =
                    `${year}-${month}-${day}`;


                if (
                    dailySales[key]
                ) {

                    dailySales[key].amount +=
                        safeNumber(
                            order.totalAmount
                        );
                }

            }
        );


        renderSalesChart(
            dailySales
        );


        // ----------------------------------------------------
        // TOP SELLING PRODUCTS
        // ----------------------------------------------------

        const productSales =
            {};


        validOrders.forEach(
            function (order) {

                if (
                    !Array.isArray(
                        order.items
                    )
                ) {
                    return;
                }


                order.items.forEach(
                    function (item) {

                        if (!item) {
                            return;
                        }


                        const productName =
                            item.productName ||
                            item.name ||
                            (
                                item.product &&
                                item.product.name
                            ) ||
                            "Unknown Product";


                        const quantity =
                            safeNumber(
                                item.quantity ??
                                item.qty ??
                                1,
                                1
                            );


                        const key =
                            String(
                                productName
                            );


                        if (
                            !productSales[key]
                        ) {

                            productSales[key] = {

                                name:
                                    productName,

                                quantity:
                                    0
                            };
                        }


                        productSales[key].quantity +=
                            quantity;
                    }
                );

            }
        );


        renderTopSellingProducts(
            productSales
        );


    } catch (error) {

        console.error(
            "Sales Analytics Error:",
            error
        );


        setText(
            "analyticsTotalRevenue",
            "₹0"
        );


        setText(
            "analyticsTodaySales",
            "₹0"
        );


        setText(
            "analyticsTotalOrders",
            "0"
        );


        setText(
            "analyticsAverageOrder",
            "₹0"
        );


        const chart =
            document.getElementById(
                "salesChart"
            );


        if (chart) {

            chart.innerHTML = `
                <p class="analytics-loading">
                    Unable to load sales analytics.
                </p>
            `;
        }
    }
}


// ============================================================
// RENDER SALES CHART
// ============================================================

function renderSalesChart(
    dailySales
) {

    const chart =
        document.getElementById(
            "salesChart"
        );


    if (!chart) {
        return;
    }


    const values =
        Object.values(
            dailySales
        );


    if (values.length === 0) {

        chart.innerHTML = `
            <p class="analytics-loading">
                No sales data available.
            </p>
        `;

        return;
    }


    const maxValue =
        Math.max(
            ...values.map(
                function (item) {
                    return item.amount;
                }
            ),
            1
        );


    chart.innerHTML =
        values.map(
            function (item) {

                const percentage =
                    (
                        item.amount /
                        maxValue
                    ) * 100;


                const dateLabel =
                    item.date.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short"
                        }
                    );


                return `
                    <div class="chart-bar-container">

                        <div class="chart-value">
                            ${formatCurrency(
                    item.amount
                )}
                        </div>

                        <div
                            class="chart-bar"
                            style="
                                height:${Math.max(
                    percentage,
                    3
                )}%;
                            "
                            title="${formatCurrency(
                    item.amount
                )}"
                        ></div>

                        <div class="chart-date">
                            ${escapeHTML(
                    dateLabel
                )}
                        </div>

                    </div>
                `;

            }
        ).join("");
}


// ============================================================
// TOP SELLING PRODUCTS
// ============================================================

function renderTopSellingProducts(
    productSales
) {

    const container =
        document.getElementById(
            "topSellingProducts"
        );


    if (!container) {
        return;
    }


    const products =
        Object.values(
            productSales
        )
            .sort(
                function (a, b) {

                    return b.quantity -
                        a.quantity;
                }
            )
            .slice(
                0,
                5
            );


    if (products.length === 0) {

        container.innerHTML = `
            <p class="analytics-loading">
                No product sales available yet.
            </p>
        `;

        return;
    }


    container.innerHTML =
        products.map(
            function (product, index) {

                return `
                    <div class="top-product-row">

                        <div class="product-rank">
                            ${index + 1}
                        </div>

                        <div class="top-product-info">

                            <strong>
                                ${escapeHTML(
                    product.name
                )}
                            </strong>

                            <span>
                                ${product.quantity}
                                unit${product.quantity !== 1 ? "s" : ""}
                                sold
                            </span>

                        </div>

                        <div class="top-product-sales">
                            ${product.quantity}
                        </div>

                    </div>
                `;

            }
        ).join("");
}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrders() {

    const table =
        document.getElementById(
            "ordersTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td
                colspan="6"
                class="loading-cell"
            >
                Loading orders...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API}/orders`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load orders."
            );
        }


        const orders =
            Array.isArray(
                data.orders
            )
                ? data.orders
                : [];


        if (orders.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="loading-cell"
                    >
                        No orders found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML = "";


        orders.forEach(
            function (order) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const orderId =
                    String(
                        order._id || ""
                    );


                const shortOrderId =
                    orderId.length > 8
                        ? orderId.slice(-8)
                        : orderId;


                const customer =
                    order.customer || {};


                const customerName =
                    customer.name ||
                    "Customer";


                const customerEmail =
                    customer.email ||
                    "No email";


                const orderTotal =
                    safeNumber(
                        order.totalAmount
                    );


                const orderStatus =
                    order.orderStatus ||
                    "Placed";


                const date =
                    order.createdAt
                        ? new Date(
                            order.createdAt
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )
                        : "N/A";


                // ------------------------------------------------
                // CUSTOMIZATION INDICATOR
                // ------------------------------------------------

                let customizedIndicator =
                    "";


                const hasCustomization =
                    Array.isArray(
                        order.items
                    ) &&
                    order.items.some(
                        function (item) {

                            return item &&
                                item.customization;
                        }
                    );


                if (
                    hasCustomization
                ) {

                    customizedIndicator = `
                        <span
                            class="custom-order-badge"
                            title="This order contains a customized bag"
                        >
                            🎨 Custom
                        </span>
                    `;
                }


                // ------------------------------------------------
                // ORDER ROW
                // ------------------------------------------------

                row.innerHTML = `

                    <td>

                        <span class="order-id">

                            #${escapeHTML(
                    shortOrderId
                )}

                        </span>

                    </td>


                    <td>

                        <span class="customer-name">

                            ${escapeHTML(
                    customerName
                )}

                        </span>

                        <br>

                        <small>

                            ${escapeHTML(
                    customerEmail
                )}

                        </small>

                        ${customizedIndicator}

                    </td>


                    <td>
                        ${escapeHTML(
                    date
                )}
                    </td>


                    <td>

                        <strong>

                            ${formatCurrency(
                    orderTotal
                )}

                        </strong>

                    </td>


                    <td>

                        <select
                            class="status-select"
                            id="status-${escapeHTML(
                    orderId
                )}"
                        >

                            ${statusOption(
                    "Placed",
                    orderStatus
                )}

                            ${statusOption(
                    "Confirmed",
                    orderStatus
                )}

                            ${statusOption(
                    "Packed",
                    orderStatus
                )}

                            ${statusOption(
                    "Shipped",
                    orderStatus
                )}

                            ${statusOption(
                    "Delivered",
                    orderStatus
                )}

                            ${statusOption(
                    "Cancelled",
                    orderStatus
                )}

                        </select>

                    </td>


                    <td>

                        <div class="order-actions">

                            <button
                                class="view-order-btn"
                                type="button"
                                onclick="viewAdminOrder('${escapeJS(
                    orderId
                )}')"
                            >

                                <i class="fa-solid fa-eye"></i>

                                View

                            </button>


                            <button
                                class="update-status-btn"
                                type="button"
                                onclick="updateOrderStatus('${escapeJS(
                    orderId
                )}')"
                            >

                                <i class="fa-solid fa-pen"></i>

                                Update

                            </button>


                            <button
                                class="admin-delete-btn"
                                type="button"
                                onclick="deleteOrder('${escapeJS(
                    orderId
                )}')"
                            >

                                <i class="fa-solid fa-trash"></i>

                                Delete

                            </button>

                        </div>

                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Orders Error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="loading-cell"
                >
                    Unable to load orders.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// STATUS OPTION
// ============================================================

function statusOption(
    value,
    current
) {

    return `
        <option
            value="${escapeHTML(
        value
    )}"
            ${value === current
            ? "selected"
            : ""
        }
        >
            ${escapeHTML(
            value
        )}
        </option>
    `;
}


// ============================================================
// VIEW ORDER
// ============================================================

async function viewAdminOrder(
    orderId
) {

    if (!orderId) {

        alert(
            "Order ID is missing."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/orders/${encodeURIComponent(
                    orderId
                )}`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (
            !data.success ||
            !data.order
        ) {

            throw new Error(
                data.message ||
                "Unable to load order."
            );
        }


        showAdminOrderDetails(
            data.order
        );


    } catch (error) {

        console.error(
            "View Order Error:",
            error
        );


        alert(
            error.message ||
            "Unable to load order details."
        );
    }
}


// ============================================================
// SHOW ORDER DETAILS MODAL
// ============================================================

function showAdminOrderDetails(
    order
) {

    // Remove old modal
    const oldModal =
        document.getElementById(
            "adminOrderDetailsModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const customer =
        order.customer || {};


    const address =
        order.shippingAddress || {};


    const items =
        Array.isArray(
            order.items
        )
            ? order.items
            : [];


    const orderId =
        String(
            order._id || ""
        );


    const shortOrderId =
        orderId.length > 8
            ? orderId.slice(-8)
            : orderId;


    const orderDate =
        order.createdAt
            ? new Date(
                order.createdAt
            ).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "N/A";


    // --------------------------------------------------------
    // ORDER ITEMS
    // --------------------------------------------------------

    let itemsHTML = "";


    if (items.length === 0) {

        itemsHTML = `
            <div style="
                padding:20px;
                text-align:center;
                color:#777;
            ">
                No items found.
            </div>
        `;

    } else {

        itemsHTML =
            items.map(
                function (item) {

                    const price =
                        safeNumber(
                            item.price
                        );


                    const quantity =
                        safeNumber(
                            item.quantity,
                            1
                        );


                    const itemTotal =
                        price *
                        quantity;


                    return `
                        <div class="admin-view-item">

                            <div class="admin-view-item-left">

                                ${item.image
                            ? `
                                            <img
                                                src="${escapeHTML(
                                item.image
                            )}"
                                                alt="${escapeHTML(
                                item.name ||
                                "Product"
                            )}"
                                            >
                                        `
                            : `
                                            <div class="admin-view-no-image">

                                                <i class="fa-solid fa-bag-shopping"></i>

                                            </div>
                                        `
                        }


                                <div>

                                    <strong>

                                        ${escapeHTML(
                            item.name ||
                            "Product"
                        )}

                                    </strong>


                                    <p>

                                        ${formatCurrency(
                            price
                        )}

                                        ×

                                        ${quantity}

                                    </p>

                                </div>

                            </div>


                            <strong>

                                ${formatCurrency(
                            itemTotal
                        )}

                            </strong>

                        </div>
                    `;

                }
            ).join("");
    }


    // --------------------------------------------------------
    // ADDRESS PIN
    // --------------------------------------------------------

    const pincode =
        address.pincode ||
        address.pin ||
        "";


    // --------------------------------------------------------
    // CREATE MODAL
    // --------------------------------------------------------

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "adminOrderDetailsModal";


    modal.innerHTML = `

        <div
            class="admin-view-overlay"
            onclick="closeAdminOrderDetails(event)"
        >

            <div
                class="admin-view-modal"
                onclick="event.stopPropagation()"
            >

                <!-- HEADER -->

                <div class="admin-view-header">

                    <div>

                        <small>
                            ORDER DETAILS
                        </small>

                        <h2>
                            #${escapeHTML(
        shortOrderId
    )}
                        </h2>

                    </div>


                    <button
                        type="button"
                        onclick="closeAdminOrderDetails()"
                        class="admin-view-close"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>


                <!-- CUSTOMER -->

                <div class="admin-view-section">

                    <h3>

                        <i class="fa-solid fa-user"></i>

                        Customer Information

                    </h3>


                    <div class="admin-view-grid">

                        <div>

                            <span>
                                Name
                            </span>

                            <strong>
                                ${escapeHTML(
        customer.name ||
        "N/A"
    )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Email
                            </span>

                            <strong>
                                ${escapeHTML(
        customer.email ||
        order.customerEmail ||
        "N/A"
    )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Phone
                            </span>

                            <strong>
                                ${escapeHTML(
        customer.phone ||
        "N/A"
    )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Order Date
                            </span>

                            <strong>
                                ${escapeHTML(
        orderDate
    )}
                            </strong>

                        </div>

                    </div>

                </div>


                <!-- SHIPPING ADDRESS -->

                <div class="admin-view-section">

                    <h3>

                        <i class="fa-solid fa-location-dot"></i>

                        Shipping Address

                    </h3>


                    <div class="admin-view-address">

                        <strong>

                            ${escapeHTML(
        address.address ||
        "Address not available"
    )}

                        </strong>


                        <span>

                            ${escapeHTML(
        [
            address.city,
            address.state
        ]
            .filter(Boolean)
            .join(", ")
    )}

                            ${pincode
            ? ` - ${escapeHTML(
                pincode
            )}`
            : ""
        }

                        </span>


                        ${address.landmark
            ? `
                                    <span>

                                        Landmark:

                                        ${escapeHTML(
                address.landmark
            )}

                                    </span>
                                `
            : ""
        }

                    </div>

                </div>


                <!-- ORDER ITEMS -->

                <div class="admin-view-section">

                    <h3>

                        <i class="fa-solid fa-bag-shopping"></i>

                        Ordered Products

                    </h3>


                    <div class="admin-view-items">

                        ${itemsHTML}

                    </div>

                </div>


                <!-- PAYMENT -->

                <div class="admin-view-section">

                    <h3>

                        <i class="fa-solid fa-credit-card"></i>

                        Payment Information

                    </h3>


                    <div class="admin-view-grid">

                        <div>

                            <span>
                                Payment Method
                            </span>

                            <strong>

                                ${escapeHTML(
            order.paymentMethod ||
            "COD"
        )}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Payment Status
                            </span>

                            <strong>

                                ${escapeHTML(
            order.paymentStatus ||
            "Pending"
        )}

                            </strong>

                        </div>


                        <div>

                            <span>
                                Order Status
                            </span>

                            <strong>

                                ${escapeHTML(
            order.orderStatus ||
            "Placed"
        )}

                            </strong>

                        </div>

                    </div>

                </div>


                <!-- TOTAL -->

                <div class="admin-view-total">

                    <div>

                        <span>
                            Subtotal
                        </span>

                        <strong>

                            ${formatCurrency(
            order.subtotal
        )}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Delivery
                        </span>

                        <strong>

                            ${formatCurrency(
            order.deliveryCharge
        )}

                        </strong>

                    </div>


                    <div class="grand-total">

                        <span>
                            Total Amount
                        </span>

                        <strong>

                            ${formatCurrency(
            order.totalAmount
        )}

                        </strong>

                    </div>

                </div>


                <!-- FOOTER -->

                <div class="admin-view-footer">

                    <button
                        type="button"
                        onclick="closeAdminOrderDetails()"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    addAdminViewStyles();
}


// ============================================================
// CLOSE ORDER DETAILS
// ============================================================

function closeAdminOrderDetails(
    event
) {

    if (
        event &&
        event.target &&
        !event.target.classList.contains(
            "admin-view-overlay"
        )
    ) {

        return;
    }


    const modal =
        document.getElementById(
            "adminOrderDetailsModal"
        );


    if (modal) {
        modal.remove();
    }
}


// ============================================================
// ORDER MODAL STYLES
// ============================================================

function addAdminViewStyles() {

    if (
        document.getElementById(
            "adminViewStyles"
        )
    ) {

        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "adminViewStyles";


    style.textContent = `

        #adminOrderDetailsModal {

            position: fixed;

            inset: 0;

            z-index: 99999;
        }


        .admin-view-overlay {

            position: fixed;

            inset: 0;

            background:
                rgba(0,0,0,0.55);

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

            overflow-y: auto;
        }


        .admin-view-modal {

            width: 900px;

            max-width: 100%;

            max-height: 90vh;

            overflow-y: auto;

            background: #ffffff;

            border-radius: 18px;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,0.25);
        }


        .admin-view-header {

            display: flex;

            justify-content:
                space-between;

            align-items: center;

            padding:
                22px 26px;

            border-bottom:
                1px solid #e5ebe7;
        }


        .admin-view-header small {

            color: #25824e;

            font-weight: 700;

            letter-spacing: 1px;
        }


        .admin-view-header h2 {

            margin:
                5px 0 0;

            color: #173b2b;
        }


        .admin-view-close {

            width: 40px;

            height: 40px;

            border: none;

            border-radius: 50%;

            background: #f1f5f2;

            cursor: pointer;

            font-size: 18px;
        }


        .admin-view-section {

            padding:
                20px 26px;

            border-bottom:
                1px solid #edf1ee;
        }


        .admin-view-section h3 {

            margin:
                0 0 15px;

            color: #173b2b;

            font-size: 17px;
        }


        .admin-view-section h3 i {

            margin-right: 7px;

            color: #25824e;
        }


        .admin-view-grid {

            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 12px;
        }


        .admin-view-grid > div {

            background:
                #f8fbf9;

            border:
                1px solid #e5ebe7;

            border-radius: 10px;

            padding: 13px;
        }


        .admin-view-grid span {

            display: block;

            font-size: 11px;

            color: #718078;

            margin-bottom: 6px;

            text-transform:
                uppercase;
        }


        .admin-view-grid strong {

            display: block;

            color: #173b2b;

            word-break:
                break-word;
        }


        .admin-view-address {

            display: flex;

            flex-direction:
                column;

            gap: 5px;

            padding: 15px;

            background:
                #f8fbf9;

            border-radius: 10px;

            color: #596d62;
        }


        .admin-view-address strong {

            color: #173b2b;
        }


        .admin-view-items {

            display: flex;

            flex-direction:
                column;

            gap: 10px;
        }


        .admin-view-item {

            display: flex;

            justify-content:
                space-between;

            align-items: center;

            gap: 15px;

            padding: 12px;

            border:
                1px solid #e5ebe7;

            border-radius: 12px;
        }


        .admin-view-item-left {

            display: flex;

            align-items: center;

            gap: 13px;
        }


        .admin-view-item-left img,
        .admin-view-no-image {

            width: 65px;

            height: 65px;

            object-fit: cover;

            border-radius: 10px;

            background:
                #f1f5f2;

            display: flex;

            align-items: center;

            justify-content: center;
        }


        .admin-view-item-left p {

            margin:
                5px 0 0;

            color: #718078;

            font-size: 13px;
        }


        .admin-view-total {

            padding:
                20px 26px;

            margin-left: auto;

            max-width: 400px;
        }


        .admin-view-total > div {

            display: flex;

            justify-content:
                space-between;

            padding: 7px 0;

            color: #65766d;
        }


        .admin-view-total .grand-total {

            border-top:
                1px solid #dce5df;

            margin-top: 8px;

            padding-top: 14px;

            font-size: 18px;

            color: #173b2b;
        }


        .admin-view-footer {

            display: flex;

            justify-content:
                flex-end;

            padding:
                15px 26px;

            border-top:
                1px solid #e5ebe7;
        }


        .admin-view-footer button {

            border: none;

            background: #25824e;

            color: white;

            padding:
                10px 22px;

            border-radius: 8px;

            cursor: pointer;

            font-weight: 600;
        }


        @media (max-width: 700px) {

            .admin-view-grid {

                grid-template-columns:
                    repeat(2, 1fr);
            }
        }


        @media (max-width: 450px) {

            .admin-view-grid {

                grid-template-columns:
                    1fr;
            }


            .admin-view-item {

                align-items:
                    flex-start;
            }


            .admin-view-item > strong {

                font-size: 13px;
            }


            .admin-view-header,
            .admin-view-section {

                padding-left: 16px;

                padding-right: 16px;
            }


            .admin-view-total {

                padding:
                    16px;
            }


            .admin-view-footer {

                padding:
                    14px 16px;
            }
        }

    `;


    document.head.appendChild(
        style
    );
}


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

async function updateOrderStatus(
    orderId
) {

    const select =
        document.getElementById(
            `status-${orderId}`
        );


    if (!select) {

        alert(
            "Order status control not found."
        );

        return;
    }


    const orderStatus =
        select.value;


    if (!orderStatus) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/orders/${encodeURIComponent(
                    orderId
                )}/status`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        orderStatus:
                            orderStatus
                    })
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to update order."
            );
        }


        alert(
            "Order status updated successfully."
        );


        await Promise.all([
            loadDashboard(),
            loadOrders(),
            loadSalesAnalytics()
        ]);


    } catch (error) {

        console.error(
            "Update Order Error:",
            error
        );


        alert(
            error.message ||
            "Unable to update order."
        );
    }
}


// ============================================================
// DELETE ORDER
// ============================================================

async function deleteOrder(
    orderId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to permanently delete this order?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/orders/${encodeURIComponent(
                    orderId
                )}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to delete order."
            );
        }


        alert(
            "Order deleted successfully."
        );


        await Promise.all([
            loadDashboard(),
            loadOrders(),
            loadSalesAnalytics()
        ]);


    } catch (error) {

        console.error(
            "Delete Order Error:",
            error
        );


        alert(
            error.message ||
            "Server error while deleting order."
        );
    }
}


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

    const container =
        document.getElementById(
            "productsGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="loading-box">
            Loading products...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API}/products`
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load products."
            );
        }


        const products =
            Array.isArray(
                data.products
            )
                ? data.products
                : [];


        container.innerHTML = "";


        if (products.length === 0) {

            container.innerHTML = `
                <div class="loading-box">
                    No products found.
                </div>
            `;

            return;
        }


        products.forEach(
            function (product) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-product-card";


                const productPrice =
                    safeNumber(
                        product.price
                    );


                const discount =
                    safeNumber(
                        product.discount
                    );


                const finalPrice =
                    Math.round(
                        productPrice -
                        (
                            productPrice *
                            discount /
                            100
                        )
                    );


                const savings =
                    Math.max(
                        0,
                        Math.round(
                            productPrice -
                            finalPrice
                        )
                    );


                const stock =
                    safeNumber(
                        product.stock
                    );


                const stockClass =
                    stock <= 10
                        ? "stock-low"
                        : "";


                card.innerHTML = `

                    <!-- PRODUCT IMAGE -->

                    <img
                        src="${escapeHTML(
                    product.image || ""
                )}"
                        alt="${escapeHTML(
                    product.name ||
                    "Product"
                )}"
                    >


                    <div class="admin-product-info">

                        <!-- NAME -->

                        <h3>

                            ${escapeHTML(
                    product.name ||
                    "Product"
                )}

                        </h3>


                        <!-- CATEGORY -->

                        <p>

                            ${escapeHTML(
                    product.category ||
                    "Uncategorized"
                )}

                        </p>


                        <!-- CURRENT PRICE -->

                        <div class="product-price">

                            Selling Price:

                            <strong>

                                ${formatCurrency(
                    finalPrice
                )}

                            </strong>

                            ${discount > 0
                        ? `
                                        <span
                                            style="
                                                color:#d32f2f;
                                                font-size:12px;
                                                margin-left:5px;
                                            "
                                        >
                                            ${discount}% OFF
                                        </span>
                                    `
                        : ""
                    }

                        </div>


                        ${savings > 0
                        ? `
                                    <small
                                        style="
                                            color:#25824e;
                                            display:block;
                                            margin-top:4px;
                                        "
                                    >
                                        Customer saves
                                        ${formatCurrency(
                            savings
                        )}
                                    </small>
                                `
                        : ""
                    }


                        <!-- PRICE MANAGEMENT -->

                        <div class="price-management">

                            <label
                                for="price-${escapeHTML(
                        product._id
                    )}"
                            >
                                Original Price (₹)
                            </label>


                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                id="price-${escapeHTML(
                        product._id
                    )}"
                                value="${productPrice}"
                                placeholder="Enter price"
                                oninput="updateSellingPrice('${escapeJS(
                        product._id
                    )}')"
                            >


                            <label
                                for="discount-${escapeHTML(
                        product._id
                    )}"
                            >
                                Discount (%)
                            </label>


                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                id="discount-${escapeHTML(
                        product._id
                    )}"
                                value="${discount}"
                                placeholder="0 - 100"
                                oninput="updateSellingPrice('${escapeJS(
                        product._id
                    )}')"
                            >


                            <div
                                class="calculated-selling-price"
                                id="selling-${escapeHTML(
                        product._id
                    )}"
                            >

                                Selling Price:

                                ${formatCurrency(
                        finalPrice
                    )}

                            </div>


                            <button
                                type="button"
                                class="save-price-btn"
                                onclick="updateProductPrice('${escapeJS(
                        product._id
                    )}')"
                            >

                                <i class="fa-solid fa-floppy-disk"></i>

                                Save Price & Discount

                            </button>

                        </div>


                        <!-- STOCK -->

                        <span
                            class="stock-label ${stockClass}"
                        >

                            Current Stock:

                            <strong>
                                ${stock}
                            </strong>

                        </span>


                        <!-- STOCK MANAGEMENT -->

                        <div class="stock-management">

                            <label>
                                Add Stock
                            </label>


                            <div class="stock-control">

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value="1"
                                    id="stock-${escapeHTML(
                        product._id
                    )}"
                                    placeholder="Quantity"
                                >


                                <button
                                    type="button"
                                    onclick="addStock('${escapeJS(
                        product._id
                    )}')"
                                >

                                    <i class="fa-solid fa-plus"></i>

                                    Add

                                </button>

                            </div>

                        </div>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Products Error:",
            error
        );


        container.innerHTML = `
            <div class="loading-box">
                Unable to load products.
            </div>
        `;
    }
}


// ============================================================
// UPDATE PRODUCT PRICE & DISCOUNT
// ============================================================

async function updateProductPrice(
    productId
) {

    const priceInput =
        document.getElementById(
            `price-${productId}`
        );


    const discountInput =
        document.getElementById(
            `discount-${productId}`
        );


    if (
        !priceInput ||
        !discountInput
    ) {

        alert(
            "Price controls not found."
        );

        return;
    }


    const price =
        Number(
            priceInput.value
        );


    const discount =
        Number(
            discountInput.value
        );


    // --------------------------------------------------------
    // VALIDATE PRICE
    // --------------------------------------------------------

    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );

        return;
    }


    // --------------------------------------------------------
    // VALIDATE DISCOUNT
    // --------------------------------------------------------

    if (
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > 100
    ) {

        alert(
            "Discount must be between 0% and 100%."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/products/${encodeURIComponent(
                    productId
                )}`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        price: price,
                        discount: discount
                    })
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to update product price."
            );
        }


        alert(
            "Product price and discount updated successfully!"
        );


        await Promise.all([
            loadProducts(),
            loadDashboard()
        ]);


    } catch (error) {

        console.error(
            "Update Product Price Error:",
            error
        );


        alert(
            error.message ||
            "Server error while updating product."
        );
    }
}


// ============================================================
// LIVE SELLING PRICE
// ============================================================

function updateSellingPrice(
    productId
) {

    const priceInput =
        document.getElementById(
            `price-${productId}`
        );


    const discountInput =
        document.getElementById(
            `discount-${productId}`
        );


    const sellingPriceElement =
        document.getElementById(
            `selling-${productId}`
        );


    if (
        !priceInput ||
        !discountInput ||
        !sellingPriceElement
    ) {

        return;
    }


    const price =
        Number(
            priceInput.value
        ) || 0;


    let discount =
        Number(
            discountInput.value
        ) || 0;


    discount =
        Math.min(
            100,
            Math.max(
                0,
                discount
            )
        );


    const sellingPrice =
        Math.round(
            price -
            (
                price *
                discount /
                100
            )
        );


    sellingPriceElement.textContent =
        `Selling Price: ${formatCurrency(
            sellingPrice
        )}`;
}


// ============================================================
// ADD STOCK
// ============================================================

async function addStock(
    productId
) {

    const input =
        document.getElementById(
            `stock-${productId}`
        );


    if (!input) {
        return;
    }


    const quantity =
        Number(
            input.value
        );


    if (
        !Number.isInteger(
            quantity
        ) ||
        quantity <= 0
    ) {

        alert(
            "Please enter a valid whole-number stock quantity."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API}/products/${encodeURIComponent(
                    productId
                )}/add-stock`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        quantity:
                            quantity
                    })
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to add stock."
            );
        }


        alert(
            `${quantity} stock added successfully!`
        );


        input.value =
            1;


        await Promise.all([
            loadProducts(),
            loadDashboard()
        ]);


    } catch (error) {

        console.error(
            "Add Stock Error:",
            error
        );


        alert(
            error.message ||
            "Server error while adding stock."
        );
    }
}


// ============================================================
// LOAD CUSTOMERS
// ============================================================

async function loadCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td
                colspan="4"
                class="loading-cell"
            >
                Loading customers...
            </td>
        </tr>
    `;


    try {

        const response =
            await fetch(
                `${API}/users`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const data =
            await getJSONResponse(
                response
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load customers."
            );
        }


        const users =
            Array.isArray(
                data.users
            )
                ? data.users
                : [];


        // ----------------------------------------------------
        // SHOW CUSTOMERS ONLY
        // ----------------------------------------------------

        const customers =
            users.filter(
                function (user) {

                    return user &&
                        user.role !== "admin";
                }
            );


        table.innerHTML = "";


        if (
            customers.length === 0
        ) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="4"
                        class="loading-cell"
                    >
                        No customers found.
                    </td>
                </tr>
            `;

            return;
        }


        customers.forEach(
            function (customer) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const joined =
                    customer.createdAt
                        ? new Date(
                            customer.createdAt
                        ).toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )
                        : "N/A";


                row.innerHTML = `

                    <td>

                        <strong>

                            ${escapeHTML(
                    customer.name ||
                    "Customer"
                )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHTML(
                    customer.email ||
                    "N/A"
                )}

                    </td>


                    <td>

                        ${escapeHTML(
                    customer.phone ||
                    "Not provided"
                )}

                    </td>


                    <td>

                        ${escapeHTML(
                    joined
                )}

                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Customers Error:",
            error
        );


        table.innerHTML = `
            <tr>
                <td
                    colspan="4"
                    class="loading-cell"
                >
                    Unable to load customers.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// LOGOUT
// ============================================================

function adminLogout() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// JAVASCRIPT STRING SAFETY
// ============================================================

function escapeJS(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );
}


// ============================================================
// ESC KEY - CLOSE MODAL
// ============================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeAdminOrderDetails();
        }

    }
);


// ============================================================
// START ADMIN DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        if (!checkAdmin()) {
            return;
        }


        await Promise.all([
            loadDashboard(),
            loadOrders(),
            loadProducts(),
            loadCustomers(),
            loadSalesAnalytics()
        ]);

    }
);