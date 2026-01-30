// nav.js
const userNav = document.getElementById("user-nav");
const user = JSON.parse(localStorage.getItem("user")); // get user info from login

if (user) {
  // User is logged in
  let dashboardLink = `<a href="dashboard.html">Dashboard</a>`;

  // ✅ Add extra admin dashboard link if user id = 7 (or isAdmin = true if you have that)
  if (user.id === 7) {
    dashboardLink = `<a href="admin-dashboard.html">Admin Dashboard</a>`;
  }

  userNav.innerHTML = `
    ${dashboardLink}
    <button id="logout-btn">Logout</button>
  `;

  // Logout handler
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

} else {
  // User not logged in, keep login/signup
  userNav.innerHTML = `
    <a href="login.html">Login</a>
    <a href="signup.html" class="signup-btn">Sign Up</a>
  `;
}
