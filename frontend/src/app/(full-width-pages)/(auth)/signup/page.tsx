import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | FinStocks - AI-Powered Portfolio Intelligence",
  description: "Create your FinStocks account for AI-powered portfolio insights",
};

export default function SignUp() {
  return <SignUpForm />;
}
