// dashboard.js

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
  // Redirect to login if not logged in
  window.location.href = "login.html";
}

// Display username
document.getElementById("username").textContent = user.full_name;

// Logout button
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

// Fetch user's properties
async function loadUserProperties() {
  try {
    const res = await fetch("http://localhost:5000/api/properties/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const properties = await res.json();

    // Update total listings
    document.getElementById("total-listings").textContent = properties.length;

    const listingsGrid = document.getElementById("my-listings-grid");
    listingsGrid.innerHTML = "";

    properties.forEach((prop) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.innerHTML = `
        <img src="${prop.image_url}" alt="${prop.title}">
        <h3>${prop.title}</h3>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${prop.location}</p>
        <p class="price">PKR ${Number(prop.price).toLocaleString()}</p>
        <div class="details">
          <span>${prop.beds} Beds</span>
          <span>${prop.baths} Baths</span>
          <span>${prop.size} sqft</span>
        </div>
        <p>Status: ${prop.status}</p>
        <button class="delete-btn" data-id="${prop.id}">Delete</button>
      `;
      listingsGrid.appendChild(card);
    });

    // Add delete functionality
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const propertyId = btn.dataset.id;
        const confirmDelete = confirm("Are you sure you want to delete this property?");
        if (!confirmDelete) return;

        const delRes = await fetch(`http://localhost:5000/api/properties/${propertyId}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token },
        });
        const delData = await delRes.json();
        alert(delData.message);
        loadUserProperties(); // Refresh list
      });
    });

    // Populate recent activity
    const activityList = document.getElementById("activity-list");
    activityList.innerHTML = "";
    properties
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5) // Show last 5 activities
      .forEach((prop) => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fas fa-home"></i> Property listed: ${prop.title} (${new Date(
          prop.created_at
        ).toLocaleString()})`;
        activityList.appendChild(li);
      });
  } catch (err) {
    console.error("Error loading properties:", err);
  }
}

// Initial load
loadUserProperties();
