const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// ------------------ SIGNUP ------------------
router.post('/signup', async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Full name, email, and password are required' });
        }

        const checkQuery = "SELECT * FROM users WHERE email = ?";
        db.query(checkQuery, [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });
            if (results.length > 0) return res.status(400).json({ message: 'Email already registered' });

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `
                INSERT INTO users (full_name, email, phone, password, isAdmin, created_at)
                VALUES (?, ?, ?, ?, 0, NOW())
            `;
            db.query(insertQuery, [full_name, email, phone || null, hashedPassword], (err, result) => {
                if (err) return res.status(500).json({ message: 'Database error', error: err });

                const token = jwt.sign(
                    { id: result.insertId, full_name, email, isAdmin: 0 },
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
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(400).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: 'Incorrect password' });

        const token = jwt.sign(
            { id: user.id, full_name: user.full_name, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ 
            message: 'Login successful', 
            user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, isAdmin: user.isAdmin }, 
            token 
        });
    });
});




// ------------------ GET CURRENT USER ------------------
router.get('/me', auth, (req, res) => {
    res.json({
        id: req.user.id,
        full_name: req.user.full_name,
        email: req.user.email,
        isAdmin: req.user.isAdmin
    });
});

module.exports = router;
