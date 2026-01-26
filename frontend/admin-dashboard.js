document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token"); // Admin JWT
    if (!token) {
        alert("You must be logged in as admin");
        window.location.href = "login.html";
        return;
    }

    const totalUsersEl = document.getElementById("total-users");
    const totalListingsEl = document.getElementById("total-listings");
    const pendingApprovalsEl = document.getElementById("pending-approvals");
    const pendingListEl = document.getElementById("pending-list");
    const logoutBtn = document.querySelector(".logout-btn");

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
    });

    // -------------------- GET STATS --------------------
    fetch("http://localhost:5000/api/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch stats. Status: " + res.status);
        return res.json();
    })
    .then(stats => {
        totalUsersEl.textContent = stats.totalUsers || 0;
        totalListingsEl.textContent = stats.totalProperties || 0;
        pendingApprovalsEl.textContent = stats.pendingProperties || 0;
    })
    .catch(err => console.error("Error fetching stats:", err));

    // -------------------- GET PENDING PROPERTIES --------------------
    fetch("http://localhost:5000/api/admin/properties", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch properties. Status: " + res.status);
        return res.json();
    })
    .then(properties => {
        // Ensure properties is an array
        if (!Array.isArray(properties)) {
            console.error("Expected array but got:", properties);
            properties = [];
        }

        pendingListEl.innerHTML = "";
        properties.filter(p => p.status === "pending").forEach(p => {
            const div = document.createElement("div");
            div.classList.add("pending-card");
            div.innerHTML = `
                <h3>${p.title}</h3>
                <p>${p.location}${p.city ? ', ' + p.city : ''}${p.country ? ', ' + p.country : ''}</p>
                <p>Price: ${p.price.toLocaleString()} PKR</p>
                <button class="approve-btn" data-id="${p.id}">Approve</button>
                <button class="reject-btn" data-id="${p.id}">Reject</button>
            `;
            pendingListEl.appendChild(div);
        });

        // Approve / Reject functionality
        document.querySelectorAll(".approve-btn").forEach(btn => {
            btn.addEventListener("click", () => updateStatus(btn.dataset.id, "approve"));
        });
        document.querySelectorAll(".reject-btn").forEach(btn => {
            btn.addEventListener("click", () => updateStatus(btn.dataset.id, "reject"));
        });
    })
    .catch(err => console.error("Error fetching pending properties:", err));

    function updateStatus(id, action) {
        fetch(`http://localhost:5000/api/admin/properties/${id}/${action}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error(`Failed to ${action} property. Status: ` + res.status);
            return res.json();
        })
        .then(data => {
            alert(data.message);
            location.reload(); // reload dashboard to update stats
        })
        .catch(err => console.error(`Error ${action} property:`, err));
    }
});
