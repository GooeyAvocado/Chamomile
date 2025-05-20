import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function AdvSearchHelp() {
    return <>
        <p>
            Advanced search lets you dig deeper with your generated images. In order to leverage it, you must write your query in the TsQuery format.
            TsQuery is a powerful syntax for filtering and searching data. Below is a table of common TsQuery syntax elements:
        </p>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Meaning</TableCell>
                    <TableCell>Example</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>&</TableCell>
                    <TableCell>AND</TableCell>
                    <TableCell>apple & banana</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>|</TableCell>
                    <TableCell>OR</TableCell>
                    <TableCell>apple | banana</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>!</TableCell>
                    <TableCell>NOT</TableCell>
                    <TableCell>!apple</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>()</TableCell>
                    <TableCell>Grouping</TableCell>
                    <TableCell>(apple & banana) | orange</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>:*</TableCell>
                    <TableCell>Prefix Match</TableCell>
                    <TableCell>app:*</TableCell>
                </TableRow>
            </TableBody>
        </Table>
        <p>Chamomile will assume your query is an Advanced Search if your query contains "&", "|", "!", ":", {'"<"'}, or quotes. Avoid this if you'd just want a simple search</p>
    </>
}