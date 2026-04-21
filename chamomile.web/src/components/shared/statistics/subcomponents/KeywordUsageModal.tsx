import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import KeywordUsage from "../../../../model/KeywordUsage"
import { StatisticOptions } from "./StatSelector"
import ImageTileFromID from "../../images/ImageTileFromID"

export default function KeywordUsageModal({
    open, setOpen, data, renderImageTile, renderKeywordRow, getSampleImageId
}: {
    open: boolean
    setOpen: (val: boolean) => void
    data?: KeywordUsage
    renderImageTile?: (usage: KeywordUsage) => React.ReactNode
    renderKeywordRow?: (usage: KeywordUsage) => React.ReactNode
    getSampleImageId?: (usage: KeywordUsage) => number | undefined
}) {

    if (!data) return <></>


    return <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: "2px solid #FFF", paddingBottom: "16px" }}>
                <div style={{ display: 'flex', gap: "10px" }}>
                    <div>
                        {renderImageTile ? renderImageTile(data) : <ImageTileFromID image={getSampleImageId ? getSampleImageId(data) : data.sample} style={{ width: "48px" }} />}
                    </div>
                    <div>
                        {renderKeywordRow ? renderKeywordRow(data) : data.keyword}
                    </div>
                </div>
                <div style={{ fontSize: '.8em', fontWeight: 'normal' }}>
                    {data.totalCount.toLocaleString()} generations
                </div>
            </div>
        </DialogTitle>
        <DialogContent>
            <div style={{ display: 'flex', gap: "12px", flexDirection: 'column', marginBottom: "16px" }}>
                <RateBar label="Success Rate" rate={data.successRate} color={StatisticOptions.SUCCESS_RATE.color} />
                <RateBar label="Downloaded" rate={data.downloadRate} color={StatisticOptions.DOWNLOAD_RATE.brightColor} />
                <RateBar label="Favorited" rate={data.favoriteRate} color={StatisticOptions.FAVORITE_RATE.brightColor} />
                <RateBar label="Upscaled" rate={data.upscaleRate} color={StatisticOptions.UPSCALE_RATE.brightColor} />
            </div>
            <hr />
            <TableContainer>
                <Table>
                    <TableBody sx={{ width: "100%" }} >
                        <TableRow sx={{ width: "100%" }}>
                            <TableCell>Total generated images</TableCell>
                            <TableCell align="right">{data.totalCount.toLocaleString()}</TableCell>
                            <TableCell>Downloaded Images</TableCell>
                            <TableCell align="right">{data.downloadCount.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Existing images</TableCell>
                            <TableCell align="right">{data.count.toLocaleString()}</TableCell>
                            <TableCell>Favorite Images</TableCell>
                            <TableCell align="right">{data.favoriteCount.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Deleted images</TableCell>
                            <TableCell align="right">{data.deletedCount.toLocaleString()}</TableCell>
                            <TableCell>Upscaled Images</TableCell>
                            <TableCell align="right">{data.upscaleCount.toLocaleString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>OK</Button>
        </DialogActions>
    </Dialog>
}

function RateBar({ label, rate, color }: { label: string; rate: number; color: string }) {
    return <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "4px" }}>
            <div>{label} </div>
            <div style={{ fontSize: ".8em" }}>{(rate * 100).toFixed(2)}%</div>
        </div>
        <div style={{ background: "#555", height: "32px" }}>
            <div style={{ background: color, height: "32px", width: `${rate * 100}%` }} />
        </div>
    </div>
}