import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | FinStocks - AI-Powered Portfolio Intelligence",
  description: "Sign in to your FinStocks account for AI-powered portfolio insights",
};

export default function SignIn() {
  return <SignInForm />;
}
