// =========================================================
// ECOBAG SHOP
// FEATURED PRODUCTS FROM MONGODB
// DEPLOYMENT-SAFE VERSION
// =========================================================


// =========================================================
// API CONFIGURATION
// =========================================================
//
// LOCAL DEVELOPMENT:
// Frontend through Live Server:
// http://127.0.0.1:5500
//
// Backend:
// http://localhost:5000
//
// PRODUCTION:
// If frontend + backend are deployed together:
// /api
//
// Optional external API:
// window.ECOBAG_API_BASE = "https://your-api-domain.com/api";
//
// No code changes are required during deployment.
// =========================================================

const API_BASE =
    window.ECOBAG_API_BASE ||
    (
        window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000/api"
            : "/api"
    );


// =========================================================
// API HELPER
// =========================================================

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

    }

    catch (error) {

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


// =========================================================
// LOAD FEATURED PRODUCTS
// =========================================================

async function loadFeaturedProducts() {

    const container =
        document.getElementById("featuredProducts");


    // If this section does not exist on the current page,
    // do nothing.

    if (!container) {
        return;
    }


    // -------------------------------------------------------
    // LOADING STATE
    // -------------------------------------------------------

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


    try {

        // ---------------------------------------------------
        // GET PRODUCTS FROM MONGODB
        // ---------------------------------------------------

        const data =
            await apiRequest("/products");


        console.log(
            "Featured products received:",
            data
        );


        // ---------------------------------------------------
        // VALIDATE RESPONSE
        // ---------------------------------------------------

        if (
            !data.success ||
            !Array.isArray(data.products)
        ) {

            throw new Error(
                data.message ||
                "Invalid products response."
            );

        }


        // ---------------------------------------------------
        // SHOW FIRST 3 PRODUCTS
        // ---------------------------------------------------

        const products =
            data.products.slice(0, 3);


        // ---------------------------------------------------
        // NO PRODUCTS
        // ---------------------------------------------------

        if (products.length === 0) {

            container.innerHTML = `

                <div class="error-message">

                    <h3>
                        No products available
                    </h3>

                    <p>
                        Products will appear here
                        when they are added.
                    </p>

                </div>

            `;

            return;

        }


        // ---------------------------------------------------
        // CLEAR CONTAINER
        // ---------------------------------------------------

        container.innerHTML = "";


        // ---------------------------------------------------
        // CREATE PRODUCT CARDS
        // ---------------------------------------------------

        products.forEach(product => {

            // MongoDB ID

            const productId =
                String(product._id || "");


            // Product name

            const productName =
                product.name ||
                "EcoBag Product";


            // Description

            const productDescription =
                product.description ||
                "Sustainable and eco-friendly product for everyday use.";


            // Category

            const productCategory =
                product.category ||
                "ECO-FRIENDLY";


            // Image

            const productImage =
                product.image ||
                "https://via.placeholder.com/800x600?text=EcoBag+Shop";


            // Original price

            const originalPrice =
                Number(product.price) || 0;


            // Discount

            const discount =
                Math.max(
                    0,
                    Number(product.discount) || 0
                );


            // Final selling price

            const finalPrice =
                Math.round(
                    originalPrice -
                    (
                        originalPrice *
                        discount /
                        100
                    )
                );


            // ------------------------------------------------
            // PRODUCT CARD
            // ------------------------------------------------

            const card =
                document.createElement("div");


            card.className =
                "card";


            card.innerHTML = `

                <div class="card-image">

                    <img
                        src="${escapeHTML(productImage)}"
                        alt="${escapeHTML(productName)}"
                        loading="lazy"
                    >


                    ${discount > 0

                    ?

                    `
                            <span class="card-tag">
                                ${discount}% OFF
                            </span>
                        `

                    :

                    `
                            <span class="card-tag">
                                ECO CHOICE
                            </span>
                        `
                }

                </div>


                <div class="card-content">

                    <span class="card-category">

                        ${escapeHTML(productCategory)}

                    </span>


                    <h3>

                        ${escapeHTML(productName)}

                    </h3>


                    <p class="card-description">

                        ${escapeHTML(productDescription)}

                    </p>


                    <div class="card-bottom">

                        <strong>

                            ₹${finalPrice}

                        </strong>


                        <a
                            href="product-details.html?id=${encodeURIComponent(productId)}"
                        >

                            <button
                                type="button"
                            >

                                View Product

                                <i
                                    class="fa-solid fa-arrow-right"
                                ></i>

                            </button>

                        </a>

                    </div>

                </div>

            `;


            // ------------------------------------------------
            // IMAGE ERROR HANDLING
            // ------------------------------------------------

            const image =
                card.querySelector("img");


            if (image) {

                image.addEventListener(
                    "error",
                    function () {

                        this.src =
                            "https://via.placeholder.com/800x600?text=EcoBag+Shop";

                    },
                    {
                        once: true
                    }
                );

            }


            // ------------------------------------------------
            // ADD CARD TO PAGE
            // ------------------------------------------------

            container.appendChild(card);

        });

    }


    // =====================================================
    // ERROR HANDLING
    // =====================================================

    catch (error) {

        console.error(
            "Featured products loading error:",
            error
        );


        container.innerHTML = `

            <div class="error-message">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    ${escapeHTML(
            error.message ||
            "Please make sure the server is running."
        )
            }
                </p>


                <button
                    type="button"
                    onclick="loadFeaturedProducts()"
                    style="
                        margin-top:15px;
                        padding:10px 18px;
                        border:none;
                        border-radius:8px;
                        cursor:pointer;
                        font-weight:700;
                    "
                >

                    Try Again

                </button>


                <br>


                <a
                    href="shop.html"
                    style="
                        display:inline-block;
                        margin-top:15px;
                        color:#176b35;
                        font-weight:700;
                    "
                >

                    Visit Shop

                </a>

            </div>

        `;

    }

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
// START FEATURED PRODUCTS
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    loadFeaturedProducts
);