const API_URL = "http://localhost:5000/api/admin/users";
const token = localStorage.getItem("token");
const tableBody = document.getElementById("user-table-body");
const searchInput = document.getElementById("search-user");

// Redirect to login if not logged in
if (!token) {
  alert("Please login as admin first.");
  window.location.href = "login.html";
}

// Fetch all users from backend
async function fetchUsers() {
  try {
    const res = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch users");

    const users = await res.json();
    renderUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    tableBody.innerHTML = `<tr><td colspan="6">Error loading users.</td></tr>`;
  }
}

// Render users in table
function renderUsers(users) {
  tableBody.innerHTML = "";

  if (users.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6">No users found.</td></tr>`;
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${user.full_name}</td>
      <td>${user.email}</td>
      <td>${new Date(user.created_at).toLocaleDateString()}</td>
      <td>Active</td>
      <td>
        <button class="delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i> Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  addDeleteListeners();
}

// Delete user
function addDeleteListeners() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.dataset.id;
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        alert(data.message);
        fetchUsers(); // Refresh table
      } catch (error) {
        console.error("Error deleting user:", error);
        alert(error.message || "Failed to delete user.");
      }
    });
  });
}

// Search filter
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  const rows = tableBody.querySelectorAll("tr");

  rows.forEach((row) => {
    const name = row.children[1].textContent.toLowerCase();
    const email = row.children[2].textContent.toLowerCase();
    row.style.display = name.includes(filter) || email.includes(filter) ? "" : "none";
  });
});

// Run on page load
fetchUsers();
