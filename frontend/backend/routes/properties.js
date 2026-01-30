const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// -------------------- IMAGE UPLOAD --------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// -------------------- ADD PROPERTY --------------------
router.post('/', auth, upload.array('gallery', 5), (req, res) => {
    const { title, location, country, city, price, type, listing, beds, baths, size, amenities } = req.body;
    const userId = req.user.id;

    if (!title || !location || !price || !type || !listing || !country || !city) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const mainImage = req.files[0]?.filename || null;
    const galleryImages = req.files.slice(1).map(f => f.filename).join(',');

    const query = `
        INSERT INTO properties
        (user_id, title, location, country, city, price, type, listing, beds, baths, size, amenities, image_url, gallery_images, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(
        query,
        [userId, title, location, country, city, price, type, listing, beds || null, baths || null, size || null, amenities || null, mainImage, galleryImages],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.json({ message: 'Property added (pending approval)', propertyId: result.insertId });
        }
    );
});

// -------------------- GET ALL APPROVED PROPERTIES --------------------
router.get('/', (req, res) => {
    let { minPrice, maxPrice, type, listing, country, city, beds, amenities } = req.query;
    let query = "SELECT * FROM properties WHERE status = 'approved'";
    const params = [];

    if (minPrice) { query += " AND price >= ?"; params.push(minPrice); }
    if (maxPrice) { query += " AND price <= ?"; params.push(maxPrice); }
    if (type) { query += " AND type = ?"; params.push(type); }
    if (listing) { query += " AND listing = ?"; params.push(listing); }
    if (country) { query += " AND country = ?"; params.push(country); }
    if (city) { query += " AND city = ?"; params.push(city); }
    if (beds) { query += " AND beds >= ?"; params.push(beds); }
    if (amenities) { query += " AND amenities LIKE ?"; params.push(`%${amenities}%`); }

    query += " ORDER BY created_at DESC";

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// -------------------- GET USER'S PROPERTIES --------------------
router.get('/me', auth, (req, res) => {
    const userId = req.user.id;
    db.query("SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC", [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// -------------------- GET SINGLE PROPERTY --------------------
router.get('/:id', (req, res) => {
    const propertyId = req.params.id;
    db.query("SELECT * FROM properties WHERE id = ? AND status = 'approved'", [propertyId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'Property not found or not approved' });
        res.json(results[0]);
    });
});

// -------------------- DELETE PROPERTY --------------------
router.delete('/:id', auth, (req, res) => {
    const propertyId = req.params.id;
    const userId = req.user.id;

    db.query("DELETE FROM properties WHERE id = ? AND user_id = ?", [propertyId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized to delete this property" });
        res.json({ message: 'Property deleted successfully' });
    });
});

module.exports = router;


