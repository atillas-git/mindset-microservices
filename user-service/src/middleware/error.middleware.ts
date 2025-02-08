import { Request, Response,NextFunction } from "express";
import { CustomError } from "../utils/custom-error";

export const errorHandler = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    console.error('Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({
        error: {
          code: error.errorCode,
          message: error.message,
          details: error.details,
        }
      });
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal Server Error',
        },
      });
      return;
    }
}