export interface IUserDataRequest {
  username: string;
  gameId: number;
  email: string;
  password: string;
  activity: string;
}

export interface ISignUpResponse {
  message: string;
  errors?: object;
}

export interface ILoginResponse {
  message?: string;
  accessToken?: string;
}

export interface IDefaultResponse {
  message: string;
}

import mongoose from "mongoose";

export interface IUserData {
  _id: mongoose.Types.ObjectId;
  userId: number;
  gameId: number;
  email: string;
  password: string;
  activity: string;
  role: string;
  activationCode: number;
  isActivated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVerifyCodeRequest {
  email: string;
  verificationCode: number;
}

export interface INodemailerTransport {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    rejectUnauthorized: boolean;
  };
}

export interface ITransporterSendMail {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  template: string;
}

export interface ITokenPayload {
  id: mongoose.Types.ObjectId;
  email: string;
  activationCode: number;
}

export interface IErrorMiddleware {
  status: number;
  message: string;
  errors: object;
}

export interface ITransformerCompile {
  viewEngine: object;
  viewPath: string;
}

export interface IGeneratedTokens {
  accessToken: string;
  refreshToken: string;
}
