import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";

// Export the error-handling middleware as a default export or named export
export const ErrorMiddleware = (
    err: any, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    // Set default values for statusCode and message if not provided
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Handle invalid MongoDB ObjectId errors
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handle invalid JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = "Json web token is invalid, try again";
        err = new ErrorHandler(message, 400);
    }

    // Handle expired JWT errors
    if (err.name === "TokenExpiredError") {
        const message = "Json web token has expired, try again";
        err = new ErrorHandler(message, 400);
    }

    // Send the error response
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};


