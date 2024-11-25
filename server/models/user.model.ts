import mongoose, {Document, Model, Schema} from "mongoose";

import bcrypt from "bcryptjs";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^s@]+$/;

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    }

    role: string;
    isVerified: boolean;
    courses: Array<{courseId: string}>;
    comparePassword: (password: string) => Promise<boolean>;
}

const userSchema: Schema<IUser> = new mongoose.Schema ({
    name: {
        type:String,
        required: [true, "Please enter your name"],
    },
    email: {
        type:String,
        required: [true, "Please enter your email"],

    }
})