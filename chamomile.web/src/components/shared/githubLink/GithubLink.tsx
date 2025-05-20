import { GitHub } from "@mui/icons-material"
import { Link } from "@mui/material"

export default function GithubLink(props: {
    href?: string
    children?: string
}) {

    return <span style={{ display: 'inline-flex', gap: "4px", alignItems: 'center', verticalAlign: 'middle', marginLeft: '5px' }}>
        <GitHub fontSize="small" />
        <Link href={props.href}>{props.children}</Link>
    </span>

}