import {useEffect, useState} from "react";
import assetsApi, {type Asset} from "../../features/assets/api/assetsApi.ts";
import { IoStatsChartSharp } from "react-icons/io5";
import {RiLoaderLine} from "react-icons/ri";


const TopMoversCard = () => {
    const [assets, setAssets] = useState<Asset[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const data = async () => {
            try {
                setIsLoading(true)

                const topMoversAssets = await assetsApi.getTopMovers()
                setAssets(topMoversAssets.top_movers.slice(0,5))
            } catch (error) {
                console.log(error)
            } finally {
                setIsLoading(false)
            }
        }

        data()
    }, [])

    const formatPrice = (price: number | string) => {
        const value = Number(price)

        if (value >= 1) {
            return `$${value.toFixed(2)}`
        }

        if (value >= 0.01) {
            return `$${value.toFixed(4)}`
        }

        if (value > 0) {
            return `$${value.toFixed(6)}`
        }

        return '$0.00'
    }

    return (
        <div className='w-[440px] h-[500px] flex flex-col items-start gap-5 bg-[#FFFFFF]/60 rounded-[30px] p-5'>
           <div className='flex flex-row justify-center items-center gap-2'>
               <div className='w-[44px] h-[44px] flex items-center justify-center bg-[#429EFF] rounded-full'>
                   <IoStatsChartSharp size={24} className='text-white'/>
               </div>
               <h4 className='text-[18px] font-medium'>Top Movers</h4>
           </div>
                <div className='w-[400px]'>
                    {isLoading ? (<div className='w-full h-[380px] flex items-center justify-center'><RiLoaderLine size={36} className='text-[#666D80] animate-spin' /></div>):
                        <ul className='flex flex-col gap-6'>
                            {assets.map((asset) => (
                                <li key={asset.symbol}>
                                    <div className='grid grid-cols-[60px_1fr_90px_90px] items-center gap-3'>
                                        <div className='w-[60px] h-[60px] flex items-center justify-center bg-[#DFE1E7] rounded-full'>
                                            <img
                                                className="w-[30px] h-[30px]"
                                                src={asset.icon_url}
                                                alt={asset.name}
                                            />
                                        </div>

                                        <div className='w-[100px] flex flex-col justify-center items-start min-w-0'>
                                            <h5 className='w-full text-[20px] font-medium truncate'>
                                                {asset.symbol}
                                            </h5>
                                            <p className='w-full text-[12px] text-[#818898] truncate'>
                                                {asset.name.toUpperCase()}
                                            </p>
                                        </div>

                                        <p
                                            className={`text-center ${
                                                Number(asset.price_change_24h) > 0
                                                    ? 'text-green-400'
                                                    : 'text-red-700'
                                            }`}
                                        >
                                            {Number(asset.price_change_24h) > 0
                                                ? `+${asset.price_change_24h}%`
                                                : `${asset.price_change_24h}%`}
                                        </p>

                                        <p className='text-[20px] text-right'>
                                            {formatPrice(asset.current_price)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    }
                </div>
        </div>
    )
}

export default TopMoversCard