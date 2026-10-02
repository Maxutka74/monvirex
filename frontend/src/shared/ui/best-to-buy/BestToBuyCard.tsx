import { TiStarFullOutline } from "react-icons/ti"
import {useEffect, useState} from "react";
import assetsApi, {type Asset, type AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import { FiArrowUpRight } from "react-icons/fi";
import BestToBuyKlines from "./BestToBuyKlines.tsx";
import {RiLoaderLine} from "react-icons/ri";
import TradingActions from "../../../widgets/trade/trading-actions/TradingActions.tsx";
import {useStore} from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";
import {formatNumber} from "../../utils/formatNumber.ts";

type BestToBuyCardProps = {
    trade?: boolean
}

const BestToBuyCard = ({trade}: BestToBuyCardProps) => {
    const theme = useStore(themeStore, (state) => state.theme);

    const [topBuy, setTopBuy] = useState<Asset>()
    const [topKlines, setTopKlines] = useState<AssetKlines[]>([])
    const [openBuyModal, setOpenBuyModal] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const data = async() => {
            try {
                setIsLoading(true)

                const topMovers = await assetsApi.getTopMovers()

                if (!topMovers.top_movers.length) {
                    return;
                }

                const bestToBuy = [...topMovers.top_movers].sort(
                    (a,b) => Number(b.price_change_24h) - Number(a.price_change_24h)
                )[0]

                const klinesData = await assetsApi.getAssetKlines(bestToBuy.symbol, '1w', 6)

                setTopBuy(bestToBuy)
                setTopKlines(klinesData)
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }

        data()
    }, [])

    const dataActions = {
        type: 'Buy' as const,
        interval: '',
        symbol: topBuy?.symbol ?? '',
        name: topBuy?.name ?? '',
        crypto_icon: topBuy?.icon_url ?? '',
        current_price: topBuy?.current_price ?? '',
        current_amount: ''
    }


    return (
        <div className={`w-full rounded-[20px] p-5
        ${
            trade ? (
                'min-h-[250px] px-5 py-4'
            ): 'min-h-[256px]'
        }
        ${
            theme === 'dark'
                ? 'bg-black/60 border border-[#123A70] text-white shadow-[0_0_20px_rgba(0,102,255,0.08)]'
                : 'bg-[#FFFFFF]/60'
        }
        `}>
            <div className='flex flex-row items-center justify-between mb-5'>
                <div className='flex flex-row items-center gap-3'>
                    <div className={`w-[44px] h-[44px] flex items-center justify-center rounded-[10px]  ${
                        theme === 'dark'
                            ? 'bg-[#0B2A52] border border-[#164B86]'
                            : 'bg-[#429EFF]'
                    }`}>
                        <TiStarFullOutline
                            size={24}
                            className={theme === 'dark' ? 'text-[#1597FF]' : 'text-white'}
                        />
                    </div>
                    <p className='text-2xl font-medium'>Best to Buy</p>
                </div>
                    {trade &&
                    <button className={`text-white px-8 py-2 sm:px-10 sm:py-3 rounded-md cursor-pointer ${
                        theme === 'dark'
                            ? 'bg-[#1597FF] shadow-[0_0_15px_rgba(21,151,255,0.2)] hover:bg-[#269FFF]'
                            : 'bg-[#429EFF]'
                    }`} onClick={() => setOpenBuyModal(true)}>
                        Buy
                    </button>
                    }
            </div>
            {isLoading? (
                <div className='flex items-center justify-center'>
                    <RiLoaderLine
                        size={42}
                        className={`animate-spin ${
                            theme === 'dark'
                                ? 'text-[#1597FF]'
                                : 'text-[#666D80]'
                        }`}
                    />
                </div>):
                <div className='flex flex-col sm:flex-row gap-3'>
                    <div className='flex flex-row gap-2'>
                        <div className={`w-[70px] h-[70px] flex flex-none items-center justify-center rounded-full ${
                            theme === 'dark'
                                ? 'bg-[#0B1D38] border border-[#164B86]'
                                : 'bg-[#ECEFF3]/50'
                        }`}>
                            <img className='w-[48px] h-[48px]' src={topBuy?.icon_url} alt="crypto icon"/>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-5'>
                                <div>
                                    <h4 className='text-[22px] font-medium'>{topBuy?.name}</h4>
                                    <p className={`text-sm ${
                                        theme === 'dark'
                                            ? 'text-[#7184A3]'
                                            : 'text-[#6F6F6F]'
                                    }`}>
                                        {topBuy?.symbol}
                                    </p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2 text-[24px] font-medium'>
                                <p>${formatNumber(topBuy?.current_price ?? 0)}</p>
                                <div className={`flex flex-row items-center gap-1 ${
                                    theme === 'dark'
                                        ? 'text-[#40C4AA]'
                                        : 'text-green-500'
                                }`}>
                                    <FiArrowUpRight />
                                    <p>+{topBuy?.price_change_24h}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-full'>
                        <BestToBuyKlines klines={topKlines} />
                    </div>
                </div>
            }
            {openBuyModal && (
                <TradingActions setOpenTradeActionModal={setOpenBuyModal} dataActions={dataActions} />
            )}
        </div>
    )
}

export default BestToBuyCard