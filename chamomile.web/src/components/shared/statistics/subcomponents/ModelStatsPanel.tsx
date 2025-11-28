import { FilterOptions } from "../../../../model/FilterOptions"
import KeywordUsage from "../../../../model/KeywordUsage"
import KeywordUsageDatedResult from "../../../../model/KeywordUsageDatedResult"
import { Model, ModelType } from "../../../../model/Model"
import ModelTypePill from "../../model/ModelType/ModelTypePill"
import { StatsPanel } from "./StatsPanel"

export default function ModelStatsPanel({
    getDatedUsageApi, data, availability, isAvailable, modelType, filter, limit, models
}: {
    getDatedUsageApi: (
        setLoading: (value: boolean) => void,
        setItem: (value?: KeywordUsageDatedResult) => void,
        onError: (value?: any) => void,
        ...args: any
    ) => void
    data: KeywordUsage[]
    availability: -1 | 0 | 1
    isAvailable: (modelId: string) => boolean
    modelType?: ModelType,
    filter: FilterOptions,
    limit: number,
    models?: Model[]
}) {
    return <StatsPanel
        datedUsageApi={getDatedUsageApi} minAutoCompleteLength={0}
        usage={availability === 0 ? data : availability === 1
            ? data?.filter(a => isAvailable(a.keyword))
            : data?.filter(a => !isAvailable(a.keyword))}
        filter={filter} keywordColumnOverride={modelType} limit={limit}
        getSampleImageId={(u) => models?.find(a => a.id === u.keyword)?.bannerImage}
        renderKeywordRow={(u) => {
            const m = models?.find(a => a.id === u.keyword) ?? {
                name: u.keyword, id: u.keyword, isAvailable: false, type: ""
            }
            return <div style={{ color: m.isAvailable ? "white" : "#DDD", fontSize: ".8em" }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {m?.type?.length > 0 && <ModelTypePill type={m?.type} style={{ flexShrink: "0" }} />}
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end' }}>
                        <b>{m.name}</b>
                    </div>
                </div>
                <div style={{ fontSize: ".8em" }}>{`${m.id}${m.isAvailable ? "" : " (Unavailable)"}`}</div>
            </div>
        }}
    />
}