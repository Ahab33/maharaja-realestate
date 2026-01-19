const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// -------------------- ADD NEW PROPERTY --------------------
router.post('/', auth, (req, res) => {
  const { title, location, price, type, listing, beds, baths, size, amenities, image_url } = req.body;
  const userId = req.user.id;

  if (!title || !location || !price || !type || !listing) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO properties 
    (user_id, title, location, price, type, listing, beds, baths, size, amenities, image_url, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
  `;

  db.query(
    query,
    [userId, title, location, price, type, listing, beds, baths, size, amenities, image_url],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.json({ message: 'Property added successfully (Pending admin approval)', propertyId: result.insertId });
    }
  );
});

// -------------------- GET ALL APPROVED PROPERTIES (PUBLIC, FILTERABLE) --------------------
router.get('/', (req, res) => {
  let { minPrice, maxPrice, type, listing, location } = req.query;

  let query = "SELECT * FROM properties WHERE status = 'approved'";
  const params = [];

  if (minPrice) {
    query += " AND price >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND price <= ?";
    params.push(maxPrice);
  }
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }
  if (listing) {
    query += " AND listing = ?";
    params.push(listing);
  }
  if (location) {
    query += " AND location LIKE ?";
    params.push(`%${location}%`);
  }

  query += " ORDER BY created_at DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json(results);
  });
});

// -------------------- GET USER'S OWN PROPERTIES --------------------
router.get('/me', auth, (req, res) => {
  const userId = req.user.id;
  const query = "SELECT * FROM properties WHERE user_id = ? ORDER BY created_at DESC";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.json(results);
  });
});

// -------------------- GET SINGLE PROPERTY --------------------
router.get('/:id', (req, res) => {
  const propertyId = req.params.id;
  const query = "SELECT * FROM properties WHERE id = ? AND status = 'approved'";

  db.query(query, [propertyId], (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (results.length === 0)
      return res.status(404).json({ message: 'Property not found or not approved yet' });
    res.json(results[0]);
  });
});

// -------------------- DELETE PROPERTY (USER ONLY) --------------------
router.delete('/:id', auth, (req, res) => {
  const propertyId = req.params.id;
  const userId = req.user.id;

  const query = "DELETE FROM properties WHERE id = ? AND user_id = ?";
  db.query(query, [propertyId, userId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    if (result.affectedRows === 0)
      return res.status(403).json({ message: "You are not authorized to delete this property" });
    res.json({ message: 'Property deleted successfully' });
  });
});

module.exports = router;
