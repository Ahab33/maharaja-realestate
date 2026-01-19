// nav.js
const userNav = document.getElementById("user-nav");
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (user && token) {
  // Logged-in user: show dashboard instead of login/signup
  userNav.innerHTML = `<a href="dashboard.html">Dashboard</a>`;
} else {
  // Not logged in: show login/signup
  userNav.innerHTML = `
    <a href="login.html">Login</a>
    <a href="signup.html">Sign Up</a>
  `;
}
