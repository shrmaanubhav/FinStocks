import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserChat extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  chats: {
    timestamp: Date;
    query: string;
    advice: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserChatSchema = new Schema<IUserChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    chats: [
      {
        timestamp: {
          type: Date,
          required: true,
        },
        query: {
          type: String,
          required: true,
          trim: true,
        },
        advice: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserChatSchema.index({ userId: 1 });

export const UserChat: Model<IUserChat> =
  mongoose.models.UserChat || mongoose.model<IUserChat>("UserChat", UserChatSchema);
