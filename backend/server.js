const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect users routes
const usersRoutes = require('./routes/users'); // <-- note it's 'users.js'
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const propertyRoutes = require('./routes/properties');
app.use('/api/properties', propertyRoutes);


const favoriteRoutes = require('./routes/favorites');
app.use('/api/favorites', favoriteRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);



