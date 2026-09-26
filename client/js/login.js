// =====================================================
// ECOBAG SHOP - LOGIN + OTP + FORGOT PASSWORD
// =====================================================


// =====================================================
// API URL
// =====================================================

const API =
    window.ECOBAG_API_BASE ||
        (
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1"
        )
        ? "http://localhost:5000/api"
        : "/api";


// =====================================================
// LOGIN ELEMENTS
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


// =====================================================
// FORGOT PASSWORD ELEMENTS
// =====================================================

const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");

const forgotPasswordSection =
    document.getElementById("forgotPasswordSection");

const resetEmailStep =
    document.getElementById("resetEmailStep");

const resetOTPStep =
    document.getElementById("resetOTPStep");

const newPasswordStep =
    document.getElementById("newPasswordStep");

const resetEmailInput =
    document.getElementById("resetEmail");

const sendResetOTPButton =
    document.getElementById("sendResetOTPButton");

const resetOTPInput =
    document.getElementById("resetOTP");

const verifyResetOTPButton =
    document.getElementById("verifyResetOTPButton");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmNewPasswordInput =
    document.getElementById("confirmNewPassword");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const backToLoginFromEmail =
    document.getElementById("backToLoginFromEmail");

const backToLoginFromResetOTP =
    document.getElementById("backToLoginFromResetOTP");

const backToLoginFromNewPassword =
    document.getElementById("backToLoginFromNewPassword");


// =====================================================
// LOGIN STATE
// =====================================================

let loginEmail = "";


// =====================================================
// PASSWORD RESET STATE
// =====================================================

let resetEmail = "";

let resetOTP = "";


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
// VERIFY LOGIN OTP
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
// RESEND LOGIN OTP
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


// =====================================================
// FORGOT PASSWORD - OPEN
// =====================================================

if (forgotPasswordButton) {

    forgotPasswordButton.addEventListener(
        "click",
        () => {

            // Hide login form

            if (form) {

                form.style.display =
                    "none";

            }


            // Hide login OTP

            if (otpSection) {

                otpSection.style.display =
                    "none";

            }


            // Show forgot password section

            if (forgotPasswordSection) {

                forgotPasswordSection.style.display =
                    "block";

            }


            // Show first reset step

            if (resetEmailStep) {

                resetEmailStep.style.display =
                    "block";

            }

            if (resetOTPStep) {

                resetOTPStep.style.display =
                    "none";

            }

            if (newPasswordStep) {

                newPasswordStep.style.display =
                    "none";

            }


            // Clear previous values

            if (resetEmailInput) {

                resetEmailInput.value = "";

                resetEmailInput.focus();

            }


            if (resetOTPInput) {

                resetOTPInput.value = "";

            }


            if (newPasswordInput) {

                newPasswordInput.value = "";

            }


            if (confirmNewPasswordInput) {

                confirmNewPasswordInput.value = "";

            }


            message.style.color =
                "#1d7442";

            message.textContent =
                "";

        }
    );

}


// =====================================================
// SEND PASSWORD RESET OTP
// =====================================================

if (sendResetOTPButton) {

    sendResetOTPButton.addEventListener(
        "click",
        async () => {

            const email =
                resetEmailInput
                    ? resetEmailInput.value
                        .trim()
                        .toLowerCase()
                    : "";


            if (!email) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter your email.";

                return;

            }


            resetEmail =
                email;


            message.style.color =
                "#1d7442";

            message.textContent =
                "Sending password reset OTP...";


            sendResetOTPButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `${API}/auth/forgot-password`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        resetEmail

                                })

                        }
                    );


                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "Forgot password response:",
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
                        "Unable to send password reset OTP.";

                    return;

                }


                message.style.color =
                    "#1d7442";

                message.textContent =
                    data.message ||
                    "Password reset OTP sent to your email.";


                // Move to OTP step

                if (resetEmailStep) {

                    resetEmailStep.style.display =
                        "none";

                }

                if (resetOTPStep) {

                    resetOTPStep.style.display =
                        "block";

                }


                if (resetOTPInput) {

                    resetOTPInput.value = "";

                    resetOTPInput.focus();

                }


            } catch (error) {

                console.error(
                    "Forgot Password Error:",
                    error
                );


                message.style.color =
                    "red";

                message.textContent =
                    "Unable to connect to server. Please try again.";

            } finally {

                sendResetOTPButton.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// VERIFY PASSWORD RESET OTP
// =====================================================

if (verifyResetOTPButton) {

    verifyResetOTPButton.addEventListener(
        "click",
        async () => {

            const otp =
                resetOTPInput
                    ? resetOTPInput.value.trim()
                    : "";


            if (!resetEmail) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter your email first.";

                return;

            }


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


            message.style.color =
                "#1d7442";

            message.textContent =
                "Verifying reset OTP...";


            verifyResetOTPButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `${API}/auth/verify-reset-otp`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        resetEmail,

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
                    "Reset OTP response:",
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
                        "Invalid reset OTP.";

                    return;

                }


                // Save OTP for final password reset

                resetOTP =
                    otp;


                message.style.color =
                    "#1d7442";

                message.textContent =
                    "OTP verified successfully.";


                // Move to new password step

                if (resetOTPStep) {

                    resetOTPStep.style.display =
                        "none";

                }

                if (newPasswordStep) {

                    newPasswordStep.style.display =
                        "block";

                }


                if (newPasswordInput) {

                    newPasswordInput.value = "";

                    newPasswordInput.focus();

                }


                if (confirmNewPasswordInput) {

                    confirmNewPasswordInput.value = "";

                }


            } catch (error) {

                console.error(
                    "Reset OTP Verification Error:",
                    error
                );


                message.style.color =
                    "red";

                message.textContent =
                    "Unable to verify reset OTP. Please try again.";

            } finally {

                verifyResetOTPButton.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// RESET PASSWORD
// =====================================================

if (resetPasswordButton) {

    resetPasswordButton.addEventListener(
        "click",
        async () => {

            const newPassword =
                newPasswordInput
                    ? newPasswordInput.value
                    : "";


            const confirmPassword =
                confirmNewPasswordInput
                    ? confirmNewPasswordInput.value
                    : "";


            if (!resetEmail || !resetOTP) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please complete OTP verification first.";

                return;

            }


            if (!newPassword) {

                message.style.color =
                    "red";

                message.textContent =
                    "Please enter a new password.";

                return;

            }


            if (newPassword.length < 6) {

                message.style.color =
                    "red";

                message.textContent =
                    "Password must be at least 6 characters.";

                return;

            }


            if (newPassword !== confirmPassword) {

                message.style.color =
                    "red";

                message.textContent =
                    "Passwords do not match.";

                return;

            }


            message.style.color =
                "#1d7442";

            message.textContent =
                "Updating your password...";


            resetPasswordButton.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `${API}/auth/reset-password`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        resetEmail,

                                    otp:
                                        resetOTP,

                                    newPassword:
                                        newPassword

                                })

                        }
                    );


                const data =
                    await readResponse(
                        response
                    );


                console.log(
                    "Reset password response:",
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
                        "Unable to reset password.";

                    return;

                }


                message.style.color =
                    "#1d7442";

                message.textContent =
                    "Password reset successfully! Redirecting to login...";


                // Clear reset state

                resetEmail =
                    "";

                resetOTP =
                    "";


                if (resetEmailInput) {

                    resetEmailInput.value = "";

                }

                if (resetOTPInput) {

                    resetOTPInput.value = "";

                }

                if (newPasswordInput) {

                    newPasswordInput.value = "";

                }

                if (confirmNewPasswordInput) {

                    confirmNewPasswordInput.value = "";

                }


                // Return to login after successful reset

                setTimeout(
                    () => {

                        window.location.reload();

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Reset Password Error:",
                    error
                );


                message.style.color =
                    "red";

                message.textContent =
                    "Unable to reset password. Please try again.";

            } finally {

                resetPasswordButton.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// BACK TO LOGIN - EMAIL STEP
// =====================================================

if (backToLoginFromEmail) {

    backToLoginFromEmail.addEventListener(
        "click",
        () => {

            window.location.reload();

        }
    );

}


// =====================================================
// BACK TO LOGIN - RESET OTP STEP
// =====================================================

if (backToLoginFromResetOTP) {

    backToLoginFromResetOTP.addEventListener(
        "click",
        () => {

            window.location.reload();

        }
    );

}


// =====================================================
// BACK TO LOGIN - NEW PASSWORD STEP
// =====================================================

if (backToLoginFromNewPassword) {

    backToLoginFromNewPassword.addEventListener(
        "click",
        () => {

            window.location.reload();

        }
    );

}