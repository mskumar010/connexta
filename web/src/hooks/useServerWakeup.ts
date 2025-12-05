import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useServerWakeup = () => {
  const [isWakingUp, setIsWakingUp] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const wakeUp = async () => {
      let retries = 0;
      // Free tier servers can take up to 30-50s to wake up
      const maxRetries = 30; // ~60 seconds

      while (retries < maxRetries) {
        try {
          const res = await fetch(`${API_URL}/health`);
          if (res.ok) {
            setIsWakingUp(false);
            return;
          }
        } catch (e) {
          console.log(
            `Server wake-up attempt ${
              retries + 1
            }/${maxRetries} failed, retrying...`
          );
        }

        // Wait 2 seconds before next retry
        await new Promise((r) => setTimeout(r, 2000));
        retries++;
      }

      setIsError(true);
      setIsWakingUp(false);
    };

    wakeUp();
  }, []);

  return { isWakingUp, isError };
};
