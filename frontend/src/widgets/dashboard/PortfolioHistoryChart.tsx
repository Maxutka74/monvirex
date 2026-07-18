import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import type { UserSnapshot } from "../../features/wallet/api/walletApi.ts";

type Props = {
    history: UserSnapshot[];
};

const PortfolioHistoryChart = ({ history }: Props) => {
    const chartData = history.map((data) => ({
        date: new Date(data.created_at).getDate(),
        totalValue: Number(data.total_value),
        walletBalance: Number(data.wallet_balance),
    }));

    return (
        <div className="w-full h-[220px] sm:h-[260px] lg:h-full">
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
                        stroke="#D6DCE5"
                    />

                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value}`}
                    />

                    <Tooltip />

                    <Line
                        dataKey="walletBalance"
                        type="monotone"
                        stroke="#9CA3AF"
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
        </div>
    );
};

export default PortfolioHistoryChart;