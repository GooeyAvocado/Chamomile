import ChamomileLogo from "../ChamomileLogo";

export default function WelcomePane() {
    return <div style={{ height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <ChamomileLogo wordsOverride="Welcome to Chamomile" vertical />
        <hr style={{ maxWidth: "100%", width: '500px' }} />
        <div style={{ fontSize: '.8em' }}>
            Brew an image to get started, or review the help section if you're unable to brew
        </div>
    </div>
}