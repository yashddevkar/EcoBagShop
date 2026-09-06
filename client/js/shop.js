// =====================================================
// ECOBAG SHOP
// SHOP PRODUCTS
// MongoDB-powered product listing
// =====================================================


// =====================================================
// API CONFIGURATION
// =====================================================
//
// Development:
// If frontend is opened using Live Server, for example:
// http://127.0.0.1:5500
// it automatically connects to:
// http://localhost:5000/api
//
// Production:
// If frontend and backend are deployed on the same domain,
// it automatically uses /api.
//
// If frontend and backend are deployed on different domains,
// set:
// window.ECOBAG_API_BASE = "https://your-api-domain.com/api";
//
// before loading this file.
// =====================================================

const API_BASE =
    window.ECOBAG_API_BASE ||
        (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        )
        ? "http://localhost:5000/api"
        : "/api";

// =====================================================
// GLOBAL PRODUCTS
// =====================================================

let allProducts = [];


// =====================================================
// API HELPER
// =====================================================

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    let data;

    try {

        data = await response.json();

    } catch (error) {

        throw new Error(
            `Server returned an invalid response (${response.status}).`
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            `Request failed with status ${response.status}.`
        );

    }


    return data;

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProducts() {

    const container =
        document.getElementById("products");


    if (container) {

        container.innerHTML = `

            <div class="loading-message">

                <h3>
                    Loading products...
                </h3>

                <p>
                    Please wait.
                </p>

            </div>

        `;

    }


    try {

        const data =
            await apiRequest("/products");


        console.log(
            "Products received from MongoDB:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load products."
            );

        }


        allProducts =
            Array.isArray(data.products)
                ? data.products
                : [];


        displayProducts(
            allProducts
        );


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        if (container) {

            container.innerHTML = `

                <div class="error-message">

                    <h3>
                        Unable to load products
                    </h3>

                    <p>
                        ${escapeHTML(
                error.message ||
                "Please make sure the server is running."
            )}
                    </p>

                    <button
                        type="button"
                        onclick="loadProducts()"
                    >
                        Try Again
                    </button>

                </div>

            `;

        }

    }

}


// =====================================================
// DISPLAY PRODUCTS
// =====================================================

function displayProducts(products) {

    const container =
        document.getElementById("products");


    if (!container) {

        console.error(
            'Element with id="products" was not found.'
        );

        return;

    }


    container.innerHTML = "";


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="no-products">

                <h3>
                    No products found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    products.forEach(
        product => {

            const productId =
                String(
                    product._id || ""
                );


            if (!productId) {

                console.warn(
                    "Skipping product because MongoDB _id is missing:",
                    product
                );

                return;

            }


            const price =
                Number(product.price) || 0;


            const discount =
                Math.max(
                    0,
                    Number(product.discount) || 0
                );


            const discountedPrice =
                Math.round(
                    price -
                    (
                        price *
                        discount /
                        100
                    )
                );


            const stock =
                Math.max(
                    0,
                    Number(product.stock) || 0
                );


            const rating =
                product.rating !== undefined &&
                    product.rating !== null
                    ? product.rating
                    : "4.5";


            const ecoScore =
                product.ecoScore !== undefined &&
                    product.ecoScore !== null
                    ? product.ecoScore
                    : 0;


            const image =
                product.image ||
                "https://via.placeholder.com/300";


            const card =
                document.createElement("div");


            card.className =
                "product-card";


            // =================================================
            // PRODUCT CARD
            // =================================================

            card.innerHTML = `

                <div
                    class="product-image"
                    data-product-id="${escapeHTML(productId)}"
                    style="cursor:pointer;"
                >

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(
                product.name || "EcoBag Product"
            )}"
                        loading="lazy"
                    >

                    ${discount > 0
                    ? `
                                <span class="discount-badge">
                                    ${discount}% OFF
                                </span>
                            `
                    : ""
                }

                </div>


                <div class="product-info">

                    <h3
                        class="product-name-link"
                        data-product-id="${escapeHTML(productId)}"
                        style="cursor:pointer;"
                    >
                        ${escapeHTML(
                    product.name ||
                    "EcoBag Product"
                )}
                    </h3>


                    <p class="product-description">

                        ${escapeHTML(
                    product.description ||
                    ""
                )}

                    </p>


                    <div class="rating">

                        ⭐ ${escapeHTML(
                    String(rating)
                )}

                    </div>


                    <div class="eco-score">

                        🌱 Eco Score:
                        ${escapeHTML(
                    String(ecoScore)
                )}/100

                    </div>


                    <div class="product-price">

                        ${discount > 0
                    ? `
                                    <span class="old-price">
                                        ₹${price}
                                    </span>
                                `
                    : ""
                }

                        <strong>
                            ₹${discountedPrice}
                        </strong>

                    </div>


                    <p class="stock">

                        ${stock > 0
                    ? `In Stock: ${stock}`
                    : "Out of Stock"
                }

                    </p>


                    <div class="product-buttons">

                        <button
                            class="view-details-btn"
                            type="button"
                            data-product-id="${escapeHTML(productId)}"
                        >

                            <i class="fa-solid fa-eye"></i>

                            View Details

                        </button>


                        <button
                            class="add-cart-btn"
                            type="button"
                            data-cart-product-id="${escapeHTML(productId)}"
                            ${stock <= 0
                    ? "disabled"
                    : ""
                }
                        >

                            <i class="fa-solid fa-cart-shopping"></i>

                            ${stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"
                }

                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    // =================================================
    // ADD EVENT LISTENERS
    // =================================================

    container
        .querySelectorAll(
            "[data-product-id]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    function () {

                        const productId =
                            this.dataset.productId;


                        if (
                            productId
                        ) {

                            openProductDetails(
                                productId
                            );

                        }

                    }
                );

            }
        );


    // =================================================
    // CART BUTTONS
    // =================================================

    container
        .querySelectorAll(
            "[data-cart-product-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.stopPropagation();


                        const productId =
                            this.dataset.cartProductId;


                        addToCart(
                            productId
                        );

                    }
                );

            }
        );

}


// =====================================================
// OPEN PRODUCT DETAILS
// =====================================================

function openProductDetails(productId) {

    if (!productId) {

        console.error(
            "Product ID is missing."
        );

        return;

    }


    window.location.href =
        `product-details.html?id=${encodeURIComponent(productId)}`;

}


// =====================================================
// SEARCH + CATEGORY FILTER
// =====================================================

function filterProducts() {

    const searchInput =
        document.getElementById("search");


    const categoryInput =
        document.getElementById("filter");


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        categoryInput
            ? categoryInput.value
            : "all";


    const filteredProducts =
        allProducts.filter(
            product => {

                const name =
                    (
                        product.name ||
                        ""
                    )
                        .toLowerCase();


                const description =
                    (
                        product.description ||
                        ""
                    )
                        .toLowerCase();


                const category =
                    (
                        product.category ||
                        ""
                    )
                        .toLowerCase();


                const matchesSearch =
                    name.includes(searchText) ||
                    description.includes(searchText) ||
                    category.includes(searchText);


                const matchesCategory =
                    selectedCategory === "all" ||
                    (
                        product.category || ""
                    ) === selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    displayProducts(
        filteredProducts
    );

}


// =====================================================
// SEARCH EVENT
// =====================================================

const searchInput =
    document.getElementById("search");


if (searchInput) {

    searchInput.addEventListener(
        "input",
        filterProducts
    );

}


// =====================================================
// CATEGORY EVENT
// =====================================================

const filterInput =
    document.getElementById("filter");


if (filterInput) {

    filterInput.addEventListener(
        "change",
        filterProducts
    );

}


// =====================================================
// ADD TO CART
// =====================================================
//
// IMPORTANT:
//
// MongoDB _id is saved as productId.
//
// Example:
//
// {
//     productId: "6a79e2c641bdb1c4744a6bd8",
//     name: "Reusable Eco Jute Bag",
//     price: 142,
//     quantity: 1
// }
//
// No product ID is hardcoded here.
// =====================================================

function addToCart(productId) {

    if (!productId) {

        alert(
            "Unable to add this product because its ID is missing."
        );

        return;

    }


    const product =
        allProducts.find(
            item =>
                String(item._id) ===
                String(productId)
        );


    if (!product) {

        alert(
            "Product not found. Please refresh the page."
        );

        return;

    }


    const stock =
        Math.max(
            0,
            Number(product.stock) || 0
        );


    if (stock <= 0) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


    const originalPrice =
        Number(product.price) || 0;


    const discount =
        Math.max(
            0,
            Number(product.discount) || 0
        );


    const finalPrice =
        Math.round(
            originalPrice -
            (
                originalPrice *
                discount /
                100
            )
        );


    // =================================================
    // GET EXISTING CART
    // =================================================

    let cart = [];


    try {

        const savedCart =
            localStorage.getItem(
                "ecoCart"
            );


        cart =
            savedCart
                ? JSON.parse(savedCart)
                : [];


        if (!Array.isArray(cart)) {

            cart = [];

        }

    } catch (error) {

        console.error(
            "Cart parsing error:",
            error
        );

        cart = [];

    }


    // =================================================
    // FIND EXISTING NORMAL PRODUCT
    // =================================================

    const existingProduct =
        cart.find(
            item =>
                !item.customization &&
                String(
                    item.productId ||
                    item._id
                ) ===
                String(productId)
        );


    // =================================================
    // EXISTING PRODUCT
    // =================================================

    if (existingProduct) {

        const currentQuantity =
            Number(
                existingProduct.quantity
            ) || 1;


        if (
            currentQuantity >=
            stock
        ) {

            alert(
                `Only ${stock} item(s) are currently available.`
            );

            return;

        }


        existingProduct.quantity =
            currentQuantity + 1;


        // Keep latest database information.
        existingProduct.productId =
            product._id;


        existingProduct._id =
            product._id;


        existingProduct.name =
            product.name;


        existingProduct.price =
            finalPrice;


        existingProduct.originalPrice =
            originalPrice;


        existingProduct.discount =
            discount;


        existingProduct.image =
            product.image || "";


        existingProduct.stock =
            stock;

    }


    // =================================================
    // NEW PRODUCT
    // =================================================

    else {

        cart.push({

            // MongoDB product ID
            productId:
                product._id,

            // Kept for compatibility
            // with older cart data
            _id:
                product._id,

            name:
                product.name,

            // Actual selling price
            price:
                finalPrice,

            // Original MongoDB price
            originalPrice:
                originalPrice,

            discount:
                discount,

            image:
                product.image || "",

            stock:
                stock,

            quantity:
                1

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

    } catch (error) {

        console.error(
            "Unable to save cart:",
            error
        );


        alert(
            "Unable to save this product to your cart."
        );

        return;

    }


    // =================================================
    // SUCCESS
    // =================================================

    alert(
        `${product.name} added to cart!`
    );


    // Optional cart badge refresh
    updateCartCount();

}


// =====================================================
// CART COUNT
// =====================================================

function updateCartCount() {

    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "ecoCart"
                )
            ) || [];

    } catch (error) {

        cart = [];

    }


    if (!Array.isArray(cart)) {

        cart = [];

    }


    const count =
        cart.reduce(
            (
                total,
                item
            ) => {

                return total +
                    (
                        Number(
                            item.quantity
                        ) || 0
                    );

            },
            0
        );


    // Support common cart badge IDs
    const badges =
        document.querySelectorAll(
            "#cartCount, .cart-count, .cart-badge"
        );


    badges.forEach(
        badge => {

            badge.textContent =
                count;


            badge.style.display =
                count > 0
                    ? ""
                    : "none";

        }
    );

}


// =====================================================
// ESCAPE HTML
// =====================================================
//
// Prevents product names/descriptions from being
// interpreted as HTML.
// =====================================================

function escapeHTML(value) {

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
// START SHOP
// =====================================================

loadProducts();

updateCartCount();