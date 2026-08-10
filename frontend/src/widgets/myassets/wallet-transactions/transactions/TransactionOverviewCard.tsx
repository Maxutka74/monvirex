import type {UserSummary} from "../../../../features/wallet/api/walletApi.ts";
import {RadialBar, RadialBarChart, ResponsiveContainer, Tooltip} from "recharts";
import TransactionCustomTooltip from "./TransactionCustomTooltip.tsx";

type TransactionOverviewChartProps = {
    data: UserSummary | null,
    currentPeriodVolume: number
}

const TransactionOverviewCard = ({data, currentPeriodVolume}: TransactionOverviewChartProps) => {
    const chartData = [
        { name: "Deposit", value: Number(data?.deposit), percent: currentPeriodVolume > 0? Number(data?.deposit) / currentPeriodVolume * 100: 0, fill: "#22C55E" },
        { name: "Withdraw", value: Number(data?.withdraw), percent: currentPeriodVolume > 0? Number(data?.withdraw) / currentPeriodVolume * 100: 0, fill: "#F97316" },
        { name: "Buy", value: Number(data?.buy), percent: currentPeriodVolume > 0? Number(data?.buy) / currentPeriodVolume * 100: 0, fill: "#3B82F6" },
        { name: "Sell", value: Number(data?.sell), percent: currentPeriodVolume > 0? Number(data?.sell) / currentPeriodVolume * 100: 0, fill: "#8B5CF6" },
        { name: "Exchange", value: Number(data?.exchange), percent: currentPeriodVolume > 0? Number(data?.exchange) / currentPeriodVolume * 100: 0, fill: "#94A3B8" }
    ];

    const total = chartData.reduce(
        (sum, item) => sum + item.value, 0
    )

    const displayData =
        total > 0
            ? chartData
            : [
                {name: 'No activity' , value: 1, percent: 0, fill: "#E5E7EB"}
            ]

    return (
        <div className='w-full flex flex-col sm:flex-row items-center justify-center gap-1'>
            <div className='flex-1 w-full'>
                <ResponsiveContainer width='100%' height={window.innerHeight < 640? 160: 260}>
                    <RadialBarChart
                    cx='50%'
                    cy='50%'
                    innerRadius='65%'
                    outerRadius='100%'
                    startAngle={180}
                    endAngle={0}
                    data={displayData}
                    >
                        <RadialBar dataKey='value' cornerRadius={10} />
                        <Tooltip content={<TransactionCustomTooltip />} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
            <div className='w-full flex-1 justify-between'>
                <ul className='flex flex-col gap-5'>
                    {chartData.map((item) => (
                        <li key={item.name}>
                            <div>
                                <div className='flex flex-row justify-between'>
                                        <div className='flex flex-row items-center justify-center gap-3'>
                                        <div className='w-[15px] h-[15px] rounded-full' style={{backgroundColor: item.fill}} />
                                        <h4 className='text-black text-[18px]'>{item.name}</h4>
                                        </div>
                                        <div className='flex flex-row'>
                                            <p className='text-black'>${item.value.toFixed(1)}</p>
                                        </div>
                                    </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default TransactionOverviewCard