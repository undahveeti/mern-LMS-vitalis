import mongoose from "mongoose";

require('dotenv').config();

const dbUrl:string = process.env.DB_URL || '';

const connectDB = async () => {
    try {
        const data = await mongoose.connect(dbUrl);
        console.log(`Database connected with host: ${data.connection.host}`);
    } catch (error: any) {
        console.log(`Error connecting to the database: ${error.message}`);
        console.log("Retrying in 5 seconds...");
        setTimeout(connectDB, 5000); // Retry connection after 5 seconds
    }
};

export default connectDB;