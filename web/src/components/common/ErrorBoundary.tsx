import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw, Copy, Check } from "lucide-react";
import { useState } from "react";

export function ErrorBoundary() {
  const error = useRouteError();
  const [copied, setCopied] = useState(false);

  let errorMessage: string;
  let errorStack: string | undefined;

  if (isRouteErrorResponse(error)) {
    // 404, 401, etc.
    errorMessage =
      error.status === 404
        ? "This page doesn't exist!"
        : error.statusText || "An unexpected error occurred.";
  } else if (error instanceof Error) {
    // JS Errors (crashes)
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    errorMessage = "Unknown error";
    errorStack = JSON.stringify(error, null, 2);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`${errorMessage}\n\n${errorStack || ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-bg-primary)] text-white p-4">
      <div className="bg-[var(--color-bg-secondary)] p-8 rounded-2xl shadow-2xl border border-white/5 max-w-lg w-full text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
          <AlertTriangle className="text-red-500" size={32} />
        </div>

        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-6 text-sm">
          We encountered an unexpected issue. Please try refreshing or go back
          home.
        </p>

        {/* Error Details Box */}
        <div className="bg-black/30 rounded-lg p-4 mb-6 text-left border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-red-400 uppercase tracking-wider">
              Error Details
            </span>
            <button
              onClick={handleCopy}
              className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors"
            >
              {copied ? (
                <Check size={12} className="text-green-500" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-sm font-mono text-white break-words">
            {errorMessage}
          </p>
          {errorStack && (
            <details className="mt-2 text-xs text-gray-500 font-mono">
              <summary className="cursor-pointer hover:text-gray-300 transition-colors">
                Stack Trace
              </summary>
              <pre className="mt-2 whitespace-pre-wrap overflow-x-auto p-2 bg-black/20 rounded">
                {errorStack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-bg-tertiary)] hover:bg-white/10 text-white rounded-xl transition-all font-medium border border-white/5"
          >
            <RefreshCw size={18} />
            Reload
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white rounded-xl transition-all font-medium shadow-lg shadow-[var(--color-brand-primary)]/20"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
