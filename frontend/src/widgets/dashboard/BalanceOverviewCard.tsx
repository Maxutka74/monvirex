import {IoCardOutline} from "react-icons/io5";
import {useEffect, useState} from "react";
import type {UserSummary} from "../../features/wallet/api/walletApi.ts";
import walletApi from "../../features/wallet/api/walletApi.ts";
import {LuArrowDownLeft} from "react-icons/lu";
import {IoIosArrowDown} from "react-icons/io";
import {RiLoaderLine, RiMoneyDollarCircleLine} from "react-icons/ri";
import {FiArrowUpRight} from "react-icons/fi";
import PortfolioHistoryCard from "./PortfolioHistoryCard.tsx";
import WalletActionModal from "./WalletActionModal.tsx";


const BalanceOverviewCard = () => {
    const [balance, setBalance] = useState('0.000')
    const [summary, setSummary] = useState<UserSummary | null>(null)
    const [days, setDays] = useState('7d')
    const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false)
    const [walletActionMode, setWalletActionMode] = useState<'deposit' | 'withdraw' >('deposit')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBalanceData = async () => {
            try {
                setIsLoading(true)

                const balanceData = await walletApi.getBalance()
                const symmaryData = await walletApi.getActivitySummary(days)

                setBalance(balanceData.balance)
                setSummary(symmaryData)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchBalanceData()
    }, [days])

    const periodText = days === '1d' ? 'today': days === '7d' ? 'this week': 'this month'

    const totalIncome = summary
        ? Number(summary.deposit) + Number(summary.sell)
        : 0;

    const depositModalAction = () => {
        setIsWalletModalOpen(!isWalletModalOpen)
        setWalletActionMode('deposit')
    }

    const withdrawModalAction = () => {
        setIsWalletModalOpen(!isWalletModalOpen)
        setWalletActionMode('withdraw')
    }

    const closeModalAction = () => {
        setIsWalletModalOpen(!isWalletModalOpen)
    }


    return (
        <div className='w-[920px] h-[500px] flex flex-col p-[20px] rounded-[30px] bg-[#FFFFFF]/60 gap-5'>
            <div className='flex flex-row justify-center items-center gap-5'>
                <div className='w-[430px] h-[154px] flex flex-col justify-center items-center rounded-[20px] p-5 bg-[#429EFF] gap-5'>
                    <div className='w-[390px] h-[48px] flex flex-row justify-between items-center'>
                        <div className='flex flex-row justify-center items-center gap-2'>
                            <div className='w-[44px] h-[44px] flex justify-center items-center rounded-full bg-white'>
                                <IoCardOutline size={24} />
                            </div>
                            <h4 className='text-[24px] text-white'>My Balance</h4>
                        </div>
                        <div className='relative w-[110px] h-[46px]'>
                            <select className='w-full h-full border-[1.5px] text-white border-white rounded-full appearance-none pl-4 cursor-pointer'
                                    value={days}
                                    onChange={(e) => setDays((e.target.value))}>
                                <option value="1d" className='text-black'>Day</option>
                                <option value="7d" className='text-black'>Week</option>
                                <option value="30d" className='text-black'>Month</option>
                            </select>
                            <IoIosArrowDown size={18} className='absolute left-20 bottom-3 text-white cursor-pointer pointer-events-none' />
                        </div>
                    </div>
                    <div className='w-[390px] h-[48px] flex flex-row justify-between items-center'>
                        <h2 className='flex flex-row justify-center items-center text-[40px] text-white font-medium'>${isLoading ? <RiLoaderLine size={28} className='animate-spin' />: balance}</h2>
                        <p className='text-[20px] flex items-center justify-center text-white font-medium gap-3'>{totalIncome ? `+$${totalIncome}`: '$0'} <span className='text-[18px]'>{periodText}</span></p>
                    </div>
                </div>
                <div className='w-[430px] h-[154px] rounded-[30px] p-5 border border-[#DFE1E7] bg-[#FFFFFF]/60'>
                    <div className='flex flex-row justify-center items-center gap-5 mb-[23px]'>
                        <div className='flex flex-row justify-center items-center gap-2'>
                            <div className='w-[44px] h-[44px] flex justify-center items-center rounded-full bg-[#429EFF]'>
                                <RiMoneyDollarCircleLine size={24} className='text-white'/>
                            </div>
                            <h5 className='text-[20px] font-medium'>Fast Action</h5>
                        </div>
                        <div className='flex flex-row justify-center items-center border-[1.5px] border-[#429EFF] rounded-[12px] gap-1 pt-1 pb-1 pl-2 pr-2'>
                            <div className='flex flex-row justify-center items-center gap-[4px]'>
                                <RiMoneyDollarCircleLine size={24}/>
                                <p className='text-[14px] font-medium'>USDT Wallet</p>
                            </div>
                            <h5 className='flex flex-row justify-center items-center text-[18px] font-medium'>${isLoading ? <RiLoaderLine size={18} className='text-black animate-spin' />: balance}</h5>
                        </div>
                    </div>
                    <div className='flex flex-row justify-center items-center gap-3'>
                        <div className='w-[189px] h-[42px] flex flex-row justify-center items-center gap-3 text-white font-medium bg-black rounded-full cursor-pointer' onClick={() => depositModalAction()}>
                            <button className='text-[14px] cursor-pointer'>Deposit</button>
                            <FiArrowUpRight size={18} />
                        </div>
                        <div className='w-[189px] h-[42px] flex flex-row justify-center items-center gap-3 text-white font-medium bg-[#429EFF] rounded-full cursor-pointer' onClick={() => withdrawModalAction()}>
                            <button className='text-[14px] cursor-pointer'>Withdraw</button>
                            <LuArrowDownLeft size={18} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='w-[880px] h-[286px]'>
                <PortfolioHistoryCard />
            </div>
            {isWalletModalOpen && <WalletActionModal balance={balance} walletActionModal={walletActionMode} setWalletActionModal={setWalletActionMode} onClose={closeModalAction} />}
        </div>
    )

}

export default BalanceOverviewCard;