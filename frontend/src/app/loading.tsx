export default function Loading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative z-10 text-center">
        <div className="text-2xl font-bold text-white mb-4">
          Loading...
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}