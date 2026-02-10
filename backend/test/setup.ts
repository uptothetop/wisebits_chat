import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import * as fs from 'fs';
import * as path from 'path';

async function seedDatabase() {
    console.log('🌱 Seeding test database...');

    // Override environment for test DB
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = 'mongodb://test:test123@localhost:27018/wisebits_test?authSource=admin';

    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
        // Load user fixtures
        const usersPath = path.join(__dirname, 'fixtures', 'users.json');
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

        console.log(`📥 Loading ${usersData.length} test users...`);

        // Create each user
        for (const userData of usersData) {
            try {
                await usersService.create(userData);
                console.log(`  ✅ Created user: ${userData.username}`);
            } catch (error) {
                // User might already exist
                console.log(`  ⚠️  User ${userData.username} already exists, skipping`);
            }
        }

        console.log('✅ Test database seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    } finally {
        await app.close();
    }
}

seedDatabase();
