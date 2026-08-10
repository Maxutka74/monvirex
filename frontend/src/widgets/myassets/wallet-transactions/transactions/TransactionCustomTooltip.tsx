import type {TooltipProps} from "recharts";


const TransactionCustomTooltip = ({ active, payload }: TooltipProps<number, string> & {payload?: any[]}) => {
    if (!active || !payload?.length) return null;

    const asset = payload[0].payload;

    return (
        <div className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 shadow-xl z-50">
            <div className="mb-3 flex items-center gap-2">
                <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: asset.fill }}
                />

                <span className="font-semibold text-white">
                    {asset.name}
                </span>
            </div>

            <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-6">
                    <span className="text-slate-400">Value</span>

                    <span className="text-white">
                        ${asset.value.toFixed(2)}
                    </span>
                </div>

                <div className="flex justify-between gap-6">
                    <span className="text-slate-400">Allocation</span>

                    <span className="text-white">
                        {asset.percent.toFixed(2)}%
                    </span>
                </div>
            </div>
        </div>
    );
}

export default TransactionCustomTooltip