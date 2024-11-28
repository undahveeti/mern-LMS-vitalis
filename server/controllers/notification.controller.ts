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
// every midnight
// without hitting api
cron.schedule("0 0 0 * * *", async() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // deletes notifications that are 30 days old (every midnight)
    await NotificationModel.deleteMany({status:"read",createdAt: {$lt: thirtyDaysAgo}});

    console.log('Deleted read notifications');
});