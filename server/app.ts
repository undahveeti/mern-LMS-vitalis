import express, { NextFunction, Request, Response } from "express";
export const app = express();

import cors from "cors";
import cookieParser from "cookie-parser";

require('dotenv').config();

import {ErrorMiddleware} from "./middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import analyticsRouter from "./routes/analytics.route";
import layoutRouter from "./routes/layout.route";

import { rateLimit } from 'express-rate-limit';

// body parser (using cloud energy)
app.use(express.json({limit: "50mb"}));

// cookie parser (for sending from frontend to backsend)
app.use(cookieParser());

// cors => cross origin resource sharing 
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}));

// api request limits
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})
//routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);

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
// Apply the rate limiting middleware to all requests.
app.use(limiter)

app.use(ErrorMiddleware);