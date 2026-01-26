document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addPropertyForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // JWT stored in localStorage

        const title = document.getElementById("title").value;
        const country = document.getElementById("country").value;
        const city = document.getElementById("city").value;
        const location = document.getElementById("location").value;
        const price = document.getElementById("price").value;
        const type = document.getElementById("type").value;
        const listing = document.getElementById("listing").value;
        const beds = document.getElementById("beds").value;
        const baths = document.getElementById("baths").value;
        const size = document.getElementById("size").value;

        const amenities = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
            .map(cb => cb.value)
            .join(',');

        const mainImage = document.getElementById("mainImage").files[0];
        const galleryFiles = document.getElementById("galleryImages").files;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("country", country);
        formData.append("city", city);
        formData.append("location", location);
        formData.append("price", price);
        formData.append("type", type);
        formData.append("listing", listing);
        formData.append("beds", beds);
        formData.append("baths", baths);
        formData.append("size", size);
        formData.append("amenities", amenities);

        if (mainImage) formData.append("gallery", mainImage); // first image as main
        for (let i = 0; i < galleryFiles.length; i++) {
            formData.append("gallery", galleryFiles[i]);
        }

        try {
            const res = await fetch("http://localhost:5000/api/properties", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                alert("Property submitted for approval!");
                form.reset();
            } else {
                alert(data.message || "Error submitting property");
            }
        } catch (err) {
            console.error(err);
            alert("Server error, try again.");
        }
    });
});
