import { createContext, useEffect, useState } from "react";

export class Dimensions {
    public constructor(
        public width: number,
        public height: number,
        public vertical: boolean,
        public maxComponentHeight: number
    ) { }
}

export const DimensionsContext = createContext<Dimensions | undefined>(undefined)

function getWindowDimensions(): Dimensions {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width, height, vertical: width <= 850, maxComponentHeight: height - 120
    }
}

export default function DimensionsProvider(props: { children: any }) {

    const [dims, setDims] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() { setDims(getWindowDimensions) }
        window.addEventListener('resize', handleResize);
    }, [])

    return <DimensionsContext.Provider value={dims}>
        {props.children}
    </DimensionsContext.Provider>
}