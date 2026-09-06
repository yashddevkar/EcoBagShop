async function loadOrder() {

    const params =
        new URLSearchParams(window.location.search);

    const orderId =
        params.get("id");


    const loading =
        document.getElementById("loading");

    const content =
        document.getElementById("orderContent");


    if (!orderId) {

        loading.textContent =
            "Order ID is missing.";

        return;

    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/orders/${orderId}`
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            loading.textContent =
                data.message || "Order not found.";

            return;

        }


        const order =
            data.order;


        displayOrder(order);


        loading.style.display = "none";

        content.style.display = "block";


    } catch (error) {

        console.error(
            "Order loading error:",
            error
        );


        loading.textContent =
            "Unable to connect to server.";

    }

}


// ================= DISPLAY ORDER =================

function displayOrder(order) {

    document.getElementById(
        "orderStatus"
    ).textContent =
        order.orderStatus;


    const date =
        new Date(
            order.createdAt
        ).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "orderDate"
    ).textContent =
        `Order ID: ${order._id} • ${date}`;


    // PRODUCTS

    const productsContainer =
        document.getElementById(
            "orderProducts"
        );


    productsContainer.innerHTML = "";


    order.items.forEach(item => {

        const div =
            document.createElement("div");


        div.className =
            "details-product";


        div.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >

            <div class="details-product-info">

                <h3>
                    ${item.name}
                </h3>

                <p>
                    ₹${item.price}
                    ×
                    ${item.quantity}
                </p>

            </div>

            <strong>
                ₹${item.price * item.quantity}
            </strong>

        `;


        productsContainer.appendChild(div);

    });


    // ADDRESS

    document.getElementById(
        "deliveryAddress"
    ).innerHTML = `

        <p>
            <strong>
                ${order.customer.name}
            </strong>
        </p>

        <p>
            ${order.shippingAddress.address}
        </p>

        <p>
            ${order.shippingAddress.city},
            ${order.shippingAddress.state}
        </p>

        <p>
            Pincode:
            ${order.shippingAddress.pincode}
        </p>

        <p>
            📞 ${order.customer.phone}
        </p>

        <p>
            ✉️ ${order.customer.email}
        </p>

    `;


    // PAYMENT

    document.getElementById(
        "paymentDetails"
    ).innerHTML = `

        <p>
            <strong>
                Method:
            </strong>

            ${order.paymentMethod}
        </p>

        <p>
            <strong>
                Payment Status:
            </strong>

            ${order.paymentStatus}
        </p>

        <p>
            <strong>
                Order Status:
            </strong>

            ${order.orderStatus}
        </p>

    `;


    // PRICE

    document.getElementById(
        "priceDetails"
    ).innerHTML = `

        <div class="price-row">

            <span>
                Subtotal
            </span>

            <strong>
                ₹${order.subtotal}
            </strong>

        </div>


        <div class="price-row">

            <span>
                Delivery
            </span>

            <strong>
                ${order.deliveryCharge === 0
            ? "FREE"
            : "₹" + order.deliveryCharge
        }
            </strong>

        </div>


        <hr>


        <div class="price-row total">

            <span>
                Total
            </span>

            <strong>
                ₹${order.totalAmount}
            </strong>

        </div>

    `;


    updateTracking(
        order.orderStatus
    );

}


// ================= TRACKING =================

function updateTracking(status) {

    const statuses = [
        "Placed",
        "Confirmed",
        "Packed",
        "Shipped",
        "Delivered"
    ];


    const currentIndex =
        statuses.indexOf(status);


    statuses.forEach(
        (currentStatus, index) => {

            const step =
                document.getElementById(
                    "step" + currentStatus
                );


            if (!step) return;


            if (index <= currentIndex) {

                step.classList.add("completed");

            }

        }
    );

}


loadOrder();