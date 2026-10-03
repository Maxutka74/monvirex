import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import type { UserSnapshot } from "../../../../features/wallet/api/walletApi.ts";
import {useStore} from "zustand/react";
import themeStore from "../../../../entities/theme/themeStore.tsx";
import PortfolioHistoryCustomTooltip from "./PortfolioHistoryCustomTooltip.tsx";
import {formatNumber} from "../../../../shared/utils/formatNumber.ts";
import {memo, useMemo} from "react";

type Props = {
    history: UserSnapshot[];
};

const PortfolioHistoryChart = ({ history }: Props) => {
    const theme = useStore(themeStore, (state) => state.theme);

    const {chartData, totalSum} = useMemo(() => {
        const chartData = history.map((data) => ({
            date: Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: '2-digit'
            }).format(new Date(data.created_at)),
            totalValue: Number(data.total_value),
            walletBalance: Number(data.wallet_balance),
        }));

        const totalSum = chartData.reduce((sum, item) => sum + (item.totalValue + item.walletBalance), 0)

        return {chartData, totalSum};
    }, [history])

    return (
        <div className="w-full h-[220px] sm:h-[260px] lg:h-full">
            {totalSum > 0?
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <LineChart
                        data={chartData}
                        accessibilityLayer={false}
                    >
                        <CartesianGrid
                            strokeDasharray="6 6"
                            vertical={false}
                            stroke={theme === "dark" ? "#252525" : "#D6DCE5"}
                        />

                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fill: theme === "dark" ? "#A7B0C3" : "#666D80",
                            }}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `$${formatNumber(value)}`}
                            tick={{
                                fill: theme === "dark" ? "#A7B0C3" : "#666D80",
                            }}
                        />

                        <Tooltip
                            content={<PortfolioHistoryCustomTooltip />}
                        />

                        <Line
                            dataKey="walletBalance"
                            type="monotone"
                            stroke={theme === "dark" ? "#6B7280" : "#9CA3AF"}
                            strokeWidth={3}
                            dot={false}
                        />

                        <Line
                            dataKey="totalValue"
                            type="monotone"
                            stroke="#429EFF"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
                : <div className='w-full h-full flex items-center justify-center'>
                    <p className={`
                        text-[18px] sm:text-xl text-center
                        ${theme === "dark" ? "text-[#A7B0C3]" : "text-gray-600"}
                    `}>
                        The chart will appear after your first transaction
                    </p>
                </div>
            }
        </div>
    );
};

export default memo(PortfolioHistoryChart);