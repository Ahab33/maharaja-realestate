const API_URL = "http://localhost:5000/api/properties";
const propertiesList = document.getElementById("properties-list");

// Fetch approved properties only
async function fetchApprovedProperties() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Filter only approved
    const approved = data.filter((p) => p.status === "approved");

    renderProperties(approved);
  } catch (error) {
    console.error("Error fetching properties:", error);
    propertiesList.innerHTML = "<p>Error loading properties.</p>";
  }
}

// Render property cards
function renderProperties(properties) {
  propertiesList.innerHTML = "";

  if (properties.length === 0) {
    propertiesList.innerHTML = "<p>No properties available at the moment.</p>";
    return;
  }

  properties.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("property-card");

    card.innerHTML = `
      <img src="${p.image_url}" alt="Property Image" />
      <h3>${p.title}</h3>
      <p class="location"><i class="fas fa-map-marker-alt"></i> ${p.location}</p>
      <p class="price">PKR ${Number(p.price).toLocaleString()}</p>
      <div class="details">
        <span>${p.beds} Beds</span>
        <span>${p.baths} Baths</span>
        <span>${p.size} sqft</span>
      </div>
      <div class="rating">★★★★★</div>
    `;

    propertiesList.appendChild(card);
  });
}

// Auto-load approved properties
fetchApprovedProperties();
