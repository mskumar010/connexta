import { AppRouter } from "@/router";
import { useServerWakeup } from "@/hooks/useServerWakeup";

/**
 * App Component - Only handles routing
 * All layout and content logic is in router.tsx and page components
 */
function App() {
  const { isWakingUp, isError } = useServerWakeup();

  return (
    <>
      <AppRouter />

      {/* Non-blocking Server Status Indicators */}
      {(isWakingUp || isError) && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {isWakingUp && (
            <div className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5">
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <div>
                <p className="text-sm font-medium">Connecting to Server...</p>
                <p className="text-xs opacity-80">Waking up backend...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="bg-red-600/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 pointer-events-auto">
              <div>
                <p className="text-sm font-medium">Connection Failed</p>
                <p className="text-xs opacity-80">Server unreachable</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
