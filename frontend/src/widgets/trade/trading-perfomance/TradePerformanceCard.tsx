import { RiBarChartLine } from "react-icons/ri"
import Select from "react-select";
import {useEffect, useState} from "react";
import assetsApi, {type Asset, type AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import api from "../../../shared/api/instance.ts";
import TradePerformanceChart from "./TradePerformanceChart.tsx";
import {useMarketOverviewStore, useTradeStore} from "../../../entities/trade/model/tradeStore.ts";


export type IntervalOption = {
    value: string;
    label: string;
}


const INTERVAL_OPTIONS = [
    { value: '1m', label: '1 minute' },
    { value: '3m', label: '3 minutes' },
    { value: '5m', label: '5 minutes' },
    { value: '15m', label: '15 minutes' },
    { value: '30m', label: '30 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '2h', label: '2 hours' },
    { value: '4h', label: '4 hours' },
    { value: '6h', label: '6 hours' },
    { value: '8h', label: '8 hours' },
    { value: '12h', label: '12 hours' },
    { value: '1d', label: '1 day' },
    { value: '3d', label: '3 days' },
    { value: '1w', label: '1 week' },
    { value: '1M', label: '1 month' },
]

const LIMIT = 50

const TradePerformanceCard = () => {
    const [assets, setAssets] = useState<Asset[]>([])
    const [nextPage, setNextPage] = useState<string | null>('')
    const [interval, setInterval] = useState<IntervalOption | null>({ value: '5m', label: '5 minutes' })
    const [chartKlines, setChartKlines] = useState<AssetKlines[]>([])

    const currentAsset = useTradeStore(
        state => state.currentAsset
    )

    const setCurrentAsset = useTradeStore(
        state => state.setCurrentAsset
    )

    const setDataKlines = useMarketOverviewStore((state) => state.setKlines)

    const setAddKlines = useMarketOverviewStore((state) => state.addKline)

    useEffect(() => {
        const actionData = async () => {
            try {
                const assets = await assetsApi.getAssets(undefined, undefined, '-current_price');
                const asset = assets.results

                setAssets(asset)
                setNextPage(assets.next)

                setCurrentAsset({
                    symbol: asset[0].symbol,
                    value: asset[0].name,
                    label: (
                        <div className='flex items-center gap-2'>
                            <img className='w-[24px] h-[24px]' src={asset[0].icon_url} alt="Crypto Icon"/>
                            <span>{asset[0].name}</span>
                        </div>
                    ),
                    interval: interval?.value
                })
            } catch (e) {
                console.error(e);
            }
        }

        actionData()
    }, [])

    useEffect(() => {
        const historyKlineData = async () => {
            if (!currentAsset || !interval) return;

            try {
                const klineData = await assetsApi.getAssetKlines(
                    currentAsset.symbol,
                    interval.value,
                    LIMIT,
                )

                setChartKlines(klineData)
                setDataKlines(klineData.slice(-14))
            } catch (e) {
                console.error(e)
            }
        }

        historyKlineData()
    }, [currentAsset, interval]);

    useEffect(() => {
        if (!currentAsset?.symbol || !interval?.value) return ;

        const socket = new WebSocket(`ws://localhost:8000/ws/klines/${currentAsset?.symbol}/${interval?.value}/`)

        socket.onmessage = (event) => {
            if (event.data === 'connected') return;

            const data = JSON.parse(event.data)

            if (data.type !== 'kline') return;

            const newKline = data.data

            setAddKlines(newKline)

            setChartKlines(prev => {
                const lastKline = prev[prev.length - 1]

                if (!lastKline) {
                    return [newKline]
                }

                if (lastKline.time === newKline.time) {
                    return [
                        ...prev.slice(0, -1),
                        newKline,
                    ]
                }

                return [
                    ...prev,
                    newKline,
                ]

            })
        }

        socket.onerror = (error) => {
            console.error(error)
        }

        return () => {
            socket.close()
        }
    }, [currentAsset?.symbol, interval?.value]);

    const optionAssets = assets.map((item) => ({
        symbol: item.symbol,
        value: item.name,
        label: (
            <div className='flex items-center gap-2'>
                <img className='w-[24px] h-[24px]' src={item.icon_url} alt="Crypto Icon"/>
                <span>{item.name}</span>
            </div>
        ),
        interval: interval?.value,
    }))

    const scrollMoreOptions = async () => {
        if (!nextPage) return;

        try {
            const next = nextPage.indexOf('api/')

            const nextAssets = await api.get(nextPage.slice((next)+3))

            setAssets(assets => [...assets, ...nextAssets.data.results])

            setNextPage(nextAssets.data.next)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className='w-full h-full flex flex-col rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-6 gap-5'>
            <div className='flex flex-col gap-4 xl:flex-row justify-between'>
                <div className='flex flex-row gap-3 items-center'>
                    <div className="w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-full shrink-0">
                        <RiBarChartLine size={24} />
                    </div>
                    <h3 className='text-2xl font-medium'>Trading Performance</h3>
                </div>
                <div className='flex flex-row gap-3'>
                    <div className='w-[150px]'>
                        <Select className = 'w-full' classNames={{control: () => 'h-[40px] border-none outline-none shadow-none'}}
                                isSearchable={false} options={optionAssets} onMenuScrollToBottom={scrollMoreOptions} maxMenuHeight={200}
                                value={currentAsset ?? optionAssets[0]} onChange={(option) => {setCurrentAsset(option);}}/>
                    </div>
                    <div className='w-[150px]'>
                        <Select className = 'w-full' classNames={{control: () => 'h-[40px] border-none outline-none shadow-none'}}
                                isSearchable={false} options={INTERVAL_OPTIONS} maxMenuHeight={200} value={interval}
                                onChange={(option) => setInterval(option)}
                                />
                    </div>
                    <div className='w-[150px] h-[40px] flex flex-row items-center bg-white border border-[#CCCCCC] rounded-[4px] px-2'>
                        <span>50</span>
                    </div>
                </div>
            </div>
            <div>
                {
                    chartKlines.length > 0 && (
                        <div className='flex flex-col gap-3 md:flex-row justify-between'>
                            <div className='flex flex-row items-center gap-2 font-medium'>
                                <span className='text-4xl'>${Number(chartKlines.slice(-1)[0].close).toFixed(3)}</span>
                                <span className='text-xl text-[#429EFF]'>${((Number(chartKlines.slice(-1)[0].close)) - Number(chartKlines.slice(0)[0].close)).toFixed(2)}</span>
                            </div>
                            <div className='flex flex-row items-center gap-3 font-medium'>
                                <span>O <span className='text-[#429EFF]'>{Number(chartKlines.slice(-1)[0].open).toFixed(3)}</span></span>
                                <span>H <span className='text-[#FFBE4C]'>{Number(chartKlines.slice(-1)[0].high).toFixed(3)}</span></span>
                                <span>L <span className='text-[#429EFF]'>{Number(chartKlines.slice(-1)[0].low).toFixed(3)}</span></span>
                                <span>C <span className='text-[#FFBE4C]'>{Number(chartKlines.slice(-1)[0].close).toFixed(3)}</span></span>
                            </div>
                        </div>
                    )
                }
            </div>
            <div className='w-full min-w-0'>
                {chartKlines.length > 0 && (
                    <TradePerformanceChart klines={chartKlines} interval={interval} />
                )}
            </div>
        </div>
    )
}

export default TradePerformanceCard