import type {AssetKlines} from "../../features/assets/api/assetsApi.ts";
import {Line, LineChart, ResponsiveContainer, YAxis} from "recharts";


type PortfolioSparklineProps = {
    data: AssetKlines[]
    isPositive: boolean
}

const PortfolioSparkline = ({data, isPositive}: PortfolioSparklineProps) => {
    const chartData = data.map((item) => ({
        time: item.time,
        price: Number(item.close)
    }))

    if (!chartData.length) {
        return (
            <div className="w-[120px] h-[40px] bg-[#F3F4F6] rounded-md" />
        )
    }

    const price: number[] = chartData.map((item) => (
        item.price
    ))

    const sort_price = price.sort((a,b) => a-b)

    const minPrice = sort_price[0]
    const maxPrice = sort_price[sort_price.length - 1]
    const range = maxPrice - minPrice
    let padding = 0
    if (range === 0){
        padding = minPrice * 0.01
    } else {
        padding = range * 0.1
    }

    return (
        <div className='w-[100px] h-full'>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <YAxis dataKey="price" hide={true} domain={[
                        minPrice - padding,
                        maxPrice + padding,
                    ]} />
                    <Line type='linear'
                          dataKey='price'
                          strokeWidth={1.5}
                          stroke={isPositive ? "#22C55E" : "#DC2626"}
                          dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default PortfolioSparkline;