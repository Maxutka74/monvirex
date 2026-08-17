import { TiStarFullOutline } from "react-icons/ti"
import {useEffect, useState} from "react";
import assetsApi, {type Asset, type AssetKlines} from "../../../features/assets/api/assetsApi.ts";
import { FiArrowUpRight } from "react-icons/fi";
import BestToBuyKlines from "./BestToBuyKlines.tsx";
import {RiLoaderLine} from "react-icons/ri";
import TradingActions from "../../trade/TradingActions.tsx";

type BestToBuyCardProps = {
    trade?: boolean
}

const BestToBuyCard = ({trade}: BestToBuyCardProps) => {
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
        type: 'Buy',
        symbol: topBuy?.symbol,
        name: topBuy?.name,
        crypto_icon: topBuy?.icon_url,
        current_price: topBuy?.current_price
    }


    return (
        <div className='w-full bg-[#FFFFFF]/60 rounded-[20px] p-5'>
            <div className='flex flex-row items-center justify-between mb-5'>
                <div className='flex flex-row items-center gap-3'>
                    <div className='w-[44px] h-[44px] flex items-center justify-center rounded-[10px] bg-green-100'>
                        <TiStarFullOutline size={24} className='text-green-600' />
                    </div>
                    <p className='text-2xl font-medium'>Best to Buy</p>
                </div>
                    {trade &&
                    <button className='text-white bg-[#429EFF] px-8 py-2 sm:px-10 sm:py-3 rounded-md cursor-pointer' onClick={() => setOpenBuyModal(true)}>
                        Buy
                    </button>
                    }
            </div>
            {isLoading? (
                <div className='flex items-center justify-center'>
                    <RiLoaderLine
                        size={42}
                        className="text-[#666D80] animate-spin"
                    />
                </div>):
                <div className='flex flex-col sm:flex-row gap-3'>
                    <div className='flex flex-row gap-2'>
                        <div className='w-[70px] h-[70px] flex flex-none items-center justify-center bg-[#ECEFF3]/50 rounded-full'>
                            <img className='w-[48px] h-[48px]' src={topBuy?.icon_url} alt="crypto icon"/>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-5'>
                                <div>
                                    <h4 className='text-[22px] font-medium'>{topBuy?.name}</h4>
                                    <p className='text-sm text-[#6F6F6F]'>{topBuy?.symbol}</p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2 text-[24px] font-medium'>
                                <p>${Number(topBuy?.current_price).toFixed(6)}</p>
                                <div className='flex flex-row items-center gap-1 text-green-500'>
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