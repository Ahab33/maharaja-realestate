const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// -------------------- ADD FAVORITE --------------------
router.post('/:propertyId', auth, (req, res) => {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    // Check if already favorited
    const checkQuery = "SELECT * FROM favorites WHERE user_id = ? AND property_id = ?";
    db.query(checkQuery, [userId, propertyId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length > 0) return res.status(400).json({ message: 'Property already in favorites' });

        const insertQuery = "INSERT INTO favorites (user_id, property_id, created_at) VALUES (?, ?, NOW())";
        db.query(insertQuery, [userId, propertyId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            res.json({ message: 'Added to favorites', favoriteId: result.insertId });
        });
    });
});

// -------------------- REMOVE FAVORITE --------------------
router.delete('/:propertyId', auth, (req, res) => {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    const query = "DELETE FROM favorites WHERE user_id = ? AND property_id = ?";
    db.query(query, [userId, propertyId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Favorite not found" });
        res.json({ message: 'Removed from favorites' });
    });
});

// -------------------- GET USER FAVORITES --------------------
router.get('/', auth, (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT p.* FROM properties p
        JOIN favorites f ON p.id = f.property_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    `;
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

module.exports = router;
