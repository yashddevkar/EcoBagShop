// =====================================================
// ECOBAG SHOP - CART
// Normal Products + Customized Bags
// Works with the current cart.html
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const cartItems =
    document.getElementById("cartItems");

const emptyCart =
    document.getElementById("emptyCart");

const cartSummary =
    document.getElementById("cartSummary");

const totalItems =
    document.getElementById("totalItems");

const subtotalElement =
    document.getElementById("subtotal");

const deliveryElement =
    document.getElementById("delivery");

const totalElement =
    document.getElementById("total");


// =====================================================
// GET CART
// =====================================================

function getCart() {

    try {

        return JSON.parse(
            localStorage.getItem("ecoCart")
        ) || [];

    } catch (error) {

        console.error(
            "Cart data error:",
            error
        );

        return [];

    }

}


// =====================================================
// SAVE CART
// =====================================================

function saveCart(cart) {

    localStorage.setItem(
        "ecoCart",
        JSON.stringify(cart)
    );

}


// =====================================================
// LOAD CART
// =====================================================

function loadCart() {

    const cart =
        getCart();


    if (!cartItems) {

        console.error(
            "cartItems element not found."
        );

        return;

    }


    // =================================================
    // EMPTY CART
    // =================================================

    if (cart.length === 0) {

        cartItems.innerHTML = "";


        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        if (cartSummary) {

            cartSummary.style.display =
                "none";

        }


        if (totalItems) {

            totalItems.textContent =
                "0";

        }


        updateTotals(
            0
        );


        return;

    }


    // =================================================
    // SHOW CART
    // =================================================

    if (emptyCart) {

        emptyCart.style.display =
            "none";

    }


    if (cartSummary) {

        cartSummary.style.display =
            "block";

    }


    cartItems.innerHTML = "";


    let subtotal =
        0;

    let itemCount =
        0;


    // =================================================
    // CREATE ITEMS
    // =================================================

    cart.forEach(
        function (
            item,
            index
        ) {


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            const price =
                Number(
                    item.price
                ) || 0;


            const itemTotal =
                price * quantity;


            subtotal +=
                itemTotal;


            itemCount +=
                quantity;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "premium-cart-item";


            // =========================================
            // CUSTOMIZED BAG
            // =========================================

            if (
                item.customization
            ) {

                card.innerHTML =
                    createCustomizedBagHTML(
                        item,
                        index,
                        itemTotal
                    );

            }


            // =========================================
            // NORMAL PRODUCT
            // =========================================

            else {

                card.innerHTML =
                    createNormalProductHTML(
                        item,
                        index,
                        itemTotal
                    );

            }


            cartItems.appendChild(
                card
            );

        }
    );


    // =================================================
    // ITEM COUNT
    // =================================================

    if (totalItems) {

        totalItems.textContent =
            itemCount;

    }


    // =================================================
    // TOTALS
    // =================================================

    updateTotals(
        subtotal
    );

}


// =====================================================
// CUSTOMIZED BAG
// =====================================================

function createCustomizedBagHTML(
    item,
    index,
    itemTotal
) {


    const customization =
        item.customization || {};


    const bagType =
        customization.bagType ||
        "Custom Bag";


    const customText =
        customization.text ||
        "No custom text";


    const color =
        customization.color ||
        "#f7f7f7";


    const image =
        customization.image ||
        item.image ||
        "";


    return `

        <!-- PRODUCT IMAGE -->

        <div class="premium-cart-image">

            ${image
            ?
            `
                    <img
                        src="${image}"
                        alt="Customized Bag"
                    >
                `
            :
            `
                    <div class="custom-bag-placeholder">
                        👜
                    </div>
                `
        }

        </div>


        <!-- PRODUCT INFORMATION -->

        <div class="premium-cart-info">


            <h3>

                ${escapeHTML(
            item.name ||
            "Customized EcoBag"
        )}

            </h3>


            <span class="custom-design-label">

                <i
                    class="fa-solid fa-wand-magic-sparkles"
                ></i>

                Customized Design

            </span>


            <div class="custom-design-details">


                <p>

                    <strong>
                        Bag:
                    </strong>

                    ${escapeHTML(
            bagType
        )}

                </p>


                <p>

                    <strong>
                        Custom Text:
                    </strong>

                    ${escapeHTML(
            customText
        )}

                </p>


                <p>

                    <strong>
                        Color:
                    </strong>


                    <span
                        class="cart-color-circle"
                        style="
                            background:${safeColor(
            color
        )};
                        "
                    ></span>

                </p>


                ${image
            ?
            `
                    <p>

                        <strong>
                            Photo:
                        </strong>

                        ✓ Added

                    </p>
                    `
            :
            `
                    <p>

                        <strong>
                            Photo:
                        </strong>

                        No photo

                    </p>
                    `
        }


            </div>


            <p class="premium-cart-price">

                ₹${priceNumber(
            item.price
        )}

            </p>


            <!-- QUANTITY -->

            <div class="premium-cart-actions">


                <button
                    type="button"
                    class="quantity-btn"
                    onclick="changeQuantity(
                        ${index},
                        -1
                    )"
                >

                    −

                </button>


                <span class="quantity-number">

                    ${quantityNumber(
            item.quantity
        )}

                </span>


                <button
                    type="button"
                    class="quantity-btn"
                    onclick="changeQuantity(
                        ${index},
                        1
                    )"
                >

                    +

                </button>


                <button
                    type="button"
                    class="remove-cart-btn"
                    onclick="removeCartItem(
                        ${index}
                    )"
                >

                    <i
                        class="fa-solid fa-trash"
                    ></i>

                    Remove

                </button>


            </div>


        </div>


        <!-- ITEM TOTAL -->

        <div class="premium-cart-item-total">

            ₹${itemTotal}

        </div>

    `;

}


// =====================================================
// NORMAL PRODUCT
// =====================================================

function createNormalProductHTML(
    item,
    index,
    itemTotal
) {


    const image =
        item.image ||
        "";


    return `

        <!-- PRODUCT IMAGE -->

        <div class="premium-cart-image">

            ${image
            ?
            `
                    <img
                        src="${image}"
                        alt="${escapeHTML(
                item.name ||
                "Product"
            )}"
                    >
                `
            :
            `
                    <div class="custom-bag-placeholder">
                        👜
                    </div>
                `
        }

        </div>


        <!-- PRODUCT INFORMATION -->

        <div class="premium-cart-info">


            <h3>

                ${escapeHTML(
            item.name ||
            "EcoBag Product"
        )}

            </h3>


            <p class="premium-cart-price">

                ₹${priceNumber(
            item.price
        )}

            </p>


            <!-- QUANTITY -->

            <div class="premium-cart-actions">


                <button
                    type="button"
                    class="quantity-btn"
                    onclick="changeQuantity(
                        ${index},
                        -1
                    )"
                >

                    −

                </button>


                <span class="quantity-number">

                    ${quantityNumber(
            item.quantity
        )}

                </span>


                <button
                    type="button"
                    class="quantity-btn"
                    onclick="changeQuantity(
                        ${index},
                        1
                    )"
                >

                    +

                </button>


                <button
                    type="button"
                    class="remove-cart-btn"
                    onclick="removeCartItem(
                        ${index}
                    )"
                >

                    <i
                        class="fa-solid fa-trash"
                    ></i>

                    Remove

                </button>


            </div>


        </div>


        <!-- ITEM TOTAL -->

        <div class="premium-cart-item-total">

            ₹${itemTotal}

        </div>

    `;

}


// =====================================================
// UPDATE TOTALS
// =====================================================

function updateTotals(
    subtotal
) {


    let delivery =
        0;


    // ================================================
    // FREE DELIVERY ABOVE ₹500
    // ================================================

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


    // ================================================
    // SUBTOTAL
    // ================================================

    if (subtotalElement) {

        subtotalElement.textContent =
            `₹${subtotal}`;

    }


    // ================================================
    // DELIVERY
    // ================================================

    if (deliveryElement) {

        if (delivery === 0) {

            deliveryElement.textContent =
                "FREE";

        } else {

            deliveryElement.textContent =
                `₹${delivery}`;

        }

    }


    // ================================================
    // TOTAL
    // ================================================

    if (totalElement) {

        totalElement.textContent =
            `₹${total}`;

    }

}


// =====================================================
// CHANGE QUANTITY
// =====================================================

function changeQuantity(
    index,
    change
) {


    const cart =
        getCart();


    if (
        !cart[index]
    ) {

        return;

    }


    let quantity =
        Number(
            cart[index].quantity
        ) || 1;


    quantity +=
        change;


    // ================================================
    // REMOVE IF ZERO
    // ================================================

    if (
        quantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

    } else {

        cart[index].quantity =
            quantity;

    }


    saveCart(
        cart
    );


    loadCart();

}


// =====================================================
// REMOVE ITEM
// =====================================================

function removeCartItem(
    index
) {


    const cart =
        getCart();


    if (
        !cart[index]
    ) {

        return;

    }


    const productName =
        cart[index].name ||
        "this item";


    const confirmed =
        confirm(
            `Remove ${productName} from your cart?`
        );


    if (
        !confirmed
    ) {

        return;

    }


    cart.splice(
        index,
        1
    );


    saveCart(
        cart
    );


    loadCart();

}


// =====================================================
// CHECKOUT
// =====================================================

function checkout() {


    const cart =
        getCart();


    if (
        cart.length === 0
    ) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    // ================================================
    // LOGIN CHECK
    // ================================================

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please login before checkout."
        );


        window.location.href =
            "login.html";


        return;

    }


    // ================================================
    // GO TO CHECKOUT
    // ================================================

    window.location.href =
        "checkout.html";

}


// =====================================================
// PRICE NUMBER
// =====================================================

function priceNumber(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-IN"
    );

}


// =====================================================
// QUANTITY NUMBER
// =====================================================

function quantityNumber(
    value
) {

    return (
        Number(value) || 1
    );

}


// =====================================================
// SAFE COLOR
// =====================================================

function safeColor(
    color
) {


    const allowedColors = [

        "#f7f7f7",

        "#222222",

        "#4b8f5a",

        "#d8c09b",

        "#ffffff",

        "#000000"

    ];


    if (
        allowedColors.includes(
            String(color).toLowerCase()
        )
    ) {

        return color;

    }


    return "#f7f7f7";

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
// INITIAL LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

    }
);