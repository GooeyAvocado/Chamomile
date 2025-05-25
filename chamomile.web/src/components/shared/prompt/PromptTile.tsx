import { Card, CardActionArea, Typography } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { imageUrl } from "../../../api/Images";

export default function PromptTile(props: {
    prompt: Prompt
    onClick: () => void
}) {

    const { prompt, onClick } = props

    return <Card>
        <CardActionArea onClick={onClick}>
            <div style={{ alignItems: 'center', position: 'relative' }}>
                <img
                    src={prompt.sampleImage ? imageUrl(prompt.sampleImage) : '/outline.png'}
                    style={{ maxWidth: '100%', aspectRatio: 1 / 1, objectFit: 'cover', objectPosition: 'center top' }}
                />
                <div style={{ bottom: '0px', left: '0px', padding: "2px", position: 'absolute', width: '100%', backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <Typography sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 1,
                        fontSize: '.8em',
                    }}>{prompt.name?.split("/").at(-1)}</Typography>
                </div>
            </div>
        </CardActionArea>
    </Card>

}