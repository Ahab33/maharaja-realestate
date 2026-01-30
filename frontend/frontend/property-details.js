const params = new URLSearchParams(window.location.search);
const propertyId = params.get("id");

async function fetchPropertyDetails() {
  try {
    const res = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
    const property = await res.json();

    // Images
    const images = JSON.parse(property.images || "[]");
    const gallery = document.getElementById("image-gallery");
    gallery.innerHTML = images.map(img => `<img src="${img}" alt="Property Image">`).join("");

    // Details
    document.getElementById("title").textContent = property.title;
    document.getElementById("location").textContent = property.location;
    document.getElementById("price").textContent = `PKR ${Number(property.price).toLocaleString()}`;
    document.getElementById("details").textContent = `${property.beds} Beds • ${property.baths} Baths • ${property.size} sqft`;
    document.getElementById("amenities").textContent = property.amenities;

    // Contact info
    document.getElementById("owner-name").textContent = `Name: ${property.owner_name}`;
    document.getElementById("owner-phone").textContent = `Phone: ${property.owner_phone}`;
    document.getElementById("owner-email").textContent = `Email: ${property.owner_email}`;

  } catch (err) {
    console.error("Error loading property:", err);
  }
}

fetchPropertyDetails();
