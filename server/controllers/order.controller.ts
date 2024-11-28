import {NextFunction, Request, Response} from "express";

import { CatchAsyncError } from "../middleware/catchAsyncErrors";

import ErrorHandler from "../utils/ErrorHandler";
import OrderModel, {IOrder} from "../models/orderModel";
import CourseModel from "../models/course.model";
import path from "path";
import ejs from "ejs";

import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";
import userModel from "../models/user.model";
import { newOrder } from "../services/order.service";
import mongoose from "mongoose";

// create order
export const createOrder = CatchAsyncError(async(req:Request,res: Response, next:NextFunction)=>{
    try {
        const {courseId, payment_info} = req.body as IOrder;

        const user = await userModel.findById(req.user?._id);

        // have to check if user alrdy bought the course previously

        const courseExistInUser = user?.courses.some((course:any) => course._id.toString() === courseId);

        if(courseExistInUser){
            return next(new ErrorHandler("You have already purchased this course", 400));

        }

        const course = await CourseModel.findById(courseId);

        if(!course){
            return next(new ErrorHandler("Course not found", 404));
        }

        const data:any = {
            courseId: course._id,
            userId: user?._id,
            payment_info,
        };

        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6), // Uses `slice` assuming `ObjectId` converts to a string
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            },
        };

        const html = await ejs.renderFile(path.join(__dirname,'..mails/order-confirmation.ejs'), {order:mailData});

        try {
            if(user){
                await sendMail({
                    email: user.email,
                    subject: "Order Confirmation",
                    template:"order-confirmation.ejs",
                    data: mailData,

                });

                res.status(200).json({
                    success: true,
                    message: "Email sent successfully",
                });

            }
        } catch(error:any){
            return next(new ErrorHandler(error.message, 500));
        }

        // Push course ID into user's courses array
        user?.courses.push({ courseId: course._id.toString() });

        await user?.save();

        const notification = await NotificationModel.create({
            user: user?._id,
            title: "New Order",
            message: `You have a new order from ${course?.name}`,
        });

        newOrder(data,res,next);

    } catch (error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})