document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addPropertyForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get values from the form
    const title = document.getElementById('title').value.trim();
    const location = document.getElementById('location').value.trim();
    const price = document.getElementById('price').value;
    const type = document.getElementById('type').value;
    const listing = document.getElementById('listing').value;
    const beds = document.getElementById('beds').value;
    const baths = document.getElementById('baths').value;
    const size = document.getElementById('size').value;
    const image_url = document.getElementById('image_url').value.trim();

    // Collect checked amenities
    const amenitiesCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
    const amenities = Array.from(amenitiesCheckboxes).map(cb => cb.value).join(','); // comma separated string

    // Get token from localStorage (or wherever you stored it after login)
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a property.');
      return;
    }

    // Prepare data to send
    const data = {
      title,
      location,
      price,
      type,
      listing,
      beds,
      baths,
      size,
      amenities,
      image_url
    };

    try {
      const response = await fetch('http://localhost:5000/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to add property');
      }

      alert(`Property added successfully! ID: ${result.propertyId}`);
      form.reset(); // Clear the form

    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    }
  });
});
