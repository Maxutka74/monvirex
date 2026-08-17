import type {AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import {Area, AreaChart, ResponsiveContainer, YAxis} from "recharts";


type MarketOverviewChartProps = {
    klines: AssetKlines[];
}

const MarketOverviewChart = ({klines}: MarketOverviewChartProps) => {

    const dataKlines = klines.map((kline) => ({
        time: kline.time,
        close: Number(kline.close),
    }))

    const prices = dataKlines.map((kline) => (Number(kline.close)))

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    const padding = (maxPrice - minPrice) * 0.3

    return (
        <div className='w-full'>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={dataKlines} >
                    <YAxis
                        domain={[
                            minPrice - padding,
                            maxPrice + padding,
                        ]}
                        hide={true}
                    />
                    <Area
                        type='monotone'
                        dataKey='close'
                        stroke="#40C4AA"
                        strokeWidth={3}
                        fill="#40C4AA"
                        fillOpacity={0.06}
                        activeDot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default MarketOverviewChart;