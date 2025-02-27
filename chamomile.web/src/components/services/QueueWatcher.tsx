import { ReactNode, useEffect, useState } from "react";
import { useQueue } from "../hooks/useQueue";

export default function QueueWatcher(props:{children:ReactNode}){
    
    const imageGenerated = () => {
        new Audio("/sounds/imageDone.mp3").play()
    }

    const [warned, setWarned] = useState(true)
    const {queue} = useQueue(imageGenerated,false);


    const onQueueChange = () => {
        if(queue.length > 3 && warned){
            setWarned(false);
        }
        if(queue.length===0 && !warned){
            setWarned(true)
            new Audio("/sounds/queueDone.ogg").play()
            new Notification("Queue nearly complete!", {
                body: "All your images will finish generating soon!",
                silent:true,
              });    
        }
    }

    useEffect(()=>{
        Notification.requestPermission()
    },[])

    useEffect(onQueueChange,[queue])

    return props.children

}