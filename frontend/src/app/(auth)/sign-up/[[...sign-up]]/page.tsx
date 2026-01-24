import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding/Info */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 bg-linear-to-br from-brand-500 to-brand-600">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Join Us Today</h1>
            <p className="text-brand-100 text-lg">
              Create your account and start managing your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <SignUp
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
          path="/sign-up"
          redirectUrl="/"
        />
      </div>
    </div>
  );
}