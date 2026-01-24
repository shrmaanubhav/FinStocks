import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// TypeScript interface for UserProfile (onboarding data)
export interface IUserProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Personal Information (Slide 1)
  name: string;
  age: number;
  phone: string;
  address: string;
  
  // Financial Information (Slide 2)
  incomeRange: string;
  expenditureRange: string;
  maritalStatus: string;
  children: number;
  
  // Investor Profile (Slide 3)
  jobType?: string;
  job?: string;
  monthlyIncome?: number | null;
  sideIncome?: number | null;
  investmentGoal?: string;
  investmentDuration?: string;
  riskPreference?: number | null;
  investingYears?: number | null;
  retirementAge?: number | null;
  stocks?: string[];

  // Investment Information (Slide 4)
  holdings: {
    symbol: string;
    quantity: number;
    source: "manual" | "pdf_upload";
  }[];
  lifestyle: string;
  
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// UserProfile Schema (Onboarding Data)
const UserProfileSchema = new Schema<IUserProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    
    // Personal Information (Slide 1)
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: 18,
      max: 120,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    
    // Financial Information (Slide 2)
    incomeRange: {
      type: String,
      required: [true, "Income range is required"],
      enum: ["0-3L", "3L-6L", "6L-10L", "10L-20L", "20L-50L", "50L+"],
    },
    expenditureRange: {
      type: String,
      required: [true, "Expenditure range is required"],
      enum: ["0-2L", "2L-4L", "4L-8L", "8L-15L", "15L-30L", "30L+"],
    },
    maritalStatus: {
      type: String,
      required: [true, "Marital status is required"],
      enum: ["single", "married", "divorced", "widowed"],
    },
    children: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    
    // Investor Profile (Slide 3)
    jobType: {
      type: String,
      enum: ["private", "government", "semi private", "non profit", "business", ""],
      default: "",
      trim: true,
    },
    job: {
      type: String,
      trim: true,
      default: "",
    },
    monthlyIncome: {
      type: Number,
      min: 0,
      default: null,
    },
    sideIncome: {
      type: Number,
      min: 0,
      default: null,
    },
    investmentGoal: {
      type: String,
      trim: true,
      default: "",
    },
    investmentDuration: {
      type: String,
      trim: true,
      default: "",
    },
    riskPreference: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    investingYears: {
      type: Number,
      min: 0,
      default: null,
    },
    retirementAge: {
      type: Number,
      min: 0,
      default: null,
    },
    stocks: [
      {
        type: String,
        trim: true,
        uppercase: true,
      },
    ],

    // Investment Information (Slide 4)
    holdings: [
      {
        symbol: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        source: {
          type: String,
          enum: ["manual", "pdf_upload"],
          default: "manual",
        },
      },
    ],
    lifestyle: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
UserSchema.index({ email: 1 });
UserProfileSchema.index({ userId: 1 });

// Get or create models
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export const UserProfile: Model<IUserProfile> =
  mongoose.models.UserProfile || mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
