const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },

    fileFilter: (req, file, cb) => {
        // Allow only common image formats
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Only JPG, PNG, WEBP, and GIF images are allowed."
                )
            );
        }

        cb(null, true);
    }
});


// =====================================================
// UPLOAD IMAGE TO CLOUDINARY
// =====================================================

router.post(
    "/image",
    upload.single("image"),
    async (req, res) => {
        try {
            // ---------------------------------------------
            // CHECK FILE
            // ---------------------------------------------

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No image file uploaded."
                });
            }

            // ---------------------------------------------
            // UPLOAD BUFFER TO CLOUDINARY
            // ---------------------------------------------

            const result = await new Promise(
                (resolve, reject) => {
                    const stream =
                        cloudinary.uploader.upload_stream(
                            {
                                folder:
                                    "ecobag-shop/customized-bags",

                                resource_type: "image",

                                // Automatically optimize
                                quality: "auto",

                                // Automatically select efficient format
                                fetch_format: "auto"
                            },

                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                    stream.end(req.file.buffer);
                }
            );

            // ---------------------------------------------
            // SUCCESS RESPONSE
            // ---------------------------------------------

            return res.status(200).json({
                success: true,

                message:
                    "Image uploaded successfully.",

                imageUrl:
                    result.secure_url,

                publicId:
                    result.public_id
            });

        } catch (error) {
            console.error(
                "Cloudinary Upload Error:",
                error
            );

            return res.status(500).json({
                success: false,

                message:
                    "Unable to upload image."
            });
        }
    }
);


// =====================================================
// MULTER / UPLOAD ERROR HANDLER
// =====================================================

router.use(
    (error, req, res, next) => {
        console.error(
            "Image Upload Error:",
            error.message
        );

        // ---------------------------------------------
        // FILE TOO LARGE
        // ---------------------------------------------

        if (
            error instanceof multer.MulterError &&
            error.code === "LIMIT_FILE_SIZE"
        ) {
            return res.status(400).json({
                success: false,

                message:
                    "Image must be smaller than 5 MB."
            });
        }

        // ---------------------------------------------
        // INVALID FILE TYPE
        // ---------------------------------------------

        if (
            error.message &&
            error.message.includes(
                "Only JPG, PNG, WEBP, and GIF"
            )
        ) {
            return res.status(400).json({
                success: false,

                message: error.message
            });
        }

        // ---------------------------------------------
        // OTHER UPLOAD ERRORS
        // ---------------------------------------------

        return res.status(400).json({
            success: false,

            message:
                error.message ||
                "Invalid image upload."
        });
    }
);


module.exports = router;