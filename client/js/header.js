document.addEventListener("DOMContentLoaded", () => {

    const user =
        JSON.parse(
            localStorage.getItem("user")
        );


    const loginLink =
        document.getElementById("loginLink");

    const registerLink =
        document.getElementById("registerLink");

    const userMenu =
        document.getElementById("userMenu");


    // Make sure the elements exist on the page

    if (!loginLink || !registerLink || !userMenu) {

        return;

    }


    // ================= LOGGED IN =================

    if (user && user.email) {

        loginLink.style.display = "none";

        registerLink.style.display = "none";

        userMenu.style.display = "block";

    }


    // ================= LOGGED OUT =================

    else {

        loginLink.style.display = "inline-block";

        registerLink.style.display = "inline-block";

        userMenu.style.display = "none";

    }

});


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    window.location.href = "login.html";

}