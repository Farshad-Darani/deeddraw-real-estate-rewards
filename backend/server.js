const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5500', 
        'http://127.0.0.1:5500', 
        'http://192.168.1.75:5500', 
        'http://localhost:8080', 
        'http://127.0.0.1:8080',
        'https://deeddraw.com',
        'https://www.deeddraw.com',
        'http://deeddraw.com',
        'http://www.deeddraw.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/public', require('./routes/public'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/referrals', require('./routes/referrals'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contact', require('./routes/contact'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'DeedDraw API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to DeedDraw API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            public: '/api/public',
            auth: '/api/auth',
            users: '/api/users',
            transactions: '/api/transactions',
            referrals: '/api/referrals',
            admin: '/api/admin'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Server initialization
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');

        // Sync database (creates tables if they don't exist)
        await sequelize.sync({ alter: false }); // Set to true in development to auto-update schema
        console.log('✅ Database synchronized');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📡 API available at http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
