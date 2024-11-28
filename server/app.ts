import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

require('dotenv').config();

import {ErrorMiddleware} from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";

// body parser (using cloud energy)
app.use(express.json({limit: "50mb"}));

// cookie parser (for sending from frontend to backsend)
app.use(cookieParser());

// cors => cross origin resource sharing 
app.use(cors({
    origin: process.env.ORIGIN,
}));

//routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);

// testing api 
app.get("/test", (req:Request , res:Response , next:NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

// unknown route
app.all("*", (req: Request, res:Response, next:NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
});

app.use(ErrorMiddleware);