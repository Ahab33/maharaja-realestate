const API_URL = "http://localhost:5000/api/admin";
const token = localStorage.getItem("token");

// Redirect if not logged in
if (!token) {
  alert("Please login as admin first.");
  window.location.href = "login.html";
}

// Elements
const propertyList = document.getElementById("property-list");
const searchInput = document.getElementById("search-property");
const statusFilter = document.getElementById("status-filter");

// Fetch all properties
async function fetchProperties() {
  try {
    const res = await fetch(`${API_URL}/properties`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    renderProperties(data);
  } catch (error) {
    console.error("Error fetching properties:", error);
    propertyList.innerHTML = "<p>Error loading properties</p>";
  }
}

// Render properties in cards
function renderProperties(properties) {
  propertyList.innerHTML = "";

  // Apply filters
  const searchTerm = searchInput.value.toLowerCase();
  const statusValue = statusFilter.value;

  const filtered = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm);
    const matchesStatus = statusValue === "all" || p.status === statusValue;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    propertyList.innerHTML = "<p>No properties found.</p>";
    return;
  }

  filtered.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("property-card");

    card.innerHTML = `
      <img src="${p.image_url}" alt="Property Image">
      <div class="details">
        <h4>${p.title}</h4>
        <p>${p.location}</p>
        <p><strong>PKR ${Number(p.price).toLocaleString()}</strong></p>
        <p>Status: <span class="status ${p.status}">${p.status}</span></p>
        <div class="actions">
          ${
            p.status === "pending"
              ? `
                <button class="approve-btn" data-id="${p.id}">Approve</button>
                <button class="reject-btn" data-id="${p.id}">Reject</button>
              `
              : ""
          }
        </div>
      </div>
    `;

    propertyList.appendChild(card);
  });

  // Add Approve / Reject listeners
  document.querySelectorAll(".approve-btn").forEach((btn) =>
    btn.addEventListener("click", () => handleApproval(btn.dataset.id, "approve"))
  );
  document.querySelectorAll(".reject-btn").forEach((btn) =>
    btn.addEventListener("click", () => handleApproval(btn.dataset.id, "reject"))
  );
}

// Handle Approve / Reject
async function handleApproval(id, action) {
  try {
    const res = await fetch(`${API_URL}/properties/${id}/${action}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    alert(data.message);
    fetchProperties();
  } catch (error) {
    console.error("Error approving/rejecting property:", error);
  }
}

// Event listeners for search and filter
searchInput.addEventListener("input", fetchProperties);
statusFilter.addEventListener("change", fetchProperties);

// Initial load
fetchProperties();
