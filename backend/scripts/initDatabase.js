const { sequelize } = require('../config/database');
const { User, Transaction, Referral } = require('../models');
require('dotenv').config();

async function initializeDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        console.log('🔄 Creating tables...');
        await sequelize.sync({ force: false }); // Set to true to drop existing tables
        console.log('✅ All tables created successfully');

        // Create admin user if not exists
        const adminEmail = 'admin@deeddraw.com';
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            console.log('🔄 Creating admin user...');
            const admin = await User.create({
                firstName: 'Admin',
                lastName: 'User',
                email: adminEmail,
                phone: '+1-555-0000',
                password: 'Admin1974!',
                category: 'individual',
                isAdmin: true,
                isVerified: true,
                isActive: true
            });
            console.log(`✅ Admin user created: ${adminEmail} / Admin1974!`);
            console.log(`   Referral Code: ${admin.referralCode}`);
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create test user if in development
        if (process.env.NODE_ENV === 'development') {
            const testEmail = 'test@deeddraw.com';
            const existingTest = await User.findOne({ where: { email: testEmail } });

            if (!existingTest) {
                console.log('🔄 Creating test user...');
                const testUser = await User.create({
                    firstName: 'Test',
                    lastName: 'User',
                    email: testEmail,
                    phone: '+1-555-1111',
                    password: 'Test123!',
                    category: 'agent-broker',
                    company: 'Test Realty Inc.',
                    isVerified: true,
                    isActive: true
                });
                console.log(`✅ Test user created: ${testEmail} / Test123!`);
                console.log(`   Referral Code: ${testUser.referralCode}`);
            } else {
                console.log('ℹ️  Test user already exists');
            }
        }

        console.log('\n✅ Database initialization complete!');
        console.log('\n📝 Login Credentials:');
        console.log('   Admin: admin@deeddraw.com / Admin1974!');
        if (process.env.NODE_ENV === 'development') {
            console.log('   Test:  test@deeddraw.com / Test123!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();
