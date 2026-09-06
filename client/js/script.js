// =========================================================
// ECOBAG SHOP - GLOBAL SCRIPT
// =========================================================


// ================= THEME =================

const themeButton = document.getElementById("theme");


if (themeButton) {

    themeButton.addEventListener("click", function () {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "ecoTheme",
            isDark ? "dark" : "light"
        );


        themeButton.textContent =
            isDark ? "☀️" : "🌙";

    });

}


// ================= LOAD SAVED THEME =================

const savedTheme =
    localStorage.getItem("ecoTheme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    if (themeButton) {
        themeButton.textContent = "☀️";
    }

}


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem("user");

    localStorage.removeItem("token");

    window.location.href = "login.html";

}