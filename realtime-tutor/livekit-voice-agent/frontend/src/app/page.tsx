export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center p-10">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-semibold">Realtime Tutor</h1>
        <p className="text-neutral-600">Share your screen, ask questions, get step-by-step help.</p>
        <a href="/tutor" className="inline-block px-4 py-2 rounded bg-black text-white">Open Tutor</a>
      </div>
    </main>
  );
}
