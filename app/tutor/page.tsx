import React from 'react';

export default function TutorPage() {
  return (
    <main className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">Realtime Tutor</h1>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          
          {/* Left side: Student's content area */}
          <div className="flex-grow bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Student Workspace</h2>
            <p className="text-gray-600">
              This is where the student's content, like a code editor or a problem set, would be displayed.
            </p>
          </div>

          {/* Right side: Embedded AI Tutor */}
          <div className="w-full md:w-96 lg:w-1/4">
            <iframe
              src="/embed"
              className="w-full h-full border-0 rounded-lg shadow-lg min-h-[500px]"
              allow="camera; microphone; autoplay; display-capture"
              title="AI Tutor"
            ></iframe>
          </div>

        </div>
      </div>
    </main>
  );
}
