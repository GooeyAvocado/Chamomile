import { useEffect } from "react";

const usePolling = (callback: () => void, interval: number, active: boolean) => {
  useEffect(() => {
    if (!active) return; // Don't start polling if there's no active job

    const intervalId = setInterval(() => {
      callback();
    }, interval);

    return () => clearInterval(intervalId); // Cleanup when job completes
  }, [callback, interval, active]);
};

export default usePolling;
