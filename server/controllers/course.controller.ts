import {NextFunction, Request, Response} from "express";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { createCourse, getAllCoursesService } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";

import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import NotificationModel from "../models/notificationModel";

// upload course
export const uploadCourse = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;
        if (thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder: "courses"
            });

            data.thumbnail = {
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            }
        }
        createCourse(data, res, next);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// edit course
export const editCourse = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const data = req.body;
        const thumbnail = data.thumbnail;

        if(thumbnail){
            await cloudinary.v2.uploader.destroy(thumbnail.public_id);

            const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
                folder:"courses"
            });

            data.thumbnail = {
                public_id:myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const courseId = req.params.id;

        const course = await CourseModel.findByIdAndUpdate(courseId, {
            $set: data},
            {new: true
        });

        res.status(201).json({
            success: true,
            course,
        });
    } catch (error:any){
        return next(new ErrorHandler(error.message, 500));
    }
});

// get single course -- without purchasing
// access to all

export const getSingleCourse = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {

        const courseId = req.params.id;

        const isCacheExist = await redis.get(courseId);

        console.log('hitting redis');

        if(isCacheExist){
            const course = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                course
            })
        }
        else {

            const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            console.log('hitting mongodb');

            await redis.set(courseId, JSON.stringify(course));

            res.status(200).json({
                success: true,
                course
            });
        }
    } catch (error: any){
        return next(new ErrorHandler(error.message, 500));
    }
});

// get all courses -- without purchasing
// access to all
export const getCourses = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {

        const isCacheExist = await redis.get("allCourses");

        console.log('hitting redis');

        if (isCacheExist) {
            const courses = JSON.parse(isCacheExist);
            res.status(200).json({
                success: true,
                courses
            });
        } else {
            const courses = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

            console.log('hitting mongodb');
            
            await redis.set("allCourses", JSON.stringify(courses));

            res.status(200).json({
                success: true,
                courses
            });
        }

    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// get course content - for valid user
export const getCourseByUser = CatchAsyncError(async (req: Request, res: Response, next:NextFunction) => {
    try {
        const userCourseList = await req.user?.courses;
        const courseId = req.params.id;

        const courseExists = userCourseList?.find((course:any) => course._id.toString() === courseId);

        if(!courseExists){
            return next(new ErrorHandler("You are not eligible to access this course", 404));
        }

        const course = await CourseModel.findById(courseId);

        const content = course?.courseData;

        res.status(200).json({
            success: true,
            content,
        });
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// add question in course
interface IAddQuestionData{
    question: string;
    courseId: string;
    contentId: string;
}

export const addQuestion = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {

        const {question, courseId, contentId}: IAddQuestionData = req.body;
        const course = await CourseModel.findById(courseId);

        // checking if contentId is valid
        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id", 400));

        }

        const courseContent = course?.courseData.find((item:any) => item._id.equals(contentId));

        if(!courseContent){
            return next(new ErrorHandler("Invalid content id", 400));
        }

        // create new question object
        const newQuestion:any = {
            user:req.user,
            question,
            questionReplies:[],
        };

        // add this question to our course content

        courseContent.questions.push(newQuestion);

        await NotificationModel.create({
            user: req.user?.__id,
            title:"New Question Received",
            message:`You have a new question in ${courseContent.title}`,
        });

        // save updated course

        await course?.save();
        res.status(200).json({
            success: true,
            course,
        });

    }catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// add answer in course question

interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

export const addAnswer = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {answer, courseId, contentId, questionId}:IAddAnswerData = req.body;
        const course = await CourseModel.findById(courseId);

        if(!mongoose.Types.ObjectId.isValid(contentId)){
            return next(new ErrorHandler("Invalid content id", 400));

        }

        const courseContent = course?.courseData.find((item:any) => item._id.equals(contentId));

        if(!courseContent){
            return next(new ErrorHandler("Invalid content id", 400));
        }

        const question = courseContent?.questions?.find((item: any) => 
            item._id.equals(questionId)
        );

        if(!question) {
            return next(new ErrorHandler("Invalid question id", 400));
        }

        // create a new answer object
        const newAnswer: any = {
            user: req.user,
            answer,
        }

        // add this answer to our course content
        question.questionReplies.push(newAnswer);

        await course?.save();  

        if(req.user?._id === question.user._id){
            // create a notifcation
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Question Reply Recieved",
                message: `You have a new question reply in ${courseContent.title}`,
            })

        } 
        else {
            const data = {
                name: question.user.name,
                title: courseContent.title,

            }

            const html = await ejs.renderFile(path.join(__dirname, "../mails/question-reply.ejs"), data)
            try {

                await sendMail({
                    email:question.user.email,
                    subject: "Question Reply",
                    template: "question-reply.ejs",
                    data,
                });

                res.status(200).json({
                    success: true,
                    message: "Email sent successfully",
                });

            }   catch (error:any) {
                return next(new ErrorHandler(error.message, 500));
            } 
        }


    } catch (error:any) {
        return next(new ErrorHandler(error.message, 500));
    }
});


// add review in course

interface IAddReviewData {
    review: string;
    courseId: string;
    rating: number;
    userId: string;
}

export const addReview =  CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const userCourseList = req.user?.courses;

        const courseId = req.params.id;

        // check if courseId already exists in userCourseList based on _id
        const courseExists = userCourseList?.some((course:any) => course._id.toString() === courseId.toString());

        if(!courseExists){
            return next(new ErrorHandler("You are not eligible to access this couse", 404));
        }

        const course = await CourseModel.findById(courseId);

        const {review,rating} = req.body as IAddReviewData;

        if (typeof rating !== 'number' || rating < 0 || rating > 5) {
            return next(new ErrorHandler("Invalid rating value. It must be a number between 0 and 5.", 400));
        }
        
        const reviewData:any = {
            user:req.user,
            comment: review,
            rating,
        }

        course?.reviews.push(reviewData);

        let avg = 0;

        // review average calculation
        course?.reviews.forEach((rev:any) => {
            avg += rev.ratings;
        });
        
        if (course) {
            let avg = 0;
        
            // Filter out reviews with invalid ratings
            const validReviews = course.reviews.filter((rev: any) => typeof rev.rating === 'number');
        
            validReviews.forEach((rev: any) => {
                avg += rev.rating;
            });
        
            // Avoid division by zero
            course.ratings = validReviews.length > 0 ? avg / validReviews.length : 0;
        
            await course.save();
        }

        const notification = {
            title: "New Review Recieved",
            message: `${req.user?.name} has given a review on in ${course?.name}`,

        }

        // create notification 

        res.status(200).json({
            success: true,
            course, 
        });

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
    }
})

// add reply in review
interface IAddReviewData{
    comment: string;
    courseId: string;
    reviewId: string;
}
export const addReplyToReview = CatchAsyncError(async(req: Request, res:Response, next:NextFunction)=>{
    try {
        const {comment, courseId, reviewId} = req.body as IAddReviewData;

        const course = await CourseModel.findById(courseId);

        if(!course){
            return next (new ErrorHandler("Course not found", 404));
        }

        const review = course?.reviews?.find((rev:any)=> rev._id.toString() === reviewId);

        if(!review){
            return next(new ErrorHandler("Review not found", 404));

        }

        const replyData:any = {
            user: req.user,
            comment
        };

        if(!review.commentReplies){
            review.commentReplies = [];
        }
        
        review.commentReplies?.push(replyData);

        await course?.save();

        res.status(200).json({
            success: true,
            course, 
        });

    } catch (error:any){
        return next(new ErrorHandler(error.message, 500));
    
    }
});

// get all courses -- only for admin

export const getAllCourses = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        getAllCoursesService(res);
    } catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

// delete course -- only for admin
export const deleteCourse= CatchAsyncError(async(req: Request, res: Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        const course = await CourseModel.findById(id);

        if(!course){
            return next(new ErrorHandler("User not found", 404));
        }
        await course.deleteOne({id});

        await redis.del(id);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully"
        });
        
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }

});