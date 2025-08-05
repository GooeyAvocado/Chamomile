import { ReactNode, useEffect, useState } from "react";
import { useQueue } from "../hooks/useQueue";
import { useSettings } from "../hooks/useSettings";

export default function QueueWatcher(props: { children: ReactNode }) {

    const imageGenerated = () => {
        if (settings.enableSound) new Audio("/sounds/imageDone.mp3").play()
    }

    const [warned, setWarned] = useState(true)
    const { queue } = useQueue(imageGenerated);
    const { settings } = useSettings();


    const onQueueChange = () => {
        if (queue.length > 3 && warned) {
            setWarned(false);
        }
        if (queue.length === 0 && !warned) {
            setWarned(true)
            if (settings.enableSound) new Audio("/sounds/queueDone.ogg").play()
            new Notification("Queue nearly complete!", {
                body: "All your images will finish generating soon!",
                silent: true,
            });
        }
    }

    useEffect(() => {
        Notification.requestPermission()
    }, [])

    useEffect(onQueueChange, [queue])

    return props.children

}