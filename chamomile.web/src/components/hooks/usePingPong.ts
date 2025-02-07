import { useContext } from "react";
import { PingPongContext, PingPongContextType } from "../contexts/PingPongContext";

export const usePingPong = () => {
  const context = useContext(PingPongContext);
  if (!context) { throw new Error('AAAA!'); }
  return context as PingPongContextType;
};