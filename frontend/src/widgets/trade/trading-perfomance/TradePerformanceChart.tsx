import ReactECharts from 'echarts-for-react';
import type {AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import type {IntervalOption} from "./TradePerformanceCard.tsx";

type TradePerformanceChartProps = {
    klines: AssetKlines[]
    interval: IntervalOption | null
}

const TradePerformanceChart = ({klines, interval} : TradePerformanceChartProps) => {

    const candleData = klines.map((kline) => [
        Number(kline.open),
        Number(kline.close),
        Number(kline.low),
        Number(kline.high),
    ])

    const formatXAxisDate = (date: Date, interval: string) => {
        switch (interval) {
            case '1m':
            case '3m':
            case '5m':
            case '15m':
            case '30m':
                return date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                });

            case '1h':
            case '2h':
            case '4h':
            case '6h':
            case '8h':
            case '12h':
                return date.toLocaleString('en-US', {
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                });

            case '1d':
            case '3d':
                return date.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                });

            case '1w':
                return date.toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                });

            case '1M':
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                });

            default:
                return date.toLocaleDateString('en-US');
        }
    };

    const xAxisData = klines.map((kline) => {
        const data = new Date(Number(kline.time) * 1000);

        if (interval) {
            return formatXAxisDate(data, interval.value);
        }
    })

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },

            formatter: (params: any) => {
                const kline = klines[params[0].dataIndex]
                const date = new Date(Number(kline.time) * 1000)

                const isUp = Number(kline.close) >= Number(kline.open)

                return `
                    <div class="min-w-[180px] flex flex-col gap-2">
                        <div class="text-black font-medium">
                            ${Intl.DateTimeFormat('en-US', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            }).format(new Date(date))}
                        </div>
            
                        <div class="flex justify-between gap-6">
                            <span class="text-gray-500">Open:</span>
                            <b class="text-blue-500">${kline.open.slice(0,-6)}</b>
                        </div>
            
                        <div class="flex justify-between gap-6">
                            <span class="text-gray-500">High:</span>
                            <b class="text-orange-500">${kline.high.slice(0,-6)}</b>
                        </div>
            
                        <div class="flex justify-between gap-6">
                            <span class="text-gray-500">Low:</span>
                            <b class="text-blue-500">${kline.low.slice(0,-6)}</b>
                        </div>
            
                        <div class="flex justify-between gap-6">
                            <span class="text-gray-500">Close:</span>
                            <b class="${isUp ? 'text-green-500' : 'text-red-500'}">
                                ${kline.close.slice(0,-6)}
                            </b>
                        </div>
            
                        <div class="border-t border-gray-100 pt-2 flex justify-between gap-6">
                            <span class="text-gray-500">Volume:</span>
                            <b class="text-gray-900">${kline.volume.slice(0,-2)}</b>
                        </div>
                    </div>
                `
            },
        },

        xAxis: {
            type: 'category',
            data: xAxisData,
            boundaryGap: true,
        },

        yAxis: {
            type: 'value',
            scale: true,
            position: 'right',
        },

        axisLabel: {
            hideOverflow: true,
            interval: 'auto'
        },

        grid: {
            left: 10,
            right: 10,
            bottom: 20,
            top: 20,
            containLabel: true,

        },

        series: [
            {
                type: 'candlestick',
                data: candleData,

                itemStyle: {
                    color: '#16a34a',
                    color0: '#ef4444',

                    borderColor: '#16a34a',
                    borderColor0: '#ef4444'
                }
            },
        ],
    };

    return (
        <ReactECharts option={option} style={{width:'100%', height:'510px'}} />
    )
}

export default TradePerformanceChart;