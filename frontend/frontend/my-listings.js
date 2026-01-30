// my-listings.js

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token) {
  window.location.href = "login.html";
}

// Display username
document.getElementById("username").textContent = user.full_name;

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

// Load user properties
async function loadUserProperties() {
  try {
    const res = await fetch("http://localhost:5000/api/properties/me", {
      headers: { Authorization: "Bearer " + token },
    });
    const properties = await res.json();

    const listingsGrid = document.getElementById("my-listings-grid");
    listingsGrid.innerHTML = "";

    if (properties.length === 0) {
      listingsGrid.innerHTML = "<p>You have not added any properties yet.</p>";
      return;
    }

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
        <p>Status: <strong>${prop.status}</strong></p>
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
        loadUserProperties(); // Refresh the list
      });
    });
  } catch (err) {
    console.error("Error loading properties:", err);
  }
}

// Initial load
loadUserProperties();
