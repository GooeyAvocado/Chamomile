import { useContext } from "react";
import { CheckpointContext, CheckpointContextType } from "../contexts/CheckpointsContext";


export const useCheckpoints = () => {
    const context = useContext(CheckpointContext);
    if (!context) { throw new Error('AAAA!'); }
    return context as CheckpointContextType;
};