import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh grid place-items-center p-10">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-semibold">Realtime Tutor</h1>
        <p className="text-neutral-600">Share your screen, ask questions, get step-by-step help.</p>
        <Link
          href="/tutor"
          className="inline-block rounded-md border px-4 py-2 hover:bg-black/5"
        >
          Open Tutor
        </Link>
      </div>
    </main>
  );
}
