const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get all users
router.get('/users', auth, (req, res) => {
  db.query("SELECT id, full_name, email, phone, created_at FROM users", (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
});

// Get all properties
router.get('/properties', auth, (req, res) => {
  db.query("SELECT * FROM properties", (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
});

// Approve property
router.put('/properties/:id/approve', auth, (req, res) => {
  const id = req.params.id;
  db.query("UPDATE properties SET status = 'approved' WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json({ message: 'Property approved' });
  });
});

// Reject property
router.put('/properties/:id/reject', auth, (req, res) => {
  const id = req.params.id;
  db.query("UPDATE properties SET status = 'rejected' WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json({ message: 'Property rejected' });
  });
});

module.exports = router;
