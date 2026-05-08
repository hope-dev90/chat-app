import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '..', 'schema.sql');

async function seedData() {
    console.log('Seeding initial data...');

    // Create test users
    const users = [
        { name: 'Marie Uwase', email: 'marie@example.com', password: 'password123', role: 'girl' },
        { name: 'Grace Mukamena', email: 'grace@example.com', password: 'password123', role: 'girl' },
        { name: 'Aline Gasana', email: 'aline@example.com', password: 'password123', role: 'girl' },
        { name: 'Divine Keza', email: 'divine@example.com', password: 'password123', role: 'girl' },
        { name: 'Alice Umutoni', email: 'alice@example.com', password: 'password123', role: 'mentor' },
        { name: 'Diane Mukamena', email: 'diane@example.com', password: 'password123', role: 'mentor' },
    ];

    const createdUsers = [];
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, is_verified)
             VALUES ($1, $2, $3, $4, true)
             ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
             RETURNING *`,
            [user.name, user.email, hashedPassword, user.role]
        );
        createdUsers.push(result.rows[0]);
    }
    console.log('✅ Test users created');

    // Create circles
    const circles = [
        { name: 'Women in Agri-Tech', description: 'Empowering women in agricultural technology across Rwanda', color: '#EF6C6C', createdBy: createdUsers[4].id },
        { name: 'Coding Basics', description: 'A supportive space for Rwandan women to master HTML, CSS, and JS fundamentals.', color: '#2563EB', createdBy: createdUsers[4].id },
    ];

    const createdCircles = [];
    for (const circle of circles) {
        const result = await pool.query(
            `INSERT INTO circles (name, description, color, created_by)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [circle.name, circle.description, circle.color, circle.createdBy]
        );
        createdCircles.push(result.rows[0]);
    }
    console.log('✅ Circles created');

    // Add all users to circles
    for (const circle of createdCircles) {
        for (const user of createdUsers) {
            await pool.query(
                `INSERT INTO circle_members (circle_id, user_id)
                 VALUES ($1, $2)
                 ON CONFLICT DO NOTHING`,
                [circle.id, user.id]
            );
        }
    }
    console.log('✅ Users added to circles');

    // Create posts
    const posts = [
        {
            userId: createdUsers[1].id, // Grace
            title: 'New STEM Scholarship cycle for 2024 is now open!',
            content: 'Applications are now open for girls in Rwanda pursuing STEM degrees. The scholarship covers full tuition and a monthly stipend.',
            status: 'synced',
            hashtags: ['Scholarships']
        },
        {
            userId: createdUsers[2].id, // Aline
            title: 'Best practices for using IoT in local irrigation?',
            content: 'I\'m working on a project with smallholder farmers in Musanze and would love to hear your experiences!',
            status: 'sync_pending',
            hashtags: ['IoT']
        },
        {
            userId: createdUsers[3].id, // Divine
            title: 'Documenting our progress in Musanze!',
            content: 'We had an amazing workshop last week with over 50 women in tech!',
            status: 'reach_offline',
            hashtags: ['Community']
        },
        {
            userId: createdUsers[4].id, // Alice
            circleId: createdCircles[1].id, // Coding Basics
            title: 'Offline Syncing Tutorial is Live',
            content: 'I\'ve uploaded the new module on how to handle local storage for our project. You can access it even if your internet is spotty.',
            status: 'synced',
            hashtags: ['Tutorial']
        }
    ];

    for (const post of posts) {
        const result = await pool.query(
            `INSERT INTO posts (circle_id, user_id, title, content, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [post.circleId || null, post.userId, post.title, post.content, post.status]
        );
        const createdPost = result.rows[0];
        
        // Add hashtags
        for (const hashtag of post.hashtags) {
            await pool.query(
                `INSERT INTO post_hashtags (post_id, hashtag)
                 VALUES ($1, $2)`,
                [createdPost.id, hashtag]
            );
        }
    }
    console.log('✅ Posts created');

    console.log('Database setup and seeding complete! 🚀');
}

try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema is ready');
    
    await seedData();
} catch (error) {
    const refused = error.code === 'ECONNREFUSED' || error.errors?.some((err) => err.code === 'ECONNREFUSED');

    if (refused) {
        console.error(
            [
                'Database setup failed.',
                `No PostgreSQL server is accepting connections at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}.`,
                'Start PostgreSQL first, then run: npm run db:setup'
            ].join('\n')
        );
    } else {
        console.error('Database setup failed:', error.message);
    }

    process.exitCode = 1;
} finally {
    await pool.end();
}
