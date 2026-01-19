// property Page Logic Start //


// Sample property data (20+ samples)


// Elements
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const minTooltip = document.getElementById('min-price-tooltip');
const maxTooltip = document.getElementById('max-price-tooltip');
const propertyTypeSelect = document.getElementById('property-type');
const listingCheckboxes = document.querySelectorAll('.listing-type');
const bedroomButtons = document.querySelectorAll('.bedroom-buttons button');
const amenityCheckboxes = document.querySelectorAll('.amenity');
const resetBtn = document.querySelector('.reset-btn');
const propertiesList = document.getElementById('properties-list');
const sortSelect = document.getElementById('sort-properties');
const propertiesCount = document.getElementById('properties-count');
const paginationContainer = document.getElementById('pagination');

let currentPage = 1;
const propertiesPerPage = 9;

// Format price
function formatPrice(value) {
  if (value >= 100000000) return "₹10 Cr+";
  if (value >= 10000000) return `₹${(value/10000000).toFixed(1)} Cr`;
  return `₹${(value/100000).toLocaleString()} Lakh`;
}

// Update tooltip
function updateTooltip(input, tooltip) {
  const min = Number(input.min);
  const max = Number(input.max);
  const val = Number(input.value);
  const percent = ((val - min) / (max - min)) * 100;
  tooltip.style.left = `calc(${percent}% )`;
  tooltip.textContent = formatPrice(val);
}

// Render properties with pagination
function renderProperties() {
  const minPrice = Number(minPriceInput.value);
  const maxPrice = Number(maxPriceInput.value);
  const type = propertyTypeSelect.value;
  const listings = Array.from(listingCheckboxes).filter(c => c.checked).map(c => c.value);
  const beds = Array.from(bedroomButtons).filter(b => b.classList.contains('active')).map(b => b.dataset.bed);
  const amenities = Array.from(amenityCheckboxes).filter(c => c.checked).map(c => c.value);

  let filtered = properties.filter(p => {
    if (p.price < minPrice) return false;
    if (maxPrice < 100000000 && p.price > maxPrice) return false;
    if (type && p.type !== type) return false;
    if (listings.length && !listings.includes(p.listing)) return false;
    if (beds.length && !beds.some(b => (b === "4+" ? p.beds >= 4 : p.beds == Number(b)))) return false;
    if (amenities.length && !amenities.every(a => p.amenities.includes(a))) return false;
    return true;
  });

  // Sorting
  if(sortSelect) {
    const sort = sortSelect.value;
    if(sort === "price-low") filtered.sort((a,b)=>a.price-b.price);
    else if(sort === "price-high") filtered.sort((a,b)=>b.price-a.price);
    else if(sort === "newest") filtered.sort((a,b)=>b.id-b.id);
  }

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / propertiesPerPage);
  if(currentPage > totalPages) currentPage = 1;
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = startIndex + propertiesPerPage;
  const paginated = filtered.slice(startIndex, endIndex);

  // Count
  if(propertiesCount) propertiesCount.textContent = `${filtered.length} Properties Found`;

  // Render cards
  propertiesList.innerHTML = paginated.map(p => `
    <div class="property-card">
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>Type: ${p.type}, Listing: ${p.listing}</p>
      <p>₹${(p.price/100000).toLocaleString()} Lakh | Beds: ${p.beds}</p>
      <p>Amenities: ${p.amenities.join(', ')}</p>
      <button class="view-details">View Details</button>
    </div>
  `).join('') || "<p>No properties match your filters.</p>";

  // Render pagination
  renderPagination(totalPages);
}

// Render pagination buttons
function renderPagination(totalPages) {
  if(!paginationContainer) return;
  let buttons = "";
  for(let i=1;i<=totalPages;i++){
    buttons += `<button class="page-btn ${i===currentPage?'active':''}" data-page="${i}">${i}</button>`;
  }
  paginationContainer.innerHTML = buttons;

  // Add click listeners
  const pageBtns = paginationContainer.querySelectorAll('.page-btn');
  pageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = Number(btn.dataset.page);
      renderProperties();
    });
  });
}

// Event listeners
[minPriceInput, maxPriceInput].forEach(input => {
  const tooltip = input === minPriceInput ? minTooltip : maxTooltip;
  input.addEventListener('input', () => {
    let minVal = Number(minPriceInput.value);
    let maxVal = Number(maxPriceInput.value);
    if(minVal > maxVal){
      if(input.id==='min-price') maxPriceInput.value=minVal;
      else minPriceInput.value=maxVal;
    }
    updateTooltip(minPriceInput, minTooltip);
    updateTooltip(maxPriceInput, maxTooltip);
    currentPage = 1;
    renderProperties();
  });
});

propertyTypeSelect.addEventListener('change', ()=>{currentPage=1; renderProperties();});
listingCheckboxes.forEach(c=>c.addEventListener('change', ()=>{currentPage=1; renderProperties();}));
bedroomButtons.forEach(b=>b.addEventListener('click', ()=>{
  b.classList.toggle('active');
  currentPage=1;
  renderProperties();
}));
amenityCheckboxes.forEach(c=>c.addEventListener('change', ()=>{currentPage=1; renderProperties();}));
if(resetBtn) resetBtn.addEventListener('click', ()=>{
  propertyTypeSelect.value="";
  listingCheckboxes.forEach(c=>c.checked=false);
  bedroomButtons.forEach(b=>b.classList.remove('active'));
  amenityCheckboxes.forEach(c=>c.checked=false);
  minPriceInput.value=0;
  maxPriceInput.value=100000000;
  updateTooltip(minPriceInput, minTooltip);
  updateTooltip(maxPriceInput, maxTooltip);
  currentPage=1;
  renderProperties();
});
if(sortSelect) sortSelect.addEventListener('change', ()=>{currentPage=1; renderProperties();});

// Initialize
updateTooltip(minPriceInput, minTooltip);
updateTooltip(maxPriceInput, maxTooltip);
renderProperties();


// Property Page Logic End //