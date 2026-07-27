import {useEffect, useState} from "react";
import { HiOutlineChartPie } from "react-icons/hi";
import walletApi, {
    type UserPortfolio,
    type UserSummary,
} from "../../features/wallet/api/walletApi.ts";
import WalletSparkline from "./WalletSparkline.tsx";
import {GrTransaction} from "react-icons/gr";
import {RiLoaderLine} from "react-icons/ri";
import {PiBag} from "react-icons/pi";
import {IoIosArrowDown} from "react-icons/io";
import TransactionOverviewChart from "./TransactionOverviewChart.tsx";


type Period = '1d' | '7d' | '30d'

const WalletOverviewCard = () => {
    const COLORS = [
        "#F7931A",
        "#627EEA",
        "#9945FF",
        "#26A17B",
        "#94A3B8"
    ];

    const currentDate: Record<Period, string> = {
        '1d': 'Day',
        '7d': 'Week',
        '30d': 'Month'
    }

    const [portfolio, setPortfolio] = useState<UserPortfolio[]>([]);
    const [allTimeSummary, setAllTimeSummary] = useState<UserSummary>();
    const [activitySummary, setActivitySummary] = useState<UserSummary | null>(null);
    const [days, setDays] = useState<Period>('7d');
    const [isLoadingAsset, setIsLoadingAsset] = useState(true);
    const [isLoadingTransaction, setIsLoadingTransaction] = useState(true);


    useEffect(() => {
        const fetchCryptoData = async () => {
            try {
                setIsLoadingAsset(true);
                const cryptoData = await walletApi.getPortfolio()
                const summaryData = await walletApi.getActivitySummary('all')

                setPortfolio(cryptoData.portfolio)
                setAllTimeSummary(summaryData.summary)
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingAsset(false)
            }
        };

        fetchCryptoData();
    }, []);

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                setIsLoadingTransaction(true)
                const transactionData = await walletApi.getActivitySummary(days)

                setActivitySummary(transactionData.summary)
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingTransaction(false)
            }
        };

        fetchTransactionData();
    }, [days]);

    const totalValue = portfolio.reduce(
        (sum, item) => sum + Number(item.current_value),
        0
    )

    const sortPortfolio = portfolio.sort((a, b) => ((Number(b.amount) * Number(b.current_value)) - ((Number(a.amount) * Number(a.current_value)))))

    const topAssets = sortPortfolio.slice(0,4).map(
        item => ({
            name: item.asset.replace('USDT', ''),
            value: Number(item.current_value),
            amount: Number(item.amount),
            percentage: (
                Number(item.current_value) / totalValue * 100
            )
        })
    )

    const otherAssets = () => {
        const other = sortPortfolio.slice(4)
        let value = 0
        let amount = 0

        other.forEach(item => {
            value += Number(item.current_value)
            amount += Number(item.amount)
        })

        return {
            name: 'Other Assets',
            value: value,
            amount: amount,
            percentage: value / totalValue * 100
        }
    };

    const cryptoData = [...topAssets, otherAssets()];

    const allTimeVolume = allTimeSummary ?
        (Number(allTimeSummary.deposit)
        + Number(allTimeSummary.withdraw)
        + Number(allTimeSummary.buy)
        + Number(allTimeSummary.sell)
        + Number(allTimeSummary.exchange))
        : 0

    const currentPeriodVolume = activitySummary ?
        (Number(activitySummary.deposit)
        + Number(activitySummary.withdraw)
        + Number(activitySummary.buy)
        + Number(activitySummary.sell)
        + Number(activitySummary.exchange))
        : 0

    return (
        <div className="w-full flex flex-col rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-6 gap-5">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 rounded-[20px] bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] px-4 sm:px-5 py-4 sm:py-5 flex flex-col justify-between min-h-[140px] sm:min-h-[154px] gap-4 sm:gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white">
                                <HiOutlineChartPie className="text-[18px] sm:text-[24px]" />
                            </div>

                            <h4 className="text-lg sm:text-2xl text-white font-medium">
                                Asset Allocation
                            </h4>
                        </div>
                    </div>
                    <div className='flex flex-col sm:flex-row items-center justify-center'>
                        {isLoadingAsset? (<RiLoaderLine
                                size={42}
                                className="text-white animate-spin"
                                />):
                            <>
                                <div className='w-full flex items-center justify-center'>
                                    <WalletSparkline data={cryptoData} totalValue={totalValue} COLORS={COLORS} />
                                </div>
                                <div className='w-full'>
                                    {cryptoData.length > 1 ?
                                        <ul>
                                            {cryptoData.map((asset, index) => (
                                                <li key={asset.name} className='flex flex-col gap-1 p-1'>
                                                    <div className='flex flex-row justify-between'>
                                                        <div className='flex flex-row justify-center gap-3'>
                                                            <div className='w-[12px] h-[12px] rounded-full' style={{backgroundColor: COLORS[index]}} />
                                                            <div className='flex flex-col text-sm'>
                                                                <h4 className='text-white'>{asset.name}</h4>
                                                                <p className='text-[#BBD7FF]'>${asset.value.toFixed(4)}</p>
                                                            </div>
                                                        </div>
                                                        <p className='text-white'>{asset.percentage.toFixed(2)}%</p>
                                                    </div>
                                                    {index <= 3 && <div className='w-full h-px bg-[rgba(255,255,255,.22)]'/>}
                                                </li>
                                            ))}
                                        </ul>
                                        :
                                        <div className='flex items-center justify-center'>
                                            <p className="text-[18px] sm:text-xl text-[#E0E0E0] text-center">You don’t have any cryptocurrencies in your portfolio yet</p>
                                        </div>
                                    }
                                </div>
                            </>
                        }
                    </div>
                    <div className='w-full h-[42px] sm:h-[52px] flex flex-row justify-center items-center gap-4 bg-black rounded-full cursor-pointer'>
                        <GrTransaction className='text-white text-[18px] sm:text-[22px]'/>
                        <button className='text-white sm:text-xl cursor-pointer'>Transactions</button>
                    </div>
                </div>
                <div className='flex-1 rounded-[20px] bg-white px-4 sm:px-5 py-4 sm:py-5 border border-[#DFE1E7]'>
                    <div className='flex flex-col gap-3'>
                        <div className='flex flex-row items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#429EFF] shrink-0">
                                        <PiBag className="text-[18px] text-white sm:text-[24px] " />
                                    </div>
                                    <h4 className='text-lg sm:text-2xl font-medium'>Transaction Overview</h4>
                                </div>
                                <div className="relative w-[90px] sm:w-[110px] h-[36px] sm:h-[46px] border border-[#429EFF] rounded-full shrink-0">
                                    <select
                                        className="w-full h-full rounded-full border border-white bg-transparent appearance-none pl-3 pr-8 sm:pr-10 text-sm sm:text-base text-black outline-none"
                                        value={days}
                                        onChange={(e) => setDays(e.target.value as Period)}
                                    >
                                        <option value="1d" className="text-black">
                                            Day
                                        </option>

                                        <option value="7d" className="text-black">
                                            Week
                                        </option>

                                        <option value="30d" className="text-black">
                                            Month
                                        </option>
                                    </select>

                                    <IoIosArrowDown
                                        size={18}
                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-black pointer-events-none"
                                    />
                                </div>
                        </div>
                        <div className='flex flex-col gap-3'>
                            {isLoadingTransaction? (
                                <div className='flex items-center justify-center'>
                                    <RiLoaderLine
                                    size={42}
                                    className="text-black animate-spin"
                                    />
                                </div>):
                                <>
                                    <div className='flex flex-row items-center justify-between'>
                                        <h4 className='text-[40px] font-medium'>${allTimeVolume}</h4>
                                        <p className='text-[#DF1C41]'>+${currentPeriodVolume} <span className='text-[#6F6F6F]'>{currentDate[days]}</span> </p>
                                    </div>
                                    <div className='w-full h-full'>
                                        <TransactionOverviewChart data={activitySummary} currentPeriodVolume={currentPeriodVolume}/>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WalletOverviewCard