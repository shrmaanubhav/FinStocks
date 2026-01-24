import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding/Info */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-linear-to-br from-brand-500 to-brand-600">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
            <p className="text-brand-100 text-lg">
              Sign in to access your dashboard and manage your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-brand-500 hover:bg-brand-600 text-white',
              card: 'shadow-none bg-transparent',
              headerTitle: 'text-2xl font-semibold text-gray-800 dark:text-white/90',
              headerSubtitle: 'text-gray-500 dark:text-gray-400',
              formFieldInput: 'border-gray-200 dark:border-gray-800 focus:border-brand-500',
              formFieldLabel: 'text-gray-700 dark:text-gray-300',
              footerActionLink: 'text-brand-500 hover:text-brand-600',
              socialButtonsBlockButton: 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800',
              dividerLine: 'bg-gray-200 dark:bg-gray-800',
              dividerText: 'text-gray-500 dark:text-gray-400',
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
            },
          }}
          routing="path"
          path="/sign-in"
          redirectUrl="/"
        />
      </div>
    </div>
  );
}