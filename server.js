const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'apotek-alpro-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Google Sheets configuration
const SHEET_ID = '1wCvZ1WAlHAn-B8UPP5AUEPzQ5Auf84BJFeG48Hlo9wE';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

// Fetch Google Sheets data
async function fetchSheetData() {
    try {
        const response = await axios.get(SHEET_URL);
        const csvData = response.data;
        const lines = csvData.split('\n');
        const data = [];
        
        // Skip header row and process data
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const columns = lines[i].split(',');
                if (columns.length >= 8) {
                    data.push({
                        shortStoreName: columns[0]?.replace(/"/g, '').trim(),
                        storeName: columns[1]?.replace(/"/g, '').trim(),
                        am: columns[3]?.replace(/"/g, '').trim(),
                        password: columns[7]?.replace(/"/g, '').trim()
                    });
                }
            }
        }
        return data;
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return [];
    }
}

// Routes
app.get('/favicon.ico', (req, res) => {
    res.status(204).send();
});

app.get('/', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
    } else {
        res.sendFile(path.join(__dirname, 'views', 'login.html'));
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password, loginType } = req.body;
    
    try {
        const sheetData = await fetchSheetData();
        let user = null;
        
        if (loginType === 'outlet') {
            // Outlet login: Column A (shortStoreName) as username, Column D (am) as password
            user = sheetData.find(row => 
                row.shortStoreName && row.shortStoreName.toLowerCase() === username.toLowerCase() && 
                row.am && row.am.toLowerCase() === password.toLowerCase()
            );
            if (user) {
                user.type = 'outlet';
                user.displayName = user.shortStoreName;
            }
        } else if (loginType === 'hq') {
            // HQ login: Column B (storeName) as username, Column H (password) as password
            user = sheetData.find(row => 
                row.storeName && row.storeName.toLowerCase() === username.toLowerCase() && 
                row.password === password
            );
            if (user) {
                user.type = 'hq';
                user.displayName = user.storeName;
            }
        }
        
        if (user) {
            req.session.user = user;
            res.json({ success: true, user: { 
                type: user.type, 
                displayName: user.displayName,
                fullStoreName: user.storeName,
                am: user.am
            }});
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.json({ success: false, message: 'Server error' });
    }
});

// Get current user
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ 
            user: { 
                type: req.session.user.type, 
                displayName: req.session.user.displayName,
                fullStoreName: req.session.user.storeName,
                am: req.session.user.am
            }
        });
    } else {
        res.json({ user: null });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apotek Alpro server running on port ${PORT}`);
});