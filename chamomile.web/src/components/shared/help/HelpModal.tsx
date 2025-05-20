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
    const { width } = useWindowDimensions();

    return <TabbedModal
        open={open} setOpen={setOpen}
        maxWidth="md" fullWidth
    >
        {width > 450 && <TabbedModalTitle>Help and About</TabbedModalTitle>}
        <TabbedModalTabContent label="Help" style={{
            height: "75vh",
            display: 'flex', gap: '10px'
        }}>

            <HelpTab setOpen={setOpen} />
        </TabbedModalTabContent>
        <TabbedModalTabContent label="About" style={{
            height: "75vh",
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
        }}>
            <AboutTab />


        </TabbedModalTabContent>
        <TabbedModalActions>
            <Button onClick={() => { setOpen(false) }}>OK</Button>
        </TabbedModalActions>
    </TabbedModal>

}