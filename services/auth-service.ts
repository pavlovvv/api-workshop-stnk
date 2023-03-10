import jwt from "jsonwebtoken";
import {
  IGeneratedTokens,
  ITokenPayload,
  ITransformerCompile,
  ITransporterSendMail,
  IUserData,
} from "../interfaces/auth-interfaces.js";
import Token from "../models/auth/Token.js";
import mongoose from "mongoose";
import ApiError from "../exceptions/api-error.js";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import { INodemailerTransport } from "./../interfaces/auth-interfaces.js";

class AuthService {
  async sendEmail(email: string, activationCode: number, username: string) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;

    const code: string = activationCode.toString();

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    } as INodemailerTransport);

    transporter.use(
      "compile",
      hbs({
        viewEngine: {
          extName: ".handlebars",
          partialsDir: "views",
          layoutsDir: "views",
          defaultLayout: false,
        },
        viewPath: "views/",
      } as ITransformerCompile)
    );

    await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: "Email Verification | stnkWorkshop",
      text: "",
      template: "index",
      context: {
        num1: code[0],
        num2: code[1],
        num3: code[2],
        num4: code[3],
        num5: code[4],
        username,
      },
      attachments: [
        {
          filename: "bg.png",
          path: "views/images/bg.png",
          cid: "bg",
        },
        {
          filename: "logo.png",
          path: "views/images/logo.png",
          cid: "logo",
        },
      ],
    } as ITransporterSendMail);
  }

  async getTokens(candidate: IUserData) {
    const tokens: IGeneratedTokens = this.generateTokens(
      candidate._id,
      candidate.email,
      candidate.activationCode
    );

    await this.saveToken(candidate._id, tokens.refreshToken);

    return {
      ...tokens,
    };
  }

  generateTokens(
    id: mongoose.Types.ObjectId,
    email: string,
    activationCode: number
  ) {
    const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = process.env;

    const payload: ITokenPayload = {
      id,
      email,
      activationCode,
    };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET as string, {
      expiresIn: "24h",
    });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET as string, {
      expiresIn: "30d",
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateRefreshToken(token: string) {
    const { JWT_REFRESH_SECRET } = process.env;
    const userData = jwt.verify(token, JWT_REFRESH_SECRET as string);
    return userData;
  }

  async saveToken(id: mongoose.Types.ObjectId, refreshToken: string) {
    const token = await Token.create({
      user: id,
      refreshTokens: [refreshToken],
    });
    return token;
  }

  async updateToken(oldToken: string, newToken: string) {
    const tokenData = await Token.findOne({ refreshTokens: oldToken });
    if (tokenData) {
      const index: number = tokenData.refreshTokens.indexOf(oldToken);
      tokenData.refreshTokens[index] = newToken;
      return tokenData.save();
    } else {
      throw ApiError.UnauthorizedError();
    }
  }

  async removeToken(refreshToken: string) {
    const tokenData = await Token.findOne({ refreshTokens: refreshToken });

    if (!tokenData) {
      throw ApiError.UnauthorizedError();
    }

    tokenData.refreshTokens = tokenData.refreshTokens.filter(
      (el: string) => el !== refreshToken
    );

    return tokenData.save();
  }
}

export default new AuthService();
