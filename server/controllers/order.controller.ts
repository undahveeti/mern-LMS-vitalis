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
        };



    } catch (error: any){
        return next(new ErrorHandler(error.message, 500));
    }
})