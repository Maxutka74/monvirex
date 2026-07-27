import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import type { UserSnapshot } from "../../../features/wallet/api/walletApi.ts";

type Props = {
    history: UserSnapshot[];
};

const PortfolioHistoryChart = ({ history }: Props) => {
    const chartData = history.map((data) => ({
        date: new Date(data.created_at).getDate(),
        totalValue: Number(data.total_value),
        walletBalance: Number(data.wallet_balance),
    }));

    const totalSum = chartData.reduce((sum, item) => sum + (item.totalValue + item.walletBalance), 0)

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
                : <div className='w-full h-full flex items-center justify-center'>
                    <p className="text-[18px] sm:text-xl text-gray-600 text-center">The chart will appear after your first transaction</p>
                </div>
            }
        </div>
    );
};

export default PortfolioHistoryChart;