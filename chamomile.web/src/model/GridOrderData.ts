import PromptOrderData from "./PromptOrderData";

export default interface GridData extends PromptOrderData {
    gridId: number;
    xPos: number;
    yPos: number;
    xVal: string;
    yVal: string;
}