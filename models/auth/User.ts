import { Schema, model } from "mongoose";

const User = new Schema(
  {
    username: {type: String, required: true},
    userId: { type: Number, unique: true, required: true },
    gameId: { type: Number, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    activity: { type: String, required: true },
    role: { type: String, default: "User" },
    isActivated: { type: Boolean, default: false },
    activationCode: { type: Number, required: true },
  },
  { timestamps: true }
);

export default model("User", User);
