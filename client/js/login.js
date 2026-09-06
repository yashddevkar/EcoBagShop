// =====================================================
// ECOBAG SHOP - LOGIN + OTP
// =====================================================


// =====================================================
// API URL
// =====================================================

const API =
    "http://localhost:5000/api";


// =====================================================
// ELEMENTS
// =====================================================

const form =
    document.getElementById("loginForm");

const message =
    document.getElementById("message");

const otpSection =
    document.getElementById("otpSection");

const otpInput =
    document.getElementById("otp");

const verifyOTPButton =
    document.getElementById("verifyOTPButton");

const resendOTPButton =
    document.getElementById("resendOTPButton");


let loginEmail = "";


// =====================================================
// SAFE JSON RESPONSE
// Prevents "Unexpected end of JSON input"
// =====================================================

async function readResponse(response) {

    const text =
        await response.text();

    if (!text) {

        return {
            success: false,
            message:
                `Server returned an empty response (${response.status}).`
        };

    }


    try {

        return JSON.parse(text);

    } catch (error) {

        console.error(
            "Invalid server response:",
            text
        );


        return {
            success: false,
            message:
                `Server returned an invalid response (${response.status}).`
        };

    }

}


// =====================================================
// LOGIN - SEND OTP
// =====================================================

if (form) {

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const emailElement =
                document.getElementById("email");

            const passwordElement =
                document.getElementById("password");


            if (
                !emailElement ||
                !passwordElement
            ) {

                return;

            }


            const email =
                emailElement.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordElement.value;


            if (!email) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter your email.";

                return;

            }


            if (!password) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter your password.";

                return;

            }


            loginEmail =
                email;


            message.style.color =
                "#1d7442";

            message.textContent =
                "Checking your login...";


            try {

                const response =
                    await fetch(
                        `${API}/auth/login`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "Login response:",
                    data
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    message.style.color =
                        "red";

                    message.textContent =
                        data.message ||
                        "Login failed.";

                    return;

                }


                // =================================================
                // OTP REQUIRED
                // =================================================

                message.style.color =
                    "#1d7442";

                message.textContent =
                    data.message ||
                    "OTP sent to your email.";


                // Hide login button

                const loginButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );


                if (loginButton) {

                    loginButton.style.display =
                        "none";

                }


                // Show OTP section

                if (otpSection) {

                    otpSection.style.display =
                        "block";

                }


                if (otpInput) {

                    otpInput.value = "";

                    otpInput.focus();

                }


            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                message.style.color =
                    "red";

                message.textContent =
                    "Unable to connect to server. Please make sure the backend is running.";

            }

        }
    );

}


// =====================================================
// VERIFY OTP
// =====================================================

if (verifyOTPButton) {

    verifyOTPButton.addEventListener(
        "click",
        async () => {

            const otp =
                otpInput
                    ? otpInput.value.trim()
                    : "";


            if (!otp) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter the OTP.";

                return;

            }


            if (
                !/^\d{6}$/.test(otp)
            ) {

                message.style.color =
                    "red";

                message.textContent =
                    "OTP must contain 6 digits.";

                return;

            }


            if (!loginEmail) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please login first.";

                return;

            }


            message.style.color =
                "#1d7442";

            message.textContent =
                "Verifying OTP...";


            try {

                const response =
                    await fetch(
                        `${API}/auth/verify-otp`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        loginEmail,

                                    otp:
                                        otp

                                })

                        }
                    );


                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "OTP response:",
                    data
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    message.style.color =
                        "red";

                    message.textContent =
                        data.message ||
                        "Invalid OTP.";

                    return;

                }


                // =================================================
                // LOGIN SUCCESS
                // =================================================

                if (!data.token) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Login succeeded but no authentication token was received.";

                    return;

                }


                if (!data.user) {

                    message.style.color =
                        "red";

                    message.textContent =
                        "Login succeeded but user information was not received.";

                    return;

                }


                localStorage.setItem(
                    "token",
                    data.token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        data.user
                    )
                );


                message.style.color =
                    "#1d7442";

                message.textContent =
                    "Login successful!";


                // =================================================
                // REDIRECT
                // =================================================

                setTimeout(
                    () => {

                        if (
                            data.user.role ===
                            "admin"
                        ) {

                            window.location.href =
                                "admin-dashboard.html";

                        } else {

                            window.location.href =
                                "shop.html";

                        }

                    },
                    800
                );


            } catch (error) {

                console.error(
                    "OTP Verification Error:",
                    error
                );


                message.style.color =
                    "red";

                message.textContent =
                    "Unable to verify OTP. Please try again.";

            }

        }
    );

}


// =====================================================
// RESEND OTP
// =====================================================

if (resendOTPButton) {

    resendOTPButton.addEventListener(
        "click",
        async () => {

            if (!loginEmail) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please login first.";

                return;

            }


            message.style.color =
                "#1d7442";

            message.textContent =
                "Sending new OTP...";


            try {

                const response =
                    await fetch(
                        `${API}/auth/resend-otp`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        loginEmail

                                })

                        }
                    );


                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "Resend OTP response:",
                    data
                );


                if (
                    !response.ok ||
                    !data.success
                ) {

                    message.style.color =
                        "red";

                    message.textContent =
                        data.message ||
                        "Unable to resend OTP.";

                    return;

                }


                message.style.color =
                    "#1d7442";

                message.textContent =
                    data.message ||
                    "New OTP sent to your email.";


                if (otpInput) {

                    otpInput.value = "";

                    otpInput.focus();

                }


            } catch (error) {

                console.error(
                    "Resend OTP Error:",
                    error
                );


                message.style.color =
                    "red";

                message.textContent =
                    "Unable to resend OTP. Please try again.";

            }

        }
    );

}