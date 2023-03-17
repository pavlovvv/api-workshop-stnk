import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import User from "../models/auth/User.js";
import { JwtPayload } from "jsonwebtoken";
import { Request, NextFunction } from "express";
import { TypedRequestBody, TypedResponse } from "../types.js";
import {
  ISignUpResponse,
  IUserDataRequest,
  IDefaultResponse,
  IUserData,
  IVerifyCodeRequest,
  ILoginResponse,
} from "../interfaces/auth-interfaces.js";
import * as dotenv from "dotenv";
import authService from "../services/auth-service.js";
import ApiError from "./../exceptions/api-error.js";
import { IGeneratedTokens } from "./../interfaces/auth-interfaces.js";
import Token from "../models/auth/Token.js";

dotenv.config();

class authController {
  async signup(
    req: TypedRequestBody<IUserDataRequest>,
    res: TypedResponse<ISignUpResponse>,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Registration error", errors });
      }

      const { username, gameId, email, password, activity } = req.body;
      const candidate = await User.findOne({ email });

      if (candidate) {
        if (candidate.isActivated) {
          return res
            .status(400)
            .json({ message: "A user with the same email already exists" });
        }

        await User.deleteOne({ email });
      }

      const hashPassword: string = bcrypt.hashSync(password, 5);
      const activationCode: number = Math.floor(
        Math.random() * (99999 - 10000 + 1) + 10000
      );

      const lastUser = await User.findOne().sort({ createdAt: 1 }).limit(1);
      const userId: number = !lastUser ? 10000000 : lastUser!.userId + 1;

      const user = new User({
        username,
        gameId,
        userId,
        email,
        password: hashPassword,
        activity,
        activationCode,
      });
      await user.save();

      await authService.sendEmail(email, activationCode, username);

      return res.status(200).json({ message: "Success" });
    } catch (e) {
      next(e);
    }
  }

  async verifyCode(
    req: TypedRequestBody<IVerifyCodeRequest>,
    res: TypedResponse<ILoginResponse>,
    next: NextFunction
  ) {
    try {
      const { email, verificationCode } = req.body;

      const candidate: IUserData | null = await User.findOne({ email });

      if (!candidate) throw ApiError.NotFound("Incorrect email");
      if (candidate.isActivated) throw ApiError.BadRequest("Already activated");

      if (verificationCode !== candidate.activationCode) {
        throw ApiError.BadRequest("Incorrect activation code");
      }

      await User.updateOne(
        { email },
        {
          isActivated: true,
        }
      );

      const tokens: IGeneratedTokens = await authService.getTokens(candidate);

      res
        .cookie("refreshToken", tokens.refreshToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .status(200)
        .json({ accessToken: tokens.accessToken });
    } catch (e) {
      next(e);
    }
  }

  async refresh(
    req: Request,
    res: TypedResponse<ILoginResponse>,
    next: NextFunction
  ) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        console.log("no refresh Token in cookies");
        throw ApiError.UnauthorizedError();
      }

      const userData: string | JwtPayload =
        authService.validateRefreshToken(refreshToken);
      const tokenFromDb = await Token.findOne({ refreshTokens: refreshToken });

      if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
      }

      const user: IUserData | null = await User.findById(
        typeof userData !== "string" && userData.id
      );
      const tokens = authService.generateTokens(
        user!._id,
        user!.email,
        user!.activationCode
      );

      await authService.updateToken(refreshToken, tokens.refreshToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      return res.status(200).json({ accessToken: tokens.accessToken });
    } catch (e) {
      next(e);
    }
  }

  async login(
    req: TypedRequestBody<IUserDataRequest>,
    res: TypedResponse<ILoginResponse>,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;

      const candidate: IUserData | null = await User.findOne({ email });
      const tokenFromDb = await Token.findOne({ user: candidate });
      const refreshTokenFromDb: string =
        tokenFromDb?.refreshTokens[tokenFromDb.refreshTokens.length - 1];
      const isPasswordValid: boolean = bcrypt.compareSync(
        password,
        candidate!.password
      );

      if (!candidate || !isPasswordValid) {
        throw ApiError.BadRequest("Incorrect email or password");
      }

      const tokens = authService.generateTokens(
        candidate!._id,
        candidate!.email,
        candidate!.activationCode
      );

      await authService.updateToken(refreshTokenFromDb, tokens.refreshToken);

      res.cookie("refreshToken", tokens.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({ accessToken: tokens.accessToken });
    } catch (e) {
      next(e);
    }
  }

  async logout(
    req: Request,
    res: TypedResponse<IDefaultResponse>,
    next: NextFunction
  ) {
    try {
      const { refreshToken } = req.cookies;
      await authService.removeToken(refreshToken);
      res.clearCookie("refreshToken");
      return res.json({ message: "Success" });
    } catch (e) {
      next(e);
    }
  }
}

export default new authController();
