// server.js
// HairSafe Backend Server with Express

const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// For serving images from images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

// ============================================
// DATABASE (In-memory for demo)
// ============================================
let users = [
    { username: 'demo', password: 'demo123', mobile: '9876543210', email: 'demo@hairsafe.com' }
];

let consultations = [];
let orders = [];

// ============================================
// ROUTES - HTML PAGES
// ============================================

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Cart page
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

// Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Payment page
app.get('/payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment.html'));
});

// ============================================
// API ROUTES - USER AUTHENTICATION
// ============================================

// Register new user
app.post('/api/register', (req, res) => {
    const { username, password, mobile, email } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    // Create new user
    const newUser = { username, password, mobile, email };
    users.push(newUser);
    
    res.json({ success: true, message: 'User registered successfully' });
});

// Login user
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: 'Login successful', user: { username: user.username, mobile: user.mobile } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Generate OTP (demo - always returns 123456)
app.post('/api/send-otp', (req, res) => {
    const { mobile } = req.body;
    
    if (!mobile || mobile.length < 10) {
        return res.status(400).json({ success: false, message: 'Valid mobile number required' });
    }
    
    // In production, integrate with SMS gateway like Twilio, MSG91, etc.
    const demoOTP = '123456';
    
    res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        otp: demoOTP // Remove this in production
    });
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { mobile, otp } = req.body;
    
    // Demo OTP verification
    if (otp === '123456') {
        res.json({ success: true, message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

// ============================================
// API ROUTES - CONSULTATION
// ============================================

// Submit consultation request
app.post('/api/consultation', (req, res) => {
    const { name, email, mobile, problem, imageUrl } = req.body;
    
    const consultation = {
        id: 'CONS' + Date.now(),
        name,
        email,
        mobile,
        problem,
        imageUrl,
        status: 'pending',
        createdAt: new Date()
    };
    
    consultations.push(consultation);
    
    res.json({ 
        success: true, 
        message: 'Consultation request submitted successfully',
        consultationId: consultation.id
    });
});

// Get consultation status
app.get('/api/consultation/:id', (req, res) => {
    const consultation = consultations.find(c => c.id === req.params.id);
    
    if (consultation) {
        res.json({ success: true, consultation });
    } else {
        res.status(404).json({ success: false, message: 'Consultation not found' });
    }
});

// ============================================
// API ROUTES - ORDERS
// ============================================

// Create order
app.post('/api/orders', (req, res) => {
    const { items, total, paymentMethod, shippingAddress } = req.body;
    
    const order = {
        orderId: 'HR' + Date.now().toString().slice(-8),
        items,
        total,
        paymentMethod,
        shippingAddress,
        status: 'confirmed',
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days later
    };
    
    orders.push(order);
    
    res.json({ 
        success: true, 
        order,
        trackingUrl: `https://hairsafe.com/track/${order.orderId}`
    });
});

// Get order status
app.get('/api/orders/:orderId', (req, res) => {
    const order = orders.find(o => o.orderId === req.params.orderId);
    
    if (order) {
        res.json({ success: true, order });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// ============================================
// API ROUTES - AI HAIR ANALYSIS (Gemini API)
// ============================================

// Initialize Gemini AI (optional - requires API key)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY');

app.post('/api/analyze-hair', async (req, res) => {
    const { description, imageBase64 } = req.body;
    
    try {
        // Demo response - In production, call Gemini API
        const analysis = {
            hairType: 'Normal to Oily',
            scalpCondition: 'Mild Dandruff',
            concerns: ['Slight hair fall', 'Scalp irritation'],
            recommendations: [
                'Use anti-dandruff shampoo twice a week',
                'Apply hair serum with biotin',
                'Maintain a protein-rich diet'
            ],
            confidence: 85
        };
        
        res.json({ 
            success: true, 
            analysis,
            disclaimer: 'This is an AI-generated analysis. Please consult a trichologist for accurate diagnosis.'
        });
        
    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ success: false, message: 'AI analysis failed. Please try again.' });
    }
});

// ============================================
// API ROUTES - PRODUCTS
// ============================================

// Get all products
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: 'Revitalizing Shampoo', price: 120, category: 'shampoo', inStock: true },
        { id: 2, name: 'Growth-Boost Oil', price: 200, category: 'oil', inStock: true },
        { id: 3, name: 'Anti-Fall Serum', price: 350, category: 'serum', inStock: true },
        { id: 4, name: 'Hydrating Conditioner', price: 260, category: 'conditioner', inStock: true }
    ];
    
    res.json({ success: true, products });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    const products = [
        { id: 1, name: 'Revitalizing Shampoo', price: 120, description: 'Revitalizes dry scalp and promotes healthy hair growth.', inStock: true },
        { id: 2, name: 'Growth-Boost Oil', price: 200, description: 'Natural oils that boost hair growth and strength.', inStock: true },
        { id: 3, name: 'Anti-Fall Serum', price: 350, description: 'Reduces hair fall by up to 70% with regular use.', inStock: true },
        { id: 4, name: 'Hydrating Conditioner', price: 260, description: 'Deep conditioning for smooth, silky hair.', inStock: true }
    ];
    
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (product) {
        res.json({ success: true, product });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

// ============================================
// API ROUTES - COUPONS & OFFERS
// ============================================

app.get('/api/coupons/:code', (req, res) => {
    const coupons = {
        'WELCOME10': { discount: 10, minOrder: 200, type: 'percentage' },
        'HAIRSAFE20': { discount: 20, minOrder: 500, type: 'percentage' },
        'FREESHIP': { discount: 40, minOrder: 399, type: 'shipping' }
    };
    
    const coupon = coupons[req.params.code.toUpperCase()];
    
    if (coupon) {
        res.json({ success: true, coupon });
    } else {
        res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }
});

// ============================================
// API ROUTES - CONTACT & NEWSLETTER
// ============================================

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    // In production, send email notification
    console.log('Contact Form:', { name, email, message });
    
    res.json({ success: true, message: 'Message sent successfully. We will get back to you soon!' });
});

app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // In production, save to database
    console.log('Newsletter Subscription:', email);
    
    res.json({ success: true, message: 'Subscribed to newsletter successfully!' });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime(),
        version: '2.0.0'
    });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
    ═══════════════════════════════════════════
    🚀 HairSafe Server is running!
    📡 URL: http://localhost:${PORT}
    📁 Static files: /public
    🖼️ Images: /images
    ═══════════════════════════════════════════
    
    Available API Endpoints:
    ───────────────────────────────────────────
    🔐 Auth:
       POST   /api/register     - Register new user
       POST   /api/login        - Login user
       POST   /api/send-otp     - Send OTP
       POST   /api/verify-otp   - Verify OTP
    
    📞 Consultation:
       POST   /api/consultation - Submit consultation
       GET    /api/consultation/:id - Get status
    
    📦 Orders:
       POST   /api/orders       - Create order
       GET    /api/orders/:id   - Get order status
    
    🤖 AI:
       POST   /api/analyze-hair - AI hair analysis
    
    🏷️ Offers:
       GET    /api/coupons/:code - Validate coupon
    
    📧 Contact:
       POST   /api/contact      - Contact form
       POST   /api/newsletter   - Subscribe
    
    ⚡ Health:
       GET    /api/health       - Server health check
    `);
});

// ============================================
// EXPORT FOR TESTING
// ============================================
module.exports = app;