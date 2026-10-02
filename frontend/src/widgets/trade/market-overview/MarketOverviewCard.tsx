import {RiHomeSmile2Line} from "react-icons/ri";
import {useEffect, useState} from "react";
import assetsApi, {type Asset} from "../../../features/assets/api/assetsApi.ts";
import {useMarketOverviewStore, useTradeStore} from "../../../entities/trade/tradeStore.ts";
import MarketOverviewChart from "./MarketOverviewChart.tsx";
import TradingActions from "../trading-actions/TradingActions.tsx";
import walletApi, {type UserPortfolio} from "../../../features/wallet/api/walletApi.ts";
import { IoMdCheckmark } from "react-icons/io";
import { MdClose } from "react-icons/md";
import {useStore} from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";


const MarketOverviewCard = () => {
    const theme = useStore(themeStore, (state) => state.theme);

    const [asset, setAsset] = useState<Asset>();
    const [cryptoBalance, setCryptoBalance] = useState<UserPortfolio[]>();
    const [action, setAction] = useState<'Buy' | 'Sell'>('Buy');
    const [openTradeActionModal, setOpenTradeActionModal] = useState(false);

    const currentAsset = useTradeStore(
        state => state.currentAsset
    )

    const klines = useMarketOverviewStore((state) => state.klines)

    useEffect(() => {
        const cryptoBalanceData = async () => {
            try {
                const balanceData = await walletApi.getPortfolio()

                setCryptoBalance(balanceData.portfolio)
            } catch (e) {
                console.error(e);
            }
        }

        cryptoBalanceData()
    }, []);

    useEffect(() => {
        if (!currentAsset) return;

        const dataAsset = async () => {
            try {
                const data = await assetsApi.getAssets((currentAsset.value))

                setAsset(data.results[0])
            } catch (e) {
                console.error(e);
            }
        }

        dataAsset();
    }, [currentAsset]);

    const formatVolume = (volume: number) => {
        if (volume >= 1_000_000_000) {
            return `${(volume / 1_000_000_000).toFixed(2)}B`;
        }

        if (volume >= 1_000_000) {
            return `${(volume / 1_000_000).toFixed(2)}M`;
        }

        if (volume >= 1_000) {
            return `${(volume / 1_000).toFixed(2)}K`;
        }

        return volume.toFixed(2);
    }

    const sellAssets = cryptoBalance?.find((cryptoAsset) => cryptoAsset.asset === asset?.symbol)

    const dataActions = {
        type: action,
        interval: currentAsset?.interval ?? '',
        symbol: asset?.symbol ?? '',
        name: asset?.name ?? '',
        crypto_icon: asset?.icon_url ?? '',
        current_price: asset?.current_price ?? '',
        current_amount: sellAssets?.amount ?? ''
    }

    return (
        <div className={`w-full min-h-[692px] h-full rounded-[30px] p-5 ${
            theme === 'dark'
                ? 'bg-black/60 border border-[#123A70] text-white shadow-[0_0_25px_rgba(0,102,255,0.08)]'
                : 'bg-[#FFFFFF]/60'
        }`}>
            <div className='flex flex-row items-center gap-3 mb-5'>
                <div className={`w-[44px] h-[44px] flex justify-center items-center text-white rounded-full ${
                    theme === 'dark'
                        ? 'bg-[#1597FF] shadow-[0_0_15px_rgba(21,151,255,0.3)]'
                        : 'bg-[#429EFF]'
                }`}>
                    <RiHomeSmile2Line size={24} />
                </div>
                <h3 className='text-2xl font-medium'>Market Overview</h3>
            </div>
            <h3 className='text-3xl font-medium mb-5'>${Number(klines.at(-1)?.close).toFixed(3)}</h3>
            <div className='flex flex-row items-center justify-between mb-5'>
                <div className='flex flex-row items-center gap-3 '>
                    <div className={`w-[54px] h-[54px] flex items-center justify-center rounded-full shrink-0 ${
                        theme === 'dark'
                            ? 'bg-[#0B1D38] border border-[#164B86]'
                            : 'bg-[#DFE1E7]'
                    }`}>
                        <img className='w-8 h-8' src={asset?.icon_url} alt="Crypto Icon"/>
                    </div>
                    <div className='flex flex-col justify-center'>
                        <p className='text-[23px] font-medium'>{asset?.name}</p>
                        <span className={theme === 'dark' ? 'text-[#7184A3]' : 'text-[#6F6F6F]'}>
                            {asset?.symbol}
                        </span>
                    </div>
                </div>
                <div className='w-full flex flex-col sm:flex-row items-end justify-end gap-2'>
                    <button className={`max-w-[92px] w-full h-[40px] text-white rounded-md cursor-pointer ${
                        theme === 'dark'
                            ? 'bg-[#1597FF] shadow-[0_0_12px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]'
                            : 'bg-[#429EFF]'
                    }`} onClick={() => {
                        setOpenTradeActionModal(true); setAction('Buy')
                    }}>Buy</button>
                    <button className={`max-w-[92px] w-full h-[40px] rounded-md ${
                        sellAssets
                            ? theme === 'dark'
                                ? 'cursor-pointer text-white bg-[#1597FF] shadow-[0_0_12px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]'
                                : 'cursor-pointer text-white bg-[#429EFF]'
                            : theme === 'dark'
                                ? 'text-[#60718D] bg-[#0B1D38] border border-[#164B86] pointer-events-none'
                                : 'text-gray-500 bg-gray-200 pointer-events-none'
                    }`} onClick={() => {
                        setOpenTradeActionModal(true); setAction('Sell')
                    }}>Sell</button>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between font-medium mb-5'>
                <div className={`flex flex-row items-center gap-2 ${
                    sellAssets
                        ? theme === 'dark' ? 'text-[#40C4AA]' : 'text-green-600'
                        : theme === 'dark' ? 'text-[#DF1C41]' : 'text-red-600'
                }`}>
                    <div className={`w-[28px] h-[28px] flex items-center justify-center rounded-full shrink-0 ${
                        sellAssets
                            ? theme === 'dark' ? 'bg-[#0B2E28]' : 'bg-green-200'
                            : theme === 'dark' ? 'bg-[#2A0D18]' : 'bg-red-200'
                    }`}>
                        {sellAssets ? (
                            <IoMdCheckmark size={20} />
                        ): (
                            <MdClose size={20} />
                        )}
                    </div>
                    <p>You {!sellAssets && "don't" } have this cruptocurrency</p>
                </div>
                <div className={`text-right ${
                    theme === 'dark' ? 'text-[#7184A3]' : 'text-gray-400'
                }`}>
                    <span>Available: </span>
                    <span className={sellAssets
                        ? theme === 'dark' ? 'text-[#40C4AA]' : 'text-green-500'
                        : ''
                    }>{sellAssets? sellAssets?.amount.slice(0, 8): '0.000'} {currentAsset?.value}</span>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between font-medium mb-5'>
                <h5 className='text-xl'>Price(24)</h5>
                <span>${asset?.price_change_24h}</span>
            </div>
            <div className='w-full flex flex-row items-center justify-between mb-5'>
                <div className={`min-w-[220px] w-full h-1 border-b ${
                    theme === 'dark' ? 'border-[#164B86]' : 'border-gray-300'
                }`}/>
                <div className='flex flex-row items-center border-l border-gray-300 pl-2'>
                    <div className={`flex items-center justify-center rounded-full ${
                        theme === 'dark'
                            ? 'bg-[#0B1D38] border border-[#164B86]'
                            : 'bg-[#DFE1E7]'
                    }`}>
                        <span className='px-3 py-1'>#1</span>
                    </div>
                </div>
            </div>
            <div className='flex flex-row items-center justify-between font-medium mb-5'>
                <h5 className='text-xl'>Volume(24)</h5>
                <span>${formatVolume(Number(asset?.volume_24h))}</span>
            </div>
            <div className='w-full flex flex-row items-center justify-between mb-5'>
                <div className={`min-w-[220px] w-full h-1 border-b ${
                    theme === 'dark' ? 'border-[#164B86]' : 'border-gray-300'
                }`}/>
                <div className='flex flex-row items-center border-l border-gray-300 pl-2'>
                    <div className={`flex items-center justify-center rounded-full ${
                        theme === 'dark'
                            ? 'bg-[#0B1D38] border border-[#164B86]'
                            : 'bg-[#DFE1E7]'
                    }`}>
                        <span className='px-3 py-1'>#2</span>
                    </div>
                </div>
            </div>
            <div className='w-full h-[200px]'>
                {klines.length > 0 && (
                    <MarketOverviewChart klines={klines} />
                )}
            </div>
            {openTradeActionModal && (
                <TradingActions setOpenTradeActionModal={setOpenTradeActionModal} dataActions={dataActions} />
            )}
        </div>
    )
}

export default MarketOverviewCard
