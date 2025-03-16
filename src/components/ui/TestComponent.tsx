"use client";

export default function TestComponent() {
  return (
    <div className="p-4 m-4 bg-blue-500 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-2">Test Component</h2>
      <p className="text-sm">This is a test component to verify Tailwind CSS is working.</p>
      <button className="mt-4 px-4 py-2 bg-white text-blue-500 rounded hover:bg-blue-100 transition-colors">
        Test Button
      </button>
    </div>
  );
} 