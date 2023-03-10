import { Schema, model } from "mongoose";

const Token = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  refreshTokens: { type: Array, required: true },
});

export default model("Token", Token);
