import { AppRouter } from "@/router";
import { useServerWakeup } from "@/hooks/useServerWakeup";

/**
 * App Component - Only handles routing
 * All layout and content logic is in router.tsx and page components
 */
function App() {
  const { isWakingUp, isError } = useServerWakeup();

  if (isWakingUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <h2 className="text-xl font-semibold">Connecting to Server...</h2>
          <p className="text-muted-foreground text-sm">
            Waking up free tier instance (may take ~60s)
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-destructive/10 text-destructive">
        <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
        <p className="mb-4">Could not reach the server.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return <AppRouter />;
}

export default App;
