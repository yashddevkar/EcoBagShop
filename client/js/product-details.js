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


    // =====================================================
    // BASIC PRODUCT INFORMATION
    // =====================================================

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


    // =====================================================
    // RATING
    // =====================================================

    const rating =
        product.rating !== undefined &&
            product.rating !== null
            ? Number(product.rating)
            : 0;


    // =====================================================
    // ECO SCORE
    // =====================================================

    const ecoScore =
        product.ecoScore !== undefined &&
            product.ecoScore !== null
            ? Number(product.ecoScore)
            : 0;


    // =====================================================
    // MATERIAL
    // =====================================================

    const material =
        product.material ||
        "Not specified";


    // =====================================================
    // SIZE
    // =====================================================

    const size =
        product.size ||
        "Not specified";


    // =====================================================
    // DIMENSIONS
    // =====================================================

    const dimensions =
        product.dimensions ||
        {};


    const length =
        Number(dimensions.length) || 0;


    const width =
        Number(dimensions.width) || 0;


    const height =
        Number(dimensions.height) || 0;


    const dimensionUnit =
        dimensions.unit ||
        "inch";


    const hasDimensions =
        length > 0 ||
        width > 0 ||
        height > 0;


    const dimensionsText =
        hasDimensions
            ? `${length} × ${width} × ${height} ${dimensionUnit}`
            : "Not specified";


    // =====================================================
    // WEIGHT CAPACITY
    // =====================================================

    const weightCapacity =
        product.weightCapacity ||
        {};


    const capacityValue =
        Number(weightCapacity.value) || 0;


    const capacityUnit =
        weightCapacity.unit ||
        "kg";


    const capacityText =
        capacityValue > 0
            ? `Up to ${capacityValue} ${capacityUnit}`
            : "Not specified";


    // =====================================================
    // PRODUCT WEIGHT
    // =====================================================

    const productWeight =
        product.productWeight ||
        {};


    const productWeightValue =
        Number(productWeight.value) || 0;


    const productWeightUnit =
        productWeight.unit ||
        "g";


    const productWeightText =
        productWeightValue > 0
            ? `${productWeightValue} ${productWeightUnit}`
            : "Not specified";


    // =====================================================
    // DISPLAY PRODUCT
    // =====================================================

    container.innerHTML = `

        <div class="product-details-container">


            <!-- =========================================
                 IMAGE
            ========================================== -->

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


            <!-- =========================================
                 PRODUCT INFORMATION
            ========================================== -->

            <div class="product-info-section">


                <!-- CATEGORY -->

                <span class="product-category">

                    ${escapeHTML(
        product.category ||
        "Eco-Friendly"
    )}

                </span>


                <!-- PRODUCT NAME -->

                <h1>

                    ${escapeHTML(
        product.name ||
        "EcoBag Product"
    )}

                </h1>


                <!-- RATING -->

                <div class="product-rating">

                    ⭐

                    <strong>
                        ${escapeHTML(
        String(rating)
    )}
                    </strong>

                    / 5

                    <span>
                        Customer Rating
                    </span>

                </div>


                <!-- DESCRIPTION -->

                <p class="product-description">

                    ${escapeHTML(
        product.description ||
        "Premium eco-friendly product designed for everyday use."
    )}

                </p>


                <!-- =====================================
                     PRICE
                ====================================== -->

                <div class="product-price">

                    ${discount > 0
            ? `
                                <span class="original-price">
                                    ₹${originalPrice}
                                </span>
                            `
            : ""
        }


                    <h2>
                        ₹${discountedPrice}
                    </h2>


                    ${discount > 0
            ? `
                                <span class="discount">
                                    ${discount}% OFF
                                </span>
                            `
            : ""
        }

                </div>


                <!-- =====================================
                     ECO SCORE
                ====================================== -->

                <div class="eco-score">

                    🌱

                    Eco Score:

                    <strong>
                        ${escapeHTML(
            String(ecoScore)
        )}/100
                    </strong>

                </div>


                <!-- =====================================
                     PRODUCT SPECIFICATIONS
                ====================================== -->

                <div
                    class="product-specifications"
                    style="
                        margin:20px 0;
                        padding:18px;
                        background:#f7f7f7;
                        border-radius:10px;
                        border:1px solid #e5e5e5;
                    "
                >

                    <h3
                        style="
                            margin:0 0 15px;
                        "
                    >
                        Product Specifications
                    </h3>


                    <!-- SIZE -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                            border-bottom:1px solid #e5e5e5;
                        "
                    >

                        <strong>
                            Size
                        </strong>

                        <span>
                            ${escapeHTML(
            String(size)
        )}
                        </span>

                    </div>


                    <!-- DIMENSIONS -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                            border-bottom:1px solid #e5e5e5;
                        "
                    >

                        <strong>
                            Dimensions
                        </strong>

                        <span>
                            ${escapeHTML(
            dimensionsText
        )}
                        </span>

                    </div>


                    <!-- WEIGHT CAPACITY -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                            border-bottom:1px solid #e5e5e5;
                        "
                    >

                        <strong>
                            Weight Capacity
                        </strong>

                        <span>
                            ${escapeHTML(
            capacityText
        )}
                        </span>

                    </div>


                    <!-- PRODUCT WEIGHT -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                            border-bottom:1px solid #e5e5e5;
                        "
                    >

                        <strong>
                            Product Weight
                        </strong>

                        <span>
                            ${escapeHTML(
            productWeightText
        )}
                        </span>

                    </div>


                    <!-- MATERIAL -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                            border-bottom:1px solid #e5e5e5;
                        "
                    >

                        <strong>
                            Material
                        </strong>

                        <span>
                            ${escapeHTML(
            String(material)
        )}
                        </span>

                    </div>


                    <!-- ECO SCORE -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                            border-bottom:1px solid #e5e5e5;
                        "
                    >

                        <strong>
                            Eco Score
                        </strong>

                        <span>
                            🌱
                            ${escapeHTML(
            String(ecoScore)
        )}/100
                        </span>

                    </div>


                    <!-- RATING -->

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                            padding:8px 0;
                        "
                    >

                        <strong>
                            Rating
                        </strong>

                        <span>
                            ⭐
                            ${escapeHTML(
            String(rating)
        )}/5
                        </span>

                    </div>

                </div>


                <!-- =====================================
                     STOCK
                ====================================== -->

                <p class="stock">

                    ${isOutOfStock
            ? "Out of Stock"
            : `✓ In Stock — ${stock} available`
        }

                </p>


                <!-- =====================================
                     QUANTITY
                ====================================== -->

                ${!isOutOfStock
            ? `
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
            : ""
        }


                <!-- =====================================
                     ACTIONS
                ====================================== -->

                <div class="product-actions">

                    ${!isOutOfStock
            ? `
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
            : `
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


                <!-- MESSAGE -->

                <div
                    id="productMessage"
                    class="product-message"
                >
                </div>


                <!-- =====================================
                     FEATURES
                ====================================== -->

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

    // =================================================
    // LOGIN CHECK
    // =================================================

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    let user = null;

    try {
        user = savedUser
            ? JSON.parse(savedUser)
            : null;
    } catch (error) {
        console.error("User data parsing error:", error);
        user = null;
    }

    if (!token || !user || !user.email) {

        showMessage("Please login first to add products to cart.");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);

        return;
    }


    // =================================================
    // EXISTING PRODUCT CHECK
    // =================================================

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