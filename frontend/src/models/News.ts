import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserNews extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  stocks: {
    symbol: string;
    headlines: string[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserNewsSchema = new Schema<IUserNews>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    stocks: [
      {
        symbol: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        headlines: [
          {
            type: String,
            trim: true,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserNewsSchema.index({ userId: 1 });

export const UserNews: Model<IUserNews> =
  mongoose.models.UserNews || mongoose.model<IUserNews>("UserNews", UserNewsSchema);
