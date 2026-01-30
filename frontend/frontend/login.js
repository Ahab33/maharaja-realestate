// login.js
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.querySelector('input[name="email"]').value.trim();
  const password = document.querySelector('input[name="password"]').value.trim();

  const credentials = { email, password };

  try {
    const res = await fetch("http://localhost:5000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed!");
      return;
    }

    // Save JWT token + user info
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful!");

    // ✅ Redirect based on user type
    // For now: user with id = 1 is admin
    if (data.user.id === 7) {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred. Please try again.");
  }
});
