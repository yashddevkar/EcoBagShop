const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());


// =====================================================
// ROUTES
// =====================================================

const authRoutes =
    require("./routes/authRoutes");

const productRoutes =
    require("./routes/productRoutes");

const orderRoutes =
    require("./routes/orderRoutes");

const userRoutes =
    require("./routes/userRoutes");

const uploadRoutes =
    require("./routes/uploadRoutes");


// =====================================================
// API ROUTES
// =====================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/products",
    productRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/upload",
    uploadRoutes
);


// =====================================================
// SERVE FRONTEND
// =====================================================

const clientPath =
    path.join(
        __dirname,
        "../client"
    );


app.use(
    express.static(clientPath)
);


// =====================================================
// HOME PAGE
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                clientPath,
                "index.html"
            )
        );

    }
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            message:
                "EcoBag Shop server is running",

            database:
                mongoose.connection.readyState === 1
                    ? "connected"
                    : "disconnected"

        });

    }
);


// =====================================================
// API 404 HANDLER
// =====================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found"

        });

    }
);


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server Error:",
            error
        );

        res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Internal server error"

        });

    }
);


// =====================================================
// START SERVER AFTER MONGODB CONNECTS
// =====================================================

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    try {

        console.log(
            "Connecting to MongoDB..."
        );


        await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 10000
            }
        );


        console.log(
            "✅ MongoDB Connected"
        );


        console.log(
            "MongoDB Ready State:",
            mongoose.connection.readyState
        );


        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `✅ EcoBag Server Running on Port ${PORT}`
                );

                console.log(
                    `✅ Website available at http://localhost:${PORT}`
                );

            }
        );


    } catch (error) {

        console.error(
            "❌ MongoDB Connection Error:"
        );

        console.error(
            error.message
        );


        process.exit(1);

    }

}


startServer();