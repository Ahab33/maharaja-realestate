const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth'); // Make sure you have this file

// ------------------ SIGNUP ------------------
router.post('/signup', async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        // Check if user already exists
        const checkQuery = "SELECT * FROM users WHERE email = ?";
        db.query(checkQuery, [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (results.length > 0) return res.status(400).json({ message: 'Email already registered' });

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert into database
            const query = "INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())";
            db.query(query, [full_name, email, phone, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });

                // Generate JWT token
                const token = jwt.sign(
                    { id: result.insertId, full_name, email },
                    process.env.JWT_SECRET,
                    { expiresIn: '1d' }
                );

                res.json({ message: 'User registered successfully', userId: result.insertId, token });
            });
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// ------------------ LOGIN ------------------
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(400).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Incorrect password' });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, full_name: user.full_name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ 
            message: 'Login successful', 
            user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone }, 
            token 
        });
    });
});

// ------------------ GET CURRENT USER ------------------
router.get('/me', authMiddleware, (req, res) => {
    // authMiddleware attaches user info to req.user
    res.json({
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        phone: req.user.phone,
        created_at: req.user.created_at || null
    });
});

module.exports = router;

