import ApiError from "./../exceptions/api-error.js";
import { Request, Response, NextFunction } from "express";
import { IErrorMiddleware } from "./../interfaces/auth-interfaces.js";

export default function (
  err: IErrorMiddleware,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(err);
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }
  return res.status(500).json({ message: "Unexpected error" });
}
