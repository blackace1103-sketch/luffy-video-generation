"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      const response = await fetch("http://localhost:8000/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (response.ok && data.video_url) {
        setVideoUrl(data.video_url);
      } else {
        setError(data.detail || "Failed to generate video.");
      }
    } catch (err) {
      setError("Server connection failed. Make sure FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">AI Video Generator</h1>
        <p className="text-slate-400">Transform your text prompt into an AI-rendered video clip.</p>

        <div className="flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A cinematic shot of a neon cybernetic cat running through a rain-slicked city..."
            className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-500 min-h-[120px]"
          />

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-3 px-6 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Generating Video (this may take 1-2 mins)..." : "Generate Video"}
          </button>
        </div>

        {error && <div className="p-4 bg-red-900/40 border border-red-500 rounded-xl text-red-200">{error}</div>}

        {videoUrl && (
          <div className="mt-6 space-y-3">
            <h2 className="text-xl font-semibold">Result:</h2>
            <video controls src={videoUrl} className="w-full rounded-xl border border-slate-700 shadow-2xl" />
          </div>
        )}
      </div>
    </main>
  );
}
Add Next.js main page UI component
