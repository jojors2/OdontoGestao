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

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");

const emailError = document.getElementById("email-error");
const senhaError = document.getElementById("senha-error");

function validateEmail(email) {

    return email.includes("@") && email.includes(".");

}

loginForm.addEventListener("submit", function(event) {

    emailError.textContent = "";
    senhaError.textContent = "";

    emailInput.classList.remove("input-error");
    senhaInput.classList.remove("input-error");

    event.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value.trim();
    
    let formularioValido = true;

    if (email === "") {

        emailError.textContent = "Informe seu e-mail.";
        emailInput.classList.add("input-error");

        formularioValido = false;

    } else if (!validateEmail(email)) {

        emailError.textContent = "Informe um e-mail válido.";
        emailInput.classList.add("input-error");

        formularioValido = false;

    }

    emailInput.addEventListener("input", function() {
        emailError.textContent = "";
        emailInput.classList.remove("input-error");
    });

    if (senha === "") {

        senhaError.textContent = "Informe sua senha.";
        senhaInput.classList.add("input-error");

        formularioValido = false;

    } else if (senha.length < 6) {

        senhaError.textContent = "A senha deve ter pelo menos 6 caracteres.";
        senhaInput.classList.add("input-error");

        formularioValido = false;
    }

    senhaInput.addEventListener("input", function() {
        senhaError.textContent = "";
        senhaInput.classList.remove("input-error");
    });

    if (formularioValido) {
        window.location.href = "dashboard.html";
    }
});