import { useContext } from "react";
import { Dimensions, DimensionsContext } from "../contexts/DimensionsContext";

export const useWindowDimensions = () => {
  const context = useContext(DimensionsContext);
  if (!context) { throw new Error('AAAA!'); }
  return context as Dimensions;
};