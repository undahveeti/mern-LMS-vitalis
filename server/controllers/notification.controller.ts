import NotificationModel from "../models/notificationModel"; 
import { NextFunction, Response, Request } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";

// get all notifs -- only for admin
export const getNotifications = CatchAsyncError(async (req: Request, res: Response, next: NextFunction)=> {
    try {
        // send data in reverse
      const notifications = await NotificationModel.find().sort({createdAt: -1});

      res.status(201).json({
        success:true, 
        notifications,
      })

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// update notification status -- only for admin

export const updateNotification =  CatchAsyncError(async (req: Request, res: Response, next: NextFunction)=> {
    try {
        const notification = await NotificationModel.findById(req.params.id);

        if(!notification){
            return next(new ErrorHandler("Notification not found", 500)); 
        } else {
            notification.status ? notification.status = 'read': notification?.status; 
        }
        
        await notification.save();

        // we will update on the frontend
        const notifications = await NotificationModel.find().sort({
            createdAt: -1,
        });

        res.status(201).json({
            success: true,
            notifications,
        })
    } catch (error:any){
        return next(new ErrorHandler(error.message, 500));
    }
})

// delte notification -- only admin
// after 5 seconds
cron.schedule("*/5 * * * * *", function(){
    console.log("--------------");
    console.log("running cron");
})