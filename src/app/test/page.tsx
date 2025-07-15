import { AuthTest } from '@/components/debug/AuthTest';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Auth Test Page</h1>
        <AuthTest />
      </div>
    </div>
  );
}
