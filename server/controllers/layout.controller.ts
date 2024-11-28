import { Request, NextFunction, Response } from "express";

import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layout.model";
import cloudinary from "cloudinary";

// create layout
export const createLayout = CatchAsyncError(async(req:Request,res:Response, next:NextFunction)=>{
    try {
        const {type} = req.body;
        
        const isTypeExist = await LayoutModel.findOne({type});

        if(isTypeExist){
            return next(new ErrorHandler(`${type} already exist`, 400));
        }

        if(type === "Banner"){
            const {image, title, subTitle} = req.body;

            const myCloud = await cloudinary.v2.uploader.upload(image,{
                folder: "layout",
            });
            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                },
                title,
                subTitle
            }

            await LayoutModel.create(banner);
            
        }
        if(type === 'FAQ'){
            const {faq} = req.body;
            const faqItems = await Promise.all(
                faq.map(async(item:any) => {
                    return {
                        question: item.question,
                        answer: item.answer,
                    };
                })
            )
            await LayoutModel.create({type:"FAQ", faq:faqItems});
        }
        if(type === "Categories"){
            const {categories} = req.body;

            await LayoutModel.create(categories);
        }

        res.status(200).json({
            success: true,
            message: "Layout created successfully",
        });


    }catch (error:any) {
        return next(new ErrorHandler(error.message, 400));
    }
});