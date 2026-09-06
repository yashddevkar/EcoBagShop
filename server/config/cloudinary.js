const cloudinary = require("cloudinary").v2;

// =====================================================
// CLOUDINARY CONFIGURATION
// =====================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET
});


// =====================================================
// VALIDATE CONFIGURATION
// =====================================================

if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    console.warn(
        "⚠️ Cloudinary environment variables are not configured."
    );
}


module.exports = cloudinary;