const menuButton = document.getElementById("menuButton");

const sidebar = document.getElementById("sidebar");

const headerLeft = document.getElementById("headerLeft");


menuButton.addEventListener("click", function () {

    sidebar.classList.toggle("closed");

});