// =====================================================
// ECOBAG SHOP
// CUSTOM BAG DESIGNER
// PRODUCTION / DEPLOYMENT-READY VERSION
// =====================================================

// =====================================================
// API CONFIGURATION
// =====================================================
// Local development:
// http://localhost:5000/api
//
// Production:
// /api
//
// No API URL changes are required when deploying.

const API_BASE_URL =
    window.ECOBAG_API_BASE ||
    (
        window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000/api"
            : "/api"
    );


// =====================================================
// PRODUCT DATA
// =====================================================

let bagProducts = [];
let selectedBagProduct = null;


// =====================================================
// GET ELEMENTS
// =====================================================

const bagType =
    document.getElementById("bagType");

const bagShape =
    document.getElementById("bagShape");

const bagHandle =
    document.getElementById("bagHandle");

const photoInput =
    document.getElementById("photoInput");

const uploadedImage =
    document.getElementById("uploadedImage");

const textInput =
    document.getElementById("textInput");

const customText =
    document.getElementById("customText");

const textSize =
    document.getElementById("textSize");

const textColor =
    document.getElementById("textColor");

const price =
    document.getElementById("price");

const addToCartBtn =
    document.getElementById("addToCartBtn");

const photoControls =
    document.getElementById("photoControls");

const photoSize =
    document.getElementById("photoSize");

const rotateLeft =
    document.getElementById("rotateLeft");

const rotateRight =
    document.getElementById("rotateRight");

const deletePhoto =
    document.getElementById("deletePhoto");


// =====================================================
// PHOTO STATE
// =====================================================

let photoRotation = 0;

// Cloudinary URL.
// Only this URL is stored in the cart.
// Base64 image data is NOT stored.
let uploadedImageUrl = "";


// =====================================================
// READ JSON RESPONSE SAFELY
// =====================================================

async function readJsonResponse(response) {

    try {

        return await response.json();

    } catch (error) {

        throw new Error(
            "The server returned an invalid response."
        );

    }

}


// =====================================================
// GET FINAL SELLING PRICE
// =====================================================

function getFinalPrice(product) {

    if (!product) {
        return 0;
    }

    const originalPrice =
        Number(product.price) || 0;

    const discount =
        Math.max(
            0,
            Number(product.discount) || 0
        );

    return Math.round(
        originalPrice -
        (
            originalPrice *
            discount /
            100
        )
    );

}


// =====================================================
// LOAD PRODUCTS FROM MONGODB
// =====================================================

async function loadBagProducts() {

    try {

        if (addToCartBtn) {
            addToCartBtn.disabled = true;
        }

        if (price) {
            price.textContent = "Loading...";
        }


        const response =
            await fetch(
                `${API_BASE_URL}/products`,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load products. Server status: ${response.status}`
            );

        }


        const data =
            await readJsonResponse(
                response
            );


        console.log(
            "Customizer products received:",
            data
        );


        const products =
            Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : [];


        if (!Array.isArray(products)) {

            throw new Error(
                "Invalid product response from server."
            );

        }


        // Keep only valid MongoDB products.

        bagProducts =
            products.filter(
                product =>
                    product &&
                    product._id &&
                    product.name
            );


        if (bagProducts.length === 0) {

            throw new Error(
                "No products are currently available."
            );

        }


        console.log(
            "Available customization products:",
            bagProducts
        );


        populateBagTypes();

        updateSelectedProduct();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        if (price) {
            price.textContent =
                "Unavailable";
        }


        if (addToCartBtn) {
            addToCartBtn.disabled =
                true;
        }


        alert(
            "Unable to load bag products. Please make sure the server is running and try again."
        );

    }

}


// =====================================================
// POPULATE BAG DROPDOWN
// =====================================================

function populateBagTypes() {

    if (!bagType) {

        console.error(
            "Element #bagType was not found."
        );

        return;
    }


    const previousValue =
        bagType.value;


    bagType.innerHTML = "";


    bagProducts.forEach(
        product => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    product._id
                );


            const finalPrice =
                getFinalPrice(
                    product
                );


            option.textContent =
                `${product.name} – ₹${finalPrice.toLocaleString("en-IN")}`;


            option.dataset.productId =
                String(
                    product._id
                );


            bagType.appendChild(
                option
            );

        }
    );


    // Keep previous selection.

    if (
        previousValue &&
        bagProducts.some(
            product =>
                String(product._id) ===
                String(previousValue)
        )
    ) {

        bagType.value =
            previousValue;

    }

    // Otherwise select first product.

    else if (
        bagProducts.length > 0
    ) {

        bagType.value =
            String(
                bagProducts[0]._id
            );

    }

}


// =====================================================
// FIND SELECTED PRODUCT
// =====================================================

function updateSelectedProduct() {

    if (!bagType) {
        return;
    }


    const selectedProductId =
        bagType.value;


    selectedBagProduct =
        bagProducts.find(
            product =>
                String(product._id) ===
                String(selectedProductId)
        );


    if (!selectedBagProduct) {

        console.error(
            "Selected product not found:",
            selectedProductId
        );


        if (price) {
            price.textContent =
                "Unavailable";
        }


        if (addToCartBtn) {
            addToCartBtn.disabled =
                true;
        }


        return;
    }


    const finalPrice =
        getFinalPrice(
            selectedBagProduct
        );


    if (price) {

        price.textContent =
            "₹" +
            finalPrice.toLocaleString(
                "en-IN"
            );

    }


    const stock =
        Number(
            selectedBagProduct.stock
        ) || 0;


    if (addToCartBtn) {

        addToCartBtn.disabled =
            stock <= 0;

    }


    console.log(
        "CURRENT SELECTED PRODUCT:",
        selectedBagProduct
    );

}


// =====================================================
// BAG TYPE CHANGE
// =====================================================

if (bagType) {

    bagType.addEventListener(
        "change",
        function () {

            updateSelectedProduct();

        }
    );

}


// =====================================================
// BAG COLOR
// =====================================================

const colorOptions =
    document.querySelectorAll(
        ".color-option"
    );


colorOptions.forEach(
    function (option) {

        option.addEventListener(
            "click",
            function () {

                colorOptions.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                option.classList.add(
                    "selected"
                );


                const color =
                    option.dataset.color ||
                    "#f7f7f7";


                if (bagShape) {

                    bagShape.style.backgroundColor =
                        color;

                }


                if (bagHandle) {

                    if (
                        color.toLowerCase() ===
                        "#222222"
                    ) {

                        bagHandle.style.borderColor =
                            "#111111";

                    } else {

                        bagHandle.style.borderColor =
                            "#999999";

                    }

                }

            }
        );

    }
);


// =====================================================
// UPLOAD PHOTO TO BACKEND / CLOUDINARY
// =====================================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        async function (event) {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            // ---------------------------------------------
            // ALLOWED IMAGE TYPES
            // ---------------------------------------------

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ];


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                alert(
                    "Please select a JPG, PNG, WEBP, or GIF image."
                );


                photoInput.value = "";

                return;
            }


            // ---------------------------------------------
            // MAXIMUM FILE SIZE: 5 MB
            // ---------------------------------------------

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Please choose an image smaller than 5 MB."
                );


                photoInput.value = "";

                return;
            }


            photoInput.disabled =
                true;


            if (addToCartBtn) {
                addToCartBtn.disabled =
                    true;
            }


            try {

                // -----------------------------------------
                // CREATE FORM DATA
                // -----------------------------------------

                const formData =
                    new FormData();


                formData.append(
                    "image",
                    file
                );


                // -----------------------------------------
                // UPLOAD TO BACKEND
                // -----------------------------------------

                const response =
                    await fetch(
                        `${API_BASE_URL}/upload/image`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                // -----------------------------------------
                // READ SERVER RESPONSE
                // -----------------------------------------

                const data =
                    await readJsonResponse(
                        response
                    );


                // -----------------------------------------
                // CHECK SERVER RESPONSE
                // -----------------------------------------

                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Image upload failed."
                    );

                }


                // -----------------------------------------
                // SAVE CLOUDINARY URL
                // -----------------------------------------

                uploadedImageUrl =
                    data.imageUrl || "";


                if (!uploadedImageUrl) {

                    throw new Error(
                        "Image URL was not returned by the server."
                    );

                }


                // -----------------------------------------
                // SHOW IMAGE
                // -----------------------------------------

                if (uploadedImage) {

                    uploadedImage.src =
                        uploadedImageUrl;


                    uploadedImage.style.display =
                        "block";


                    uploadedImage.style.left =
                        "75px";


                    uploadedImage.style.top =
                        "70px";


                    uploadedImage.style.width =
                        "120px";


                    uploadedImage.style.height =
                        "120px";


                    photoRotation =
                        0;


                    uploadedImage.style.transform =
                        "rotate(0deg)";

                }


                // -----------------------------------------
                // SHOW PHOTO CONTROLS
                // -----------------------------------------

                if (photoControls) {

                    photoControls.style.display =
                        "block";

                }


                if (photoSize) {

                    photoSize.value =
                        120;

                }


                console.log(
                    "Cloudinary image uploaded:",
                    uploadedImageUrl
                );


            } catch (error) {

                console.error(
                    "Image upload error:",
                    error
                );


                uploadedImageUrl =
                    "";


                if (uploadedImage) {

                    uploadedImage.src =
                        "";

                    uploadedImage.style.display =
                        "none";

                }


                alert(
                    error.message ||
                    "Unable to upload image. Please try again."
                );


                photoInput.value =
                    "";


            } finally {

                photoInput.disabled =
                    false;


                // Restore button based on stock.

                updateSelectedProduct();

            }

        }
    );

}


// =====================================================
// PHOTO SIZE
// =====================================================

if (photoSize) {

    photoSize.addEventListener(
        "input",
        function () {

            if (!uploadedImage) {
                return;
            }


            const size =
                Number(
                    photoSize.value
                );


            if (
                !Number.isFinite(size)
            ) {
                return;
            }


            uploadedImage.style.width =
                `${size}px`;


            uploadedImage.style.height =
                `${size}px`;

        }
    );

}


// =====================================================
// ROTATE LEFT
// =====================================================

if (rotateLeft) {

    rotateLeft.addEventListener(
        "click",
        function () {

            if (!uploadedImage) {
                return;
            }


            photoRotation -= 15;


            uploadedImage.style.transform =
                `rotate(${photoRotation}deg)`;

        }
    );

}


// =====================================================
// ROTATE RIGHT
// =====================================================

if (rotateRight) {

    rotateRight.addEventListener(
        "click",
        function () {

            if (!uploadedImage) {
                return;
            }


            photoRotation += 15;


            uploadedImage.style.transform =
                `rotate(${photoRotation}deg)`;

        }
    );

}


// =====================================================
// DELETE PHOTO
// =====================================================

if (deletePhoto) {

    deletePhoto.addEventListener(
        "click",
        function () {

            const confirmDelete =
                confirm(
                    "Remove this photo from your bag design?"
                );


            if (!confirmDelete) {
                return;
            }


            uploadedImageUrl =
                "";


            if (uploadedImage) {

                uploadedImage.style.display =
                    "none";


                uploadedImage.src =
                    "";


                uploadedImage.style.left =
                    "75px";


                uploadedImage.style.top =
                    "70px";


                uploadedImage.style.width =
                    "120px";


                uploadedImage.style.height =
                    "120px";


                uploadedImage.style.transform =
                    "rotate(0deg)";

            }


            if (photoInput) {

                photoInput.value =
                    "";

            }


            if (photoControls) {

                photoControls.style.display =
                    "none";

            }


            if (photoSize) {

                photoSize.value =
                    120;

            }


            photoRotation =
                0;

        }
    );

}


// =====================================================
// CUSTOM TEXT
// =====================================================

if (textInput) {

    textInput.addEventListener(
        "input",
        function () {

            if (customText) {

                customText.textContent =
                    textInput.value;

            }

        }
    );

}


// =====================================================
// TEXT SIZE
// =====================================================

if (textSize) {

    textSize.addEventListener(
        "input",
        function () {

            if (customText) {

                customText.style.fontSize =
                    `${textSize.value}px`;

            }

        }
    );

}


// =====================================================
// TEXT COLOR
// =====================================================

if (textColor) {

    textColor.addEventListener(
        "input",
        function () {

            if (customText) {

                customText.style.color =
                    textColor.value;

            }

        }
    );

}


// =====================================================
// DRAG FUNCTION
// =====================================================

function makeDraggable(
    element,
    container
) {

    if (
        !element ||
        !container
    ) {

        return;

    }


    let isDragging =
        false;


    let startX = 0;
    let startY = 0;

    let startLeft = 0;
    let startTop = 0;


    function getPointerPosition(
        event
    ) {

        if (
            event.touches &&
            event.touches.length
        ) {

            return {
                x:
                    event.touches[0]
                        .clientX,

                y:
                    event.touches[0]
                        .clientY
            };

        }


        return {
            x: event.clientX,
            y: event.clientY
        };

    }


    function startDragging(
        event
    ) {

        event.preventDefault();


        const position =
            getPointerPosition(
                event
            );


        isDragging =
            true;


        startX =
            position.x;


        startY =
            position.y;


        startLeft =
            parseFloat(
                element.style.left
            ) ||
            element.offsetLeft;


        startTop =
            parseFloat(
                element.style.top
            ) ||
            element.offsetTop;

    }


    function moveElement(
        event
    ) {

        if (!isDragging) {
            return;
        }


        if (
            event.type ===
            "touchmove"
        ) {

            event.preventDefault();

        }


        const position =
            getPointerPosition(
                event
            );


        const differenceX =
            position.x -
            startX;


        const differenceY =
            position.y -
            startY;


        let newLeft =
            startLeft +
            differenceX;


        let newTop =
            startTop +
            differenceY;


        const maxLeft =
            Math.max(
                0,
                container.clientWidth -
                element.offsetWidth
            );


        const maxTop =
            Math.max(
                0,
                container.clientHeight -
                element.offsetHeight
            );


        newLeft =
            Math.max(
                0,
                Math.min(
                    newLeft,
                    maxLeft
                )
            );


        newTop =
            Math.max(
                0,
                Math.min(
                    newTop,
                    maxTop
                )
            );


        element.style.left =
            `${newLeft}px`;


        element.style.top =
            `${newTop}px`;

    }


    function stopDragging() {

        isDragging =
            false;

    }


    // Mouse

    element.addEventListener(
        "mousedown",
        startDragging
    );


    document.addEventListener(
        "mousemove",
        moveElement
    );


    document.addEventListener(
        "mouseup",
        stopDragging
    );


    // Touch

    element.addEventListener(
        "touchstart",
        startDragging,
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchmove",
        moveElement,
        {
            passive: false
        }
    );


    document.addEventListener(
        "touchend",
        stopDragging
    );

}


// =====================================================
// ENABLE DRAGGING
// =====================================================

makeDraggable(
    uploadedImage,
    bagShape
);


makeDraggable(
    customText,
    bagShape
);


// =====================================================
// ADD CUSTOMIZED BAG TO CART
// =====================================================

if (addToCartBtn) {

    addToCartBtn.addEventListener(
        "click",
        function () {

            // ---------------------------------------------
            // PRODUCT CHECK
            // ---------------------------------------------

            if (!selectedBagProduct) {

                alert(
                    "Please select a valid bag."
                );

                return;
            }


            // ---------------------------------------------
            // REAL MONGODB PRODUCT ID
            // ---------------------------------------------

            const productId =
                String(
                    selectedBagProduct._id ||
                    ""
                );


            if (
                !productId ||
                productId === "undefined" ||
                productId === "null"
            ) {

                console.error(
                    "Invalid MongoDB product:",
                    selectedBagProduct
                );


                alert(
                    "This bag is not connected to a valid product."
                );


                return;
            }


            // ---------------------------------------------
            // STOCK CHECK
            // ---------------------------------------------

            const stock =
                Number(
                    selectedBagProduct.stock
                ) || 0;


            if (stock <= 0) {

                alert(
                    "This bag is currently out of stock."
                );

                return;
            }


            // ---------------------------------------------
            // PRICE
            // ---------------------------------------------

            const originalPrice =
                Number(
                    selectedBagProduct.price
                ) || 0;


            const discount =
                Math.max(
                    0,
                    Number(
                        selectedBagProduct.discount
                    ) || 0
                );


            const finalPrice =
                getFinalPrice(
                    selectedBagProduct
                );


            if (
                originalPrice <= 0 ||
                finalPrice <= 0
            ) {

                alert(
                    "The price for this bag is unavailable."
                );

                return;
            }


            // ---------------------------------------------
            // COLOR
            // ---------------------------------------------

            const selectedColor =
                document.querySelector(
                    ".color-option.selected"
                );


            const bagColor =
                selectedColor
                    ? (
                        selectedColor.dataset.color ||
                        "#f7f7f7"
                    )
                    : "#f7f7f7";


            // ---------------------------------------------
            // CUSTOMIZATION DATA
            // ---------------------------------------------

            const customization = {

                bagType:
                    selectedBagProduct.name,

                productId:
                    productId,

                color:
                    bagColor,

                text:
                    textInput
                        ? textInput.value
                        : "",

                textSize:
                    textSize
                        ? Number(
                            textSize.value
                        )
                        : 24,

                textColor:
                    textColor
                        ? textColor.value
                        : "#000000",

                // IMPORTANT:
                // Store Cloudinary URL only.
                image:
                    uploadedImageUrl ||
                    "",

                imagePosition: {

                    left:
                        uploadedImage
                            ? uploadedImage.style.left
                            : "",

                    top:
                        uploadedImage
                            ? uploadedImage.style.top
                            : "",

                    width:
                        uploadedImage
                            ? uploadedImage.style.width
                            : "",

                    height:
                        uploadedImage
                            ? uploadedImage.style.height
                            : "",

                    rotation:
                        photoRotation
                },

                textPosition: {

                    left:
                        customText
                            ? customText.style.left
                            : "",

                    top:
                        customText
                            ? customText.style.top
                            : ""

                }

            };


            // ---------------------------------------------
            // CART ITEM
            // ---------------------------------------------

            const cartItem = {

                id:
                    "custom-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .substring(2, 8),

                // Real MongoDB ID

                productId:
                    productId,

                _id:
                    productId,

                name:
                    "Customized " +
                    selectedBagProduct.name,

                price:
                    finalPrice,

                originalPrice:
                    originalPrice,

                discount:
                    discount,

                quantity:
                    1,

                image:
                    selectedBagProduct.image ||
                    "",

                stock:
                    stock,

                customization:
                    customization

            };


            // ---------------------------------------------
            // GET EXISTING CART
            // ---------------------------------------------

            let cart = [];


            try {

                const savedCart =
                    localStorage.getItem(
                        "ecoCart"
                    );


                if (savedCart) {

                    cart =
                        JSON.parse(
                            savedCart
                        );

                }


                if (
                    !Array.isArray(cart)
                ) {

                    cart = [];

                }


            } catch (error) {

                console.warn(
                    "Invalid existing cart. Starting fresh.",
                    error
                );


                cart = [];

            }


            // ---------------------------------------------
            // ADD CUSTOMIZED PRODUCT
            // ---------------------------------------------

            cart.push(
                cartItem
            );


            // ---------------------------------------------
            // SAVE CART
            // ---------------------------------------------

            try {

                localStorage.setItem(
                    "ecoCart",
                    JSON.stringify(
                        cart
                    )
                );


            } catch (error) {

                console.error(
                    "Unable to save cart:",
                    error
                );


                alert(
                    "Unable to save your customized bag. Please try again."
                );


                return;

            }


            // ---------------------------------------------
            // DEBUG
            // ---------------------------------------------

            console.log(
                "CUSTOMIZED PRODUCT ADDED:",
                cartItem
            );


            console.log(
                "MongoDB product ID:",
                productId
            );


            console.log(
                "Cloudinary image URL:",
                uploadedImageUrl
            );


            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            alert(
                "Customized bag added to cart successfully!"
            );


            // ---------------------------------------------
            // GO TO CART
            // ---------------------------------------------

            window.location.href =
                "cart.html";

        }
    );

}


// =====================================================
// INITIALIZE
// =====================================================

loadBagProducts();