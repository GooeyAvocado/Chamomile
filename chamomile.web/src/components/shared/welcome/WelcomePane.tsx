import ChamomileLogo from "../ChamomileLogo";

export default function WelcomePane(){
    return <div style={{height:"100%", display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
        <ChamomileLogo/>
        <hr style={{maxWidth:"100%", width:'500px'}}/>
        <div style={{fontFamily:'Merriweather'}}>Welcome to Camomile!</div>
        <div style={{fontSize:'.8em'}}>
            Brew an image to get started
        </div>
    </div>
}