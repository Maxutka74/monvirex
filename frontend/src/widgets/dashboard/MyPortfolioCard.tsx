import {useEffect, useState} from "react";
import walletApi, {type UserPortfolio} from "../../features/wallet/api/walletApi.ts";
import assetsApi, {type Asset, type AssetKlines} from "../../features/assets/api/assetsApi.ts";
import { HiOutlineClock } from "react-icons/hi";
import PortfolioSparkline from "./PortfolioSparkline.tsx";
import {GoArrowDownRight, GoArrowUpRight} from "react-icons/go";
import {FiArrowLeft, FiArrowRight} from "react-icons/fi";
import {RiLoaderLine} from "react-icons/ri";


const MyPortfolioCard = () => {
    const [portfolio, setPortfolio] = useState<UserPortfolio[]>([])
    const [assets, setAssets] = useState<Asset[]>([])
    const [klinesBySymbol, setKlinesBySymbol] = useState<Record<string, AssetKlines[]>>({})
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const itemsPerPage = 5

    useEffect(() => {
        const data = async () => {
            try {
                setIsLoading(true)

                const assetList: string[] = []
                const portfolioHistory = await walletApi.getPortfolio()
                const klinesEntries  = await Promise.all(
                    portfolioHistory.portfolio.map(async (item) => {
                        assetList.push(item.asset)
                        const klines = await assetsApi.getAssetKlines(item.asset, '4h', 60)

                        return [item.asset, klines] as const
                    })
                )
                const Assets = await assetsApi.getAssets(assetList)

                setPortfolio(portfolioHistory.portfolio)
                setAssets(Assets.results)
                setKlinesBySymbol(Object.fromEntries(klinesEntries))
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        data()
    }, [])

    const portfolioTableData = portfolio.map((item) => {
        const asset = assets.find((asset) => asset.symbol === item.asset)

        if (!asset) {
            return null
        }

        const balance = Number(item.amount)
        const price = Number(asset.current_price)

        return (
            {
                icon: asset.icon_url,
                symbol: asset.symbol,
                balance:  balance * price,
                graphic: klinesBySymbol[item.asset] ?? [],
                change_price: asset.price_change_24h,
                value: price,
            }
        )
    }).filter((item) => item !== null)

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

    const totalPages = Math.ceil(portfolioTableData.length / itemsPerPage)

    const startIndex = (currentPage-1) * itemsPerPage
    const endIndex = currentPage * itemsPerPage

    const paginatedPortfolioData = portfolioTableData.slice(startIndex, endIndex)

    return (
        <div className='w-[920px] h-[400px] rounded-[30px] bg-[#FFFFFF]/60 p-5'>
            <div className='flex flex-row items-center gap-2 pb-[20px]'>
                <div className='w-[44px] h-[44px] flex justify-center items-center bg-[#429EFF] rounded-full'>
                    <HiOutlineClock size={24} className='text-[#FFFFFF]'/>
                </div>
                <h4 className='text-[24px] font-medium'>My Portfolio</h4>
            </div>
            {isLoading ? (<div className='w-full h-[240px] flex justify-center items-center '><RiLoaderLine size={48} className='text-[#666D80] animate-spin'/></div>):
                <table className='w-[880px]'>
                    <thead>
                        <tr className='w-full h-[31px] text-[#666D80] font-medium'>
                            <th scope='col' className='w-[176px] h-[26px] text-left'>Asset</th>
                            <th scope='col' className='w-[176px] h-[26px] text-left'>Price</th>
                            <th scope='col' className='w-[176px] h-[26px]'>7 Days Market</th>
                            <th scope='col' className='w-[176px] h-[26px]'>24H Change</th>
                            <th scope='col' className='w-[176px] h-[26px]'>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                    {paginatedPortfolioData.map((item) => (
                        <tr key={item.symbol} className='h-[46px]'>
                            <td><div className='h-[46px] flex flex-row items-center font-medium gap-2'>
                                <img className='w-[20px] h-[20px]' src={item.icon} alt=""/>{item.symbol.slice(0,3)}
                            </div></td>
                            <td className='h-[46px] font-medium'>{formatPrice(item.value)}</td>
                            <td className='w-[176px] h-[48px] pointer-events-none'>
                                <div className='w-full h-full flex justify-center items-center'>
                                    <PortfolioSparkline data={item.graphic} isPositive={Number(item.change_price) > 0}/>
                                </div></td>
                            <td><div className={`h-[46px] flex flex-row justify-center items-center ${Number(item.change_price) > 0? 'text-[#40C4AA]': 'text-[#DF1C41]'}`}>
                                {Number(item.change_price) > 0 ? (<><GoArrowUpRight />+{item.change_price}% </>): (<><GoArrowDownRight />{item.change_price}% </>)}
                            </div></td>
                            <td className='h-[26px] text-center font-medium'>{formatPrice(item.balance)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            }
            {currentPage <= totalPages &&
                <div className='flex flex-row justify-center items-center text-[#666D80] gap-4 pt-2'>
                    <FiArrowLeft size={24} className={`cursor-pointer ${currentPage === 1 && 'text-[#CBD5E1] pointer-events-none cursor-not-allowed' }`} onClick={() => currentPage > 1? setCurrentPage(currentPage - 1) : null}/>
                    <div>
                        <p>Page {currentPage} of {totalPages}</p>
                    </div>
                    <FiArrowRight size={24} className={`cursor-pointer ${currentPage === totalPages && 'text-[#CBD5E1] pointer-events-none cursor-not-allowed' }`} onClick={() => currentPage < totalPages? setCurrentPage(currentPage + 1) : null}/>
                </div>
            }
        </div>
    )
}

export default MyPortfolioCard