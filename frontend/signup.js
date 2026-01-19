// signup.js
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.querySelector('input[name="fullName"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const phone = document.querySelector('input[name="phone"]').value.trim();
  const password = document.querySelector('input[name="password"]').value.trim();
  const confirmPassword = document.querySelector('input[name="confirmPassword"]').value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const userData = { full_name, email, phone, password };

  try {
    const res = await fetch("http://localhost:5000/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Signup failed!");
      return;
    }

    alert("Signup successful! Redirecting to login...");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Signup error:", err);
    alert("An error occurred. Please try again.");
  }
});
