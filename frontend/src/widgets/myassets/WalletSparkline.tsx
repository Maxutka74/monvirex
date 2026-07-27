import {Cell, Pie, PieChart, Tooltip} from "recharts";
import WalletCustomTooltip from "./WalletCustomTooltip.tsx";

type SparklineData = {
    name: string,
    value: number,
    amount: number,
    percentage: number,
}

type WalletSparklineProps = {
    data: SparklineData[],
    totalValue: number,
    COLORS: string[]
}

const WalletSparkline = ({data, totalValue, COLORS}: WalletSparklineProps) => {
    const clearData = data.map(item => ({
        name: item.name,
        value: item.value,
        amount: item.amount,
        percent: item.percentage
    })).filter(item => Number(item.value) > 0)

    const total = clearData.reduce(
        (sum, item) => sum + item.value, 0
    )

    const displayData =
        total > 0
            ? clearData
            : [
                {name: 'No activity' , value: 1, percent: 0, amount: 0, fill: "#E5E7EB", isPlaceholder: true}
            ]

    return (
        <div className='relative w-[250px] h-[250px] '>
            <PieChart width={250} height={250} style={{overflow: 'visible'}}>
                <Pie
                    data={displayData}
                    dataKey='value'
                    nameKey='name'
                    innerRadius={68}
                    outerRadius={98}
                    stroke="#D7E8FF"
                    strokeOpacity={0.55}
                >
                    {clearData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                </Pie>
                <Tooltip content={<WalletCustomTooltip />} wrapperStyle={{zIndex: 999}}/>
            </PieChart>

        <div className="
            pointer-events-none
            absolute
            inset-0
            flex
            items-center
            justify-center
            flex-col
            z-10
        ">
            <span className='text-sm text-[#7CB8FF]'>
                Total Value
            </span>

            <strong className='text-white text-xl'>
                ${totalValue.toFixed(2)}
            </strong>
        </div>

    </div>
    )
}

export default WalletSparkline;