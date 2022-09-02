import { model, Schema, Types } from "mongoose";

interface User {
  email: string;
}

export const userSchema = new Schema<User>(
  {
    email: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model(`user`, userSchema);
