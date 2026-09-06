// =====================================================
// ECOBAG SHOP - CHECKOUT
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
// ELEMENTS
// =====================================================

const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );


const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );


const checkoutDelivery =
    document.getElementById(
        "checkoutDelivery"
    );


const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );


const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );


const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );


const checkoutMessage =
    document.getElementById(
        "checkoutMessage"
    );


// =====================================================
// GET CART
// =====================================================

function getCart() {

    try {

        const savedCart =
            localStorage.getItem(
                "ecoCart"
            );


        if (!savedCart) {

            return [];

        }


        const cart =
            JSON.parse(
                savedCart
            );


        return Array.isArray(cart)
            ? cart
            : [];


    } catch (error) {

        console.error(
            "Cart error:",
            error
        );


        return [];

    }

}


// =====================================================
// DISPLAY MESSAGE
// =====================================================

function showMessage(
    message,
    type
) {

    if (!checkoutMessage) {

        return;

    }


    checkoutMessage.textContent =
        message;


    checkoutMessage.className =
        type;

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
// LOAD CHECKOUT
// =====================================================

function loadCheckout() {

    const cart =
        getCart();


    // =================================================
    // EMPTY CART
    // =================================================

    if (
        cart.length === 0
    ) {

        if (checkoutItems) {

            checkoutItems.innerHTML = `

                <p style="
                    color:#68766e;
                    text-align:center;
                    padding:20px 0;
                ">

                    Your cart is empty.

                </p>

            `;

        }


        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                true;

        }


        updateCheckoutTotals(
            0
        );


        return;

    }


    let subtotal =
        0;


    let html =
        "";


    // =================================================
    // DISPLAY ITEMS
    // =================================================

    cart.forEach(
        function (item) {

            const quantity =
                Number(
                    item.quantity
                ) || 1;


            const itemPrice =
                Number(
                    item.price
                ) || 0;


            const itemTotal =
                itemPrice *
                quantity;


            subtotal +=
                itemTotal;


            const customization =
                item.customization ||
                null;


            const image =
                customization?.image ||
                item.image ||
                "";


            let details =
                `Qty: ${quantity}`;


            if (customization) {

                const bagType =
                    customization.bagType ||
                    "Custom Bag";


                const customText =
                    customization.text ||
                    "No custom text";


                details =
                    `${bagType} • ${customText} • Qty: ${quantity}`;

            }


            html += `

                <div class="summary-item">

                    <div class="summary-image">

                        ${image

                    ?

                    `
                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(item.name || "EcoBag")}"
                                >
                            `

                    :

                    `
                                <div
                                    class="summary-image-placeholder"
                                >
                                    👜
                                </div>
                            `
                }

                    </div>


                    <div class="summary-item-info">

                        <strong>

                            ${escapeHTML(
                    item.name ||
                    "EcoBag"
                )}

                        </strong>


                        <span>

                            ${escapeHTML(
                    details
                )}

                        </span>

                    </div>


                    <div class="summary-item-price">

                        ₹${itemTotal.toLocaleString(
                    "en-IN"
                )}

                    </div>

                </div>

            `;

        }
    );


    if (checkoutItems) {

        checkoutItems.innerHTML =
            html;

    }


    updateCheckoutTotals(
        subtotal
    );

}


// =====================================================
// UPDATE TOTALS
// =====================================================

function updateCheckoutTotals(
    subtotal
) {

    let delivery =
        0;


    // Free delivery above ₹500

    if (
        subtotal > 0 &&
        subtotal < 500
    ) {

        delivery =
            50;

    }


    const total =
        subtotal +
        delivery;


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            `₹${subtotal.toLocaleString(
                "en-IN"
            )}`;

    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            delivery === 0

                ?

                "FREE"

                :

                `₹${delivery}`;

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `₹${total.toLocaleString(
                "en-IN"
            )}`;

    }

}


// =====================================================
// VALIDATE PHONE
// =====================================================

function validPhone(
    phone
) {

    return /^[6-9][0-9]{9}$/.test(
        phone
    );

}


// =====================================================
// VALIDATE PINCODE
// =====================================================

function validPin(
    pin
) {

    return /^[1-9][0-9]{5}$/.test(
        pin
    );

}


// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getLoggedInUser() {

    try {

        const userData =
            localStorage.getItem(
                "user"
            );


        if (
            userData
        ) {

            const user =
                JSON.parse(
                    userData
                );


            if (
                user &&
                typeof user === "object"
            ) {

                return user;

            }

        }

    } catch (error) {

        console.warn(
            "Unable to read stored user:",
            error
        );

    }


    return null;

}


// =====================================================
// GET CUSTOMER EMAIL
// =====================================================

function getCustomerEmail() {

    const user =
        getLoggedInUser();


    // =================================================
    // FIRST: USER OBJECT
    // =================================================

    if (
        user &&
        user.email
    ) {

        return String(
            user.email
        )
            .trim()
            .toLowerCase();

    }


    // =================================================
    // SECOND: userEmail
    // =================================================

    const storedEmail =
        localStorage.getItem(
            "userEmail"
        );


    if (
        storedEmail
    ) {

        return String(
            storedEmail
        )
            .trim()
            .toLowerCase();

    }


    return "";

}


// =====================================================
// VALIDATE EMAIL
// =====================================================

function validEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


// =====================================================
// PLACE ORDER
// =====================================================

if (placeOrderBtn) {

    placeOrderBtn.addEventListener(
        "click",
        async function () {

            const cart =
                getCart();


            // ==========================================
            // CHECK CART
            // ==========================================

            if (
                cart.length === 0
            ) {

                showMessage(
                    "Your cart is empty.",
                    "error"
                );


                return;

            }


            // ==========================================
            // CHECK FORM
            // ==========================================

            if (
                checkoutForm &&
                !checkoutForm.checkValidity()
            ) {

                checkoutForm.reportValidity();


                return;

            }


            // ==========================================
            // GET CUSTOMER DETAILS
            // ==========================================

            const customerNameElement =
                document.getElementById(
                    "customerName"
                );


            const customerPhoneElement =
                document.getElementById(
                    "customerPhone"
                );


            const customerAddressElement =
                document.getElementById(
                    "customerAddress"
                );


            const customerCityElement =
                document.getElementById(
                    "customerCity"
                );


            const customerStateElement =
                document.getElementById(
                    "customerState"
                );


            const customerPinElement =
                document.getElementById(
                    "customerPin"
                );


            const customerLandmarkElement =
                document.getElementById(
                    "customerLandmark"
                );


            // ==========================================
            // SAFETY CHECK
            // ==========================================

            if (
                !customerNameElement ||
                !customerPhoneElement ||
                !customerAddressElement ||
                !customerCityElement ||
                !customerStateElement ||
                !customerPinElement
            ) {

                showMessage(
                    "Some delivery fields are missing from the checkout page.",
                    "error"
                );


                console.error(
                    "Checkout form elements missing."
                );


                return;

            }


            const customerName =
                customerNameElement.value.trim();


            const customerPhone =
                customerPhoneElement.value.trim();


            const customerAddress =
                customerAddressElement.value.trim();


            const customerCity =
                customerCityElement.value.trim();


            const customerState =
                customerStateElement.value.trim();


            const customerPin =
                customerPinElement.value.trim();


            const customerLandmark =
                customerLandmarkElement
                    ? customerLandmarkElement.value.trim()
                    : "";


            // ==========================================
            // GET EMAIL
            // ==========================================

            const customerEmail =
                getCustomerEmail();


            // ==========================================
            // VALIDATE EMAIL
            // ==========================================

            if (
                !customerEmail
            ) {

                showMessage(
                    "Your email address could not be found. Please login again before placing your order.",
                    "error"
                );


                return;

            }


            if (
                !validEmail(
                    customerEmail
                )
            ) {

                showMessage(
                    "Your account email address is not valid.",
                    "error"
                );


                return;

            }


            // ==========================================
            // VALIDATE PHONE
            // ==========================================

            if (
                !validPhone(
                    customerPhone
                )
            ) {

                showMessage(
                    "Please enter a valid 10-digit Indian mobile number.",
                    "error"
                );


                return;

            }


            // ==========================================
            // VALIDATE PINCODE
            // ==========================================

            if (
                !validPin(
                    customerPin
                )
            ) {

                showMessage(
                    "Please enter a valid 6-digit PIN code.",
                    "error"
                );


                return;

            }


            // ==========================================
            // PAYMENT METHOD
            // ==========================================

            const paymentElement =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            const paymentMethod =
                paymentElement
                    ?
                    paymentElement.value
                    :
                    "COD";


            // ==========================================
            // CALCULATE SUBTOTAL
            // ==========================================

            let subtotal =
                0;


            cart.forEach(
                function (item) {

                    const itemPrice =
                        Number(
                            item.price
                        ) || 0;


                    const quantity =
                        Number(
                            item.quantity
                        ) || 1;


                    subtotal +=
                        itemPrice *
                        quantity;

                }
            );


            // ==========================================
            // DELIVERY
            // ==========================================

            const delivery =
                (
                    subtotal > 0 &&
                    subtotal < 500
                )
                    ?
                    50
                    :
                    0;


            // ==========================================
            // TOTAL
            // ==========================================

            const total =
                subtotal +
                delivery;


            console.log(
                "Checkout total:",
                total
            );


            // ==========================================
            // LOGIN TOKEN
            // ==========================================

            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                showMessage(
                    "Please login before placing your order.",
                    "error"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html";

                    },
                    1200
                );


                return;

            }


            // ==========================================
            // DISABLE BUTTON
            // ==========================================

            placeOrderBtn.disabled =
                true;


            placeOrderBtn.innerHTML = `

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Placing Order...

            `;


            // ==========================================
            // ORDER DATA
            // ==========================================
            //
            // IMPORTANT:
            //
            // Backend expects:
            //
            // customer.email
            //
            // shippingAddress.pincode
            //
            // NOT:
            //
            // shippingAddress.pin
            //
            // ==========================================

            const orderData = {

                customer: {

                    name:
                        customerName,

                    phone:
                        customerPhone,

                    email:
                        customerEmail

                },


                shippingAddress: {

                    address:
                        customerAddress,

                    city:
                        customerCity,

                    state:
                        customerState,

                    pincode:
                        customerPin,

                    landmark:
                        customerLandmark,

                    phone:
                        customerPhone

                },


                items:
                    cart,


                paymentMethod:
                    paymentMethod

            };


            // ==========================================
            // DEBUG INFORMATION
            // ==========================================

            console.log(
                "ORDER DATA BEING SENT:",
                orderData
            );


            console.log(
                "Customer email:",
                orderData.customer.email
            );


            console.log(
                "Shipping pincode:",
                orderData.shippingAddress.pincode
            );


            // ==========================================
            // SEND TO BACKEND
            // ==========================================

            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/orders`,
                        {

                            method:
                                "POST",


                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },


                            body:
                                JSON.stringify(
                                    orderData
                                )

                        }
                    );


                // ======================================
                // READ RESPONSE SAFELY
                // ======================================

                const responseText =
                    await response.text();


                console.log(
                    "Server status:",
                    response.status
                );


                console.log(
                    "Server response:",
                    responseText
                );


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


                    throw new Error(
                        "Server returned an invalid response."
                    );

                }


                // ======================================
                // SERVER ERROR
                // ======================================

                if (
                    !response.ok
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to place order."
                    );

                }


                // ======================================
                // BACKEND SUCCESS CHECK
                // ======================================

                if (
                    data.success === false
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to place order."
                    );

                }


                // ======================================
                // CLEAR CART
                // ======================================

                localStorage.removeItem(
                    "ecoCart"
                );


                // ======================================
                // SUCCESS
                // ======================================

                showMessage(
                    "Order placed successfully! Redirecting to your orders...",
                    "success"
                );


                placeOrderBtn.innerHTML = `

                    <i
                        class="fa-solid fa-check"
                    ></i>

                    Order Placed

                `;


                // ======================================
                // REDIRECT
                // ======================================

                setTimeout(
                    function () {

                        window.location.href =
                            "orders.html";

                    },
                    1500
                );


            } catch (error) {

                console.error(
                    "Order error:",
                    error
                );


                showMessage(
                    error.message ||
                    "Something went wrong while placing your order.",
                    "error"
                );


                // ======================================
                // ENABLE BUTTON AGAIN
                // ======================================

                placeOrderBtn.disabled =
                    false;


                placeOrderBtn.innerHTML = `

                    <i
                        class="fa-solid fa-lock"
                    ></i>

                    Place Order

                `;

            }

        }
    );

}


// =====================================================
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCheckout();

    }
);