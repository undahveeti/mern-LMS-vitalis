import { Request, Response, NextFunction } from "express";

import userModel, {IUser} from "../models/user.model";

import ErrorHandler from "../utils/ErrorHandler";

import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, {Secret} from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";

require("dotenv").config();

// register user
interface IRegistrationBody{
    name: string;
    email: string;
    password: string;
    avatar?:string;
}

export const registrationUser = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, email, password} = req.body;

        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist){
            return next(new ErrorHandler("Email already exists", 400)) 
        };

        const user:IRegistrationBody ={
            name,
            email,
            password,
        };

        const activationToken = createActivationToken(user);

        const activationCode = activationToken.activationCode;

        const data = {user: {name:user.name}, activationCode};

        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data)

        try {
            await sendMail({
                email: user.email,
                subject: "Activate your account",
                template: "activation-mail.ejs",
                data,
            });

            res.status(201).json({
                success:true,
                message:`Please check your email: ${user.email} to activate your account!`,
                activationToken: activationToken.token,
            });
        } catch (error:any) {
            return next(new ErrorHandler(error.message,400))
        }
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400))
        
    }
});

interface IActivationToken {
    token: string,
    activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET as Secret, 
    {
        expiresIn:"5m",
    });

    return {token,activationCode};
}

// activate user
// activate user
interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activation_token, activation_code } = req.body as IActivationRequest;

        // Verify the token and extract the payload
        const newUser = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as { user: IUser; activationCode: string };

        // Check if the activation code matches
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }

        const { name, email, password } = newUser.user;

        // Check if the email already exists
        const existUser = await userModel.findOne({ email });

        if (existUser) {
            return next(new ErrorHandler("Email already exists", 400));
        }

        // Create a new user in the database
        const user = await userModel.create({
            name,
            email,
            password,
        });

        // Respond with success
        res.status(201).json({
            success: true,
            message: "User activated successfully!",
        });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
});

// login user

interface ILoginRequest {
    email: string;
    password: string;
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email,password} = req.body as ILoginRequest;

        if(!email || !password){
            return next(new ErrorHandler("Please enter email and password", 400));
        }

        const user = await userModel.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHandler("Invalid email or password", 400));
        }
        const isPasswordMatch = await user.comparePassword(password);

        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid email or password", 400));
        }

        sendToken(user, 200, res);

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});