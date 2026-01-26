const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// -------------------- SEND MESSAGE --------------------
router.post('/', auth, (req, res) => {
    const { propertyId, receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!propertyId || !receiverId || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO messages (property_id, sender_id, receiver_id, message, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `;
    db.query(query, [propertyId, senderId, receiverId, message], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ message: 'Message sent successfully', messageId: result.insertId });
    });
});

// -------------------- GET USER MESSAGES --------------------
router.get('/', auth, (req, res) => {
    const userId = req.user.id;
    const query = `
        SELECT m.*, u.full_name AS sender_name, p.title AS property_title
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        JOIN properties p ON m.property_id = p.id
        WHERE m.receiver_id = ? OR m.sender_id = ?
        ORDER BY m.created_at DESC
    `;
    db.query(query, [userId, userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

module.exports = router;
