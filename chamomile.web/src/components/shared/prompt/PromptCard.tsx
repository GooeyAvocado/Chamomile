import { Card, CardActionArea, Typography } from "@mui/material";
import { Prompt } from "../../../model/Prompt";
import { imageUrl } from "../../../api/Images";

export default function PromptCard(props: {
    prompt: Prompt
    onClick?: () => void
}) {

    const { prompt, onClick } = props

    return <Card>
        <CardActionArea onClick={onClick}>
            <div style={{ display: 'flex', gap: "20px", padding:"20px", alignItems:'center' }}>
                <img
                    src={prompt.sampleImage ? imageUrl(prompt.sampleImage) : '/outline.png'}
                    style={{ width: "96px", maxWidth:'10vw', height: '96px', maxHeight:'10vw', objectFit: 'cover', objectPosition: 'center top' }}
                />
                <Typography>
                    <div><b>{prompt.name}</b></div>
                    <Typography sx={{
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        fontSize:'.7em',
                        fontFamily:'monospace'
                    }}>{prompt.positivePrompt}</Typography>
                </Typography>

            </div>
        </CardActionArea>
    </Card>

}