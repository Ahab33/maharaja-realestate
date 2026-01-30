const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// -------------------- GET ALL USERS --------------------
router.get('/users', auth, admin, (req, res) => {
    db.query("SELECT id, full_name, email, phone, created_at, isAdmin FROM users", (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// -------------------- GET ALL PROPERTIES --------------------
router.get('/properties', auth, admin, (req, res) => {
    db.query("SELECT * FROM properties ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json(results);
    });
});

// -------------------- APPROVE PROPERTY --------------------
router.put('/properties/:id/approve', auth, admin, (req, res) => {
    const id = req.params.id;
    db.query("UPDATE properties SET status = 'approved' WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ message: 'Property approved' });
    });
});

// -------------------- REJECT PROPERTY --------------------
router.put('/properties/:id/reject', auth, admin, (req, res) => {
    const id = req.params.id;
    db.query("UPDATE properties SET status = 'rejected' WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.json({ message: 'Property rejected' });
    });
});

// -------------------- GET ADMIN STATS --------------------
router.get('/stats', auth, admin, (req, res) => {
    const stats = {};
    db.query("SELECT COUNT(*) AS totalUsers FROM users", (err, users) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        stats.totalUsers = users[0].totalUsers;

        db.query("SELECT COUNT(*) AS totalProperties FROM properties", (err, properties) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            stats.totalProperties = properties[0].totalProperties;

            db.query("SELECT COUNT(*) AS pendingProperties FROM properties WHERE status = 'pending'", (err, pending) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });
                stats.pendingProperties = pending[0].pendingProperties;

                res.json(stats);
            });
        });
    });
});

module.exports = router;
