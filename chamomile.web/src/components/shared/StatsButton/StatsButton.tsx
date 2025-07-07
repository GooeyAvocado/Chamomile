import { BarChart } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import StatisticsModal from "../statistics/StatisticsModal";
import { FilterOptions } from "../../../model/FilterOptions";

export default function StatsButton({ filter }: {
    filter: FilterOptions
}) {

    const [statsOpen, setStatsOpen] = useState(false)

    return <>
        <Tooltip title={"Statistics"}>
            <IconButton onClick={() => setStatsOpen(true)}><BarChart /></IconButton>
        </Tooltip>
        <StatisticsModal open={statsOpen} setOpen={setStatsOpen} filter={filter} />
    </>
}