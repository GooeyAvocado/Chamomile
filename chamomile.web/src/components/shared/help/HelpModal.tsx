import { Button } from "@mui/material"
import TabbedModal from "../modals/TabbedModal/TabbedModal"
import TabbedModalActions from "../modals/TabbedModal/TabbedModalActions"
import TabbedModalTabContent from "../modals/TabbedModal/TabbedModalTabContent"
import TabbedModalTitle from "../modals/TabbedModal/TabbedModalTitle"
import AboutTab from "./subcomponents/AboutTab"
import HelpTab from "./subcomponents/HelpTab"
import { useWindowDimensions } from "../../hooks/useWindowDimensions"

export default function HelpModal(props: {
    open: boolean,
    setOpen: (val: boolean) => void
}) {

    const { open, setOpen } = props
    const { width, height } = useWindowDimensions();

    const minAboutHeight = 636

    return <TabbedModal
        open={open} setOpen={setOpen}
        maxWidth="md" fullWidth
        contentStyle={{ overflowY: "hidden" }}
    >
        {width > 450 && <TabbedModalTitle>Help and About</TabbedModalTitle>}
        <TabbedModalTabContent label="Help">
            <HelpTab setOpen={setOpen} height={`${height - 200}px`} />
        </TabbedModalTabContent>
        <TabbedModalTabContent label="About" style={{
            height: `${height - 200}px`, overflowY: "auto",
            display: 'flex', flexDirection: 'column',
            justifyContent: height > minAboutHeight ? 'center' : undefined, alignItems: "center",
        }}>
            <AboutTab />


        </TabbedModalTabContent>
        <TabbedModalActions>
            <Button onClick={() => { setOpen(false) }}>OK</Button>
        </TabbedModalActions>
    </TabbedModal>

}