const passwordInput = document.getElementById("senha");

const togglePasswordButton =
    document.getElementById("togglePassword");


togglePasswordButton.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePasswordButton.textContent = "🙉"

    } else {

        passwordInput.type = "password";
        togglePasswordButton.textContent = "🙈"

    }

});