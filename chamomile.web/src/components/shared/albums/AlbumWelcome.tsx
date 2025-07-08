export default function AlbumWelcome() {
    return <div style={{ height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/colorcollection-crop.png" style={{ width: "128px", margin: "16px" }} />
        <hr style={{ maxWidth: "100%", width: '500px' }} />
        <div style={{ fontFamily: 'Merriweather' }}>This collection is empty</div>
        <div style={{ fontSize: '.8em', width: "450px", maxWidth: "100%", marginTop: "10px", textAlign: 'center' }}>
            You can add images manually when viewing them, or set up a search that'll automatically add newly generated images.
        </div>
    </div>
}