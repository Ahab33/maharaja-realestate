const API_URL = "http://localhost:5000/api/admin";
const token = localStorage.getItem("token");

// Redirect to login if not logged in
if (!token) {
  alert("Please login as admin first.");
  window.location.href = "login.html";
}

// Fetch pending properties from backend
async function fetchPendingProperties() {
  try {
    const res = await fetch(`${API_URL}/properties`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    const pendingList = document.getElementById("pending-list");
    pendingList.innerHTML = "";

    const pending = data.filter((p) => p.status === "pending");

    if (pending.length === 0) {
      pendingList.innerHTML = "<p>No pending properties right now.</p>";
      return;
    }

    pending.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.innerHTML = `
        <img src="${p.image_url}" alt="Property">
        <div class="details">
          <h4>${p.title}</h4>
          <p>${p.location}</p>
          <p><strong>PKR ${p.price.toLocaleString()}</strong></p>
          <div class="actions">
            <button class="approve-btn" data-id="${p.id}">Approve</button>
            <button class="reject-btn" data-id="${p.id}">Reject</button>
          </div>
        </div>
      `;
      pendingList.appendChild(card);
    });

    // Add click handlers
    document.querySelectorAll(".approve-btn").forEach((btn) =>
      btn.addEventListener("click", () => handleApproval(btn.dataset.id, "approve"))
    );
    document.querySelectorAll(".reject-btn").forEach((btn) =>
      btn.addEventListener("click", () => handleApproval(btn.dataset.id, "reject"))
    );
  } catch (error) {
    console.error("Error fetching pending properties:", error);
  }
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
    fetchPendingProperties(); // Refresh after action
  } catch (error) {
    console.error("Error approving/rejecting property:", error);
  }
}

// Run on load
fetchPendingProperties();
