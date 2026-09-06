const form =
    document.getElementById("registerForm");


form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


        const user = {

            name:
                document
                    .getElementById("name")
                    .value
                    .trim(),

            email:
                document
                    .getElementById("email")
                    .value
                    .trim(),

            password:
                document
                    .getElementById("password")
                    .value,

            phone:
                document
                    .getElementById("phone")
                    .value
                    .trim(),

            address:
                document
                    .getElementById("address")
                    .value
                    .trim()

        };


        try {

            const response =
                await fetch(
                    "/api/auth/register",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(user)

                    }
                );


            const data =
                await response.json();


            document.getElementById(
                "message"
            ).innerHTML =
                data.message;


        } catch (error) {

            console.error(
                "Registration Error:",
                error
            );


            document.getElementById(
                "message"
            ).innerHTML =
                "Server Error";

        }

    }
);