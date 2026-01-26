const API_URL = "http://localhost:5000/api/properties";
const propertiesList = document.getElementById("properties-list");
const propertiesCount = document.getElementById("properties-count");

let allProperties = []; // all approved properties from backend
let filteredProperties = []; // filtered properties to render

// ----------------- FETCH APPROVED PROPERTIES -----------------
async function fetchApprovedProperties() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // Store only approved properties
    allProperties = data.filter((p) => p.status === "approved");

    // Initial render
    filteredProperties = [...allProperties];
    renderProperties(filteredProperties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    propertiesList.innerHTML = "<p>Error loading properties.</p>";
  }
}

// ----------------- RENDER PROPERTY CARDS -----------------
function renderProperties(properties) {
  propertiesList.innerHTML = "";

  if (properties.length === 0) {
    propertiesList.innerHTML = "<p>No properties match your filters.</p>";
    propertiesCount.textContent = `0 Properties Found`;
    return;
  }

  propertiesCount.textContent = `${properties.length} Properties Found`;

  properties.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("property-card");
    card.dataset.id = p.id;

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
    `;

    propertiesList.appendChild(card);
  });

  addFavoriteListeners();
}

// ----------------- FILTER LOGIC -----------------
function applyFilters() {
  const type = document.getElementById("property-type").value;
  const listingCheckboxes = document.querySelectorAll(".listing-type:checked");
  const minPrice = Number(document.getElementById("min-price").value);
  const maxPrice = Number(document.getElementById("max-price").value);
  const bedroomButtons = document.querySelectorAll(".bedroom-buttons button.active");
  const amenityCheckboxes = document.querySelectorAll(".amenity:checked");

  filteredProperties = allProperties.filter((p) => {
    // Property type
    if (type && p.type.toLowerCase() !== type.toLowerCase()) return false;

    // Listing type
    if (listingCheckboxes.length) {
      const selectedListings = Array.from(listingCheckboxes).map((c) => c.value);
      if (!selectedListings.includes(p.listing.toLowerCase())) return false;
    }

    // Price range (PKR)
    if (p.price < minPrice || p.price > maxPrice) return false;

    // Bedrooms
    if (bedroomButtons.length) {
      const selectedBeds = Array.from(bedroomButtons).map((b) => b.dataset.bed);
      if (selectedBeds.includes("4+") && p.beds >= 4) return true;
      if (!selectedBeds.includes(p.beds.toString())) return false;
    }

    // Amenities
    if (amenityCheckboxes.length) {
      const selectedAmenities = Array.from(amenityCheckboxes).map((c) => c.value);
      for (let amenity of selectedAmenities) {
        if (!p.amenities.includes(amenity)) return false;
      }
    }

    return true;
  });

  // Apply sorting after filtering
  applySorting();
}

// ----------------- SORTING LOGIC -----------------
function applySorting() {
  const sortValue = document.getElementById("sort-properties").value;

  if (sortValue === "newest") {
    filteredProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortValue === "price-low") {
    filteredProperties.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-high") {
    filteredProperties.sort((a, b) => b.price - a.price);
  }

  renderProperties(filteredProperties);
}

// ----------------- FAVORITE BUTTON LISTENER (placeholder) -----------------
function addFavoriteListeners() {
  const buttons = document.querySelectorAll(".favorite-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("Favorite feature coming soon!");
    });
  });
}

// ----------------- FILTER EVENT LISTENERS -----------------
document.getElementById("property-type").addEventListener("change", applyFilters);
document.querySelectorAll(".listing-type").forEach((c) => c.addEventListener("change", applyFilters));
document.getElementById("min-price").addEventListener("input", applyFilters);
document.getElementById("max-price").addEventListener("input", applyFilters);
document.querySelectorAll(".bedroom-buttons button").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    applyFilters();
  });
});
document.querySelectorAll(".amenity").forEach((c) => c.addEventListener("change", applyFilters));
document.getElementById("sort-properties").addEventListener("change", applySorting);
document.querySelector(".reset-btn").addEventListener("click", () => {
  // Reset all filters
  document.getElementById("property-type").value = "";
  document.querySelectorAll(".listing-type").forEach((c) => c.checked = false);
  document.getElementById("min-price").value = 0;
  document.getElementById("max-price").value = 100000000;
  document.querySelectorAll(".bedroom-buttons button").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".amenity").forEach((c) => c.checked = false);

  filteredProperties = [...allProperties];
  applySorting();
});


// Get elements
const minPriceSlider = document.getElementById("min-price");
const maxPriceSlider = document.getElementById("max-price");
const minPriceTooltip = document.getElementById("min-price-tooltip");
const maxPriceTooltip = document.getElementById("max-price-tooltip");

// Function to format PKR
function formatPKR(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr+`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)} Lakh`;
  return `₹${value.toLocaleString()}`;
}

// Update tooltip positions and values
function updatePriceTooltips() {
  minPriceTooltip.textContent = formatPKR(Number(minPriceSlider.value));
  maxPriceTooltip.textContent = formatPKR(Number(maxPriceSlider.value));

  // Calculate positions relative to slider width
  const minPercent = (minPriceSlider.value - minPriceSlider.min) / (minPriceSlider.max - minPriceSlider.min) * 100;
  const maxPercent = (maxPriceSlider.value - maxPriceSlider.min) / (maxPriceSlider.max - maxPriceSlider.min) * 100;

  minPriceTooltip.style.left = `calc(${minPercent}% - 20px)`; // adjust -20px for center
  maxPriceTooltip.style.left = `calc(${maxPercent}% - 20px)`;
}

// Event listeners for sliders
minPriceSlider.addEventListener("input", () => {
  if (Number(minPriceSlider.value) > Number(maxPriceSlider.value)) {
    minPriceSlider.value = maxPriceSlider.value;
  }
  updatePriceTooltips();
  applyFilters();
});

maxPriceSlider.addEventListener("input", () => {
  if (Number(maxPriceSlider.value) < Number(minPriceSlider.value)) {
    maxPriceSlider.value = minPriceSlider.value;
  }
  updatePriceTooltips();
  applyFilters();
});

// Initialize tooltips on load
updatePriceTooltips();


// ----------------- INITIAL LOAD -----------------
fetchApprovedProperties();
