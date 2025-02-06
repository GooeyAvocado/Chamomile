import { useEffect, useCallback } from "react";
import signalRService from "../services/SignalRService";

type SignalRHandler = (...args: any[]) => void;

const useSignalR = (eventName: string, handler: SignalRHandler) => {
  // Wrap handler in useCallback to prevent unnecessary re-subscriptions
  const stableHandler = useCallback(handler, []);

  useEffect(() => {
    signalRService.startConnection().then(() => {
      signalRService.subscribe(eventName, stableHandler);
    });

    return () => {
      signalRService.unsubscribe(eventName, stableHandler);
    };
  }, [eventName, stableHandler]);
};

export default useSignalR;
