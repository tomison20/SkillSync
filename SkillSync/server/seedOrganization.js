import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Organization from './models/Organization.js';
import { connectDB } from './config/db.js';

dotenv.config({ path: './.env' }); // Explicit path

const seedOrganization = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        console.log('MongoDB Connected.');

        const orgEncoded = {
            name: "AJCE",
            uniqueCode: "AJCE2026",
            domain: "ajce.in"
        };

        // Check if exists
        const exists = await Organization.findOne({ uniqueCode: orgEncoded.uniqueCode });
        if (exists) {
            console.log('Organization AJCE already exists.');
            console.log(`ID: ${exists._id}`);
            process.exit();
        }

        const org = await Organization.create(orgEncoded);
        console.log(`Organization Verified: ${org.name} (${org.uniqueCode})`);
        console.log(`ID: ${org._id}`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
};

seedOrganization();
