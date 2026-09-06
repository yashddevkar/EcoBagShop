// =========================================================
// ECOBAG SHOP
// PRODUCT DETAILS
// =========================================================


// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
    window.ECOBAG_API_BASE
        ? `${window.ECOBAG_API_BASE}/products`
        : (
            window.location.hostname === "localhost" ||
                window.location.hostname === "127.0.0.1"
                ? "http://localhost:5000/api/products"
                : "/api/products"
        );


let product = null;

let quantity = 1;


// =========================================================
// GET PRODUCT ID FROM URL
// =========================================================

const params =
    new URLSearchParams(
        window.location.search
    );


const productId =
    params.get("id");


// =========================================================
// LOAD PRODUCT
// =========================================================

async function loadProduct() {

    const container =
        document.getElementById(
            "productDetails"
        );


    if (!container) {

        console.error(
            'Element with id="productDetails" was not found.'
        );

        return;

    }


    if (!productId) {

        container.innerHTML = `

            <div class="product-loading">

                <i class="fa-solid fa-circle-exclamation"></i>

                <h2>
                    Product Not Found
                </h2>

                <p>
                    No product was selected.
                </p>

                <a href="shop.html">
                    Back to Shop
                </a>

            </div>

        `;

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(productId)}`
            );


        const data =
            await response.json();


        console.log(
            "Product details:",
            data
        );


        if (
            !response.ok ||
            !data.success ||
            !data.product
        ) {

            throw new Error(
                data.message ||
                "Product not found"
            );

        }


        product =
            data.product;


        quantity = 1;


        displayProduct(
            product
        );

    }


    catch (error) {

        console.error(
            "Product details error:",
            error
        );


        container.innerHTML = `

            <div class="product-loading">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>
                    Unable to Load Product
                </h2>

                <p>
                    ${error.message ||
            "Please try again later."
            }
                </p>

                <a href="shop.html">
                    Back to Shop
                </a>

            </div>

        `;

    }

}


// =========================================================
// DISPLAY PRODUCT
// =========================================================

function displayProduct(product) {

    const container =
        document.getElementById(
            "productDetails"
        );


    if (!container) {
        return;
    }


    const originalPrice =
        Number(product.price) || 0;


    const discount =
        Math.max(
            0,
            Number(product.discount) || 0
        );


    const discountedPrice =
        Math.round(
            originalPrice -
            (
                originalPrice *
                discount /
                100
            )
        );


    const stock =
        Math.max(
            0,
            Number(product.stock) || 0
        );


    const isOutOfStock =
        stock <= 0;


    const image =
        product.image ||
        "https://via.placeholder.com/700x700?text=EcoBag+Shop";


    container.innerHTML = `

        <div class="product-details-container">


            <!-- ================= IMAGE ================= -->

            <div class="product-image-section">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
        product.name ||
        "EcoBag Product"
    )}"
                    onerror="
                        this.src='https://via.placeholder.com/700x700?text=EcoBag+Shop'
                    "
                >

            </div>


            <!-- ================= INFORMATION ================= -->

            <div class="product-info-section">


                <span class="product-category">

                    ${escapeHTML(
        product.category ||
        "Eco-Friendly"
    )}

                </span>


                <h1>

                    ${escapeHTML(
        product.name ||
        "EcoBag Product"
    )}

                </h1>


                <div class="product-rating">

                    ⭐ ${escapeHTML(
        String(
            product.rating ??
            4.5
        )
    )
        }

                    <span>
                        Customer Rating
                    </span>

                </div>


                <p class="product-description">

                    ${escapeHTML(
            product.description ||
            "Premium eco-friendly product designed for everyday use."
        )}

                </p>


                <!-- PRICE -->

                <div class="product-price">

                    ${discount > 0
            ?
            `
                            <span class="original-price">

                                ₹${originalPrice}

                            </span>
                        `
            :
            ""
        }


                    <h2>

                        ₹${discountedPrice}

                    </h2>


                    ${discount > 0
            ?
            `
                            <span class="discount">

                                ${discount}% OFF

                            </span>
                        `
            :
            ""
        }

                </div>


                <!-- ECO SCORE -->

                <div class="eco-score">

                    🌱

                    Eco Score:

                    <strong>

                        ${product.ecoScore ??
        0
        }/100

                    </strong>

                </div>


                <!-- STOCK -->

                <p class="stock">

                    ${isOutOfStock
            ?
            "Out of Stock"
            :
            `✓ In Stock — ${stock} available`
        }

                </p>


                <!-- QUANTITY -->

                ${!isOutOfStock
            ?
            `
                        <div class="quantity-section">

                            <label>
                                Quantity
                            </label>


                            <div class="quantity-control">

                                <button
                                    type="button"
                                    onclick="decreaseQuantity()"
                                >
                                    −
                                </button>


                                <span id="quantity">
                                    1
                                </span>


                                <button
                                    type="button"
                                    onclick="increaseQuantity()"
                                >
                                    +
                                </button>

                            </div>

                        </div>
                    `
            :
            ""
        }


                <!-- ACTIONS -->

                <div class="product-actions">

                    ${!isOutOfStock
            ?
            `
                            <button
                                type="button"
                                class="add-cart-btn"
                                onclick="addProductToCart()"
                            >

                                <i class="fa-solid fa-cart-plus"></i>

                                Add to Cart

                            </button>


                            <button
                                type="button"
                                class="buy-now-btn"
                                onclick="buyNow()"
                            >

                                <i class="fa-solid fa-bolt"></i>

                                Buy Now

                            </button>
                        `
            :
            `
                            <button
                                type="button"
                                class="add-cart-btn"
                                disabled
                            >

                                Out of Stock

                            </button>
                        `
        }

                </div>


                <div
                    id="productMessage"
                    class="product-message"
                >
                </div>


                <!-- FEATURES -->

                <div class="product-features">

                    <div>

                        <i class="fa-solid fa-leaf"></i>

                        <span>
                            Eco Friendly
                        </span>

                    </div>


                    <div>

                        <i class="fa-solid fa-recycle"></i>

                        <span>
                            Reusable
                        </span>

                    </div>


                    <div>

                        <i class="fa-solid fa-truck"></i>

                        <span>
                            Reliable Delivery
                        </span>

                    </div>

                </div>


            </div>

        </div>

    `;

}


// =========================================================
// QUANTITY
// =========================================================

function increaseQuantity() {

    if (!product) {
        return;
    }


    const stock =
        Number(product.stock) || 0;


    if (
        quantity >= stock
    ) {

        showMessage(
            "Maximum available stock reached."
        );

        return;

    }


    quantity++;


    updateQuantity();

}


function decreaseQuantity() {

    if (
        quantity <= 1
    ) {

        return;

    }


    quantity--;


    updateQuantity();

}


function updateQuantity() {

    const element =
        document.getElementById(
            "quantity"
        );


    if (element) {

        element.textContent =
            quantity;

    }

}


// =========================================================
// ADD TO CART
// =========================================================

function addProductToCart() {

    if (!product) {
        return;
    }


    const stock =
        Number(product.stock) || 0;


    if (stock <= 0) {

        showMessage(
            "This product is out of stock."
        );

        return;

    }


    if (
        quantity > stock
    ) {

        showMessage(
            "Maximum available stock reached."
        );

        return;

    }


    let cart = [];


    try {

        const savedCart =
            localStorage.getItem(
                "ecoCart"
            );


        cart =
            savedCart
                ?
                JSON.parse(
                    savedCart
                )
                :
                [];


        if (
            !Array.isArray(cart)
        ) {

            cart = [];

        }

    }

    catch (error) {

        console.error(
            "Cart parsing error:",
            error
        );


        cart = [];

    }


    // =================================================
    // FIND EXISTING PRODUCT
    // =================================================

    const existingProduct =
        cart.find(
            item =>
                String(
                    item.productId ||
                    item._id
                ) ===
                String(product._id)
        );


    // =================================================
    // EXISTING PRODUCT
    // =================================================

    if (existingProduct) {

        const currentQuantity =
            Number(
                existingProduct.quantity
            ) || 0;


        if (
            currentQuantity +
            quantity >
            stock
        ) {

            showMessage(
                `Only ${stock} item(s) are currently available.`
            );

            return;

        }


        existingProduct.quantity =
            currentQuantity +
            quantity;


        existingProduct.productId =
            product._id;


        existingProduct._id =
            product._id;


        existingProduct.name =
            product.name;


        existingProduct.price =
            Math.round(
                Number(product.price) -
                (
                    Number(product.price) *
                    (
                        Number(product.discount) ||
                        0
                    ) /
                    100
                )
            );


        existingProduct.originalPrice =
            Number(product.price) || 0;


        existingProduct.discount =
            Number(product.discount) || 0;


        existingProduct.image =
            product.image || "";


        existingProduct.stock =
            stock;

    }


    // =================================================
    // NEW PRODUCT
    // =================================================

    else {

        const originalPrice =
            Number(product.price) || 0;


        const discount =
            Number(product.discount) || 0;


        const finalPrice =
            Math.round(
                originalPrice -
                (
                    originalPrice *
                    discount /
                    100
                )
            );


        cart.push({

            productId:
                product._id,

            _id:
                product._id,

            name:
                product.name,

            price:
                finalPrice,

            originalPrice:
                originalPrice,

            discount:
                discount,

            image:
                product.image || "",

            stock:
                stock,

            quantity:
                quantity

        });

    }


    // =================================================
    // SAVE CART
    // =================================================

    try {

        localStorage.setItem(
            "ecoCart",
            JSON.stringify(cart)
        );

    }

    catch (error) {

        console.error(
            "Unable to save cart:",
            error
        );


        showMessage(
            "Unable to save this product to your cart."
        );

        return;

    }


    // =================================================
    // SUCCESS
    // =================================================

    showMessage(
        `${product.name} added to cart!`
    );


    if (
        typeof updateCartCount ===
        "function"
    ) {

        updateCartCount();

    }

}


// =========================================================
// BUY NOW
// =========================================================

function buyNow() {

    if (!product) {
        return;
    }


    addProductToCart();


    setTimeout(
        () => {

            window.location.href =
                "cart.html";

        },
        500
    );

}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(message) {

    const element =
        document.getElementById(
            "productMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    setTimeout(
        () => {

            element.textContent =
                "";

        },
        3000
    );

}


// =========================================================
// HTML ESCAPE
// =========================================================

function escapeHTML(value) {

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


// =========================================================
// START
// =========================================================

loadProduct();