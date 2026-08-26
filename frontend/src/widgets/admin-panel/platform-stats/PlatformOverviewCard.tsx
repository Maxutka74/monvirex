import {useEffect, useState} from "react";
import adminApi, {type AdminPanelStats} from "../../../features/admin/api/adminApi.ts";
import { FiUsers } from "react-icons/fi";
import {LuWallet} from "react-icons/lu";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { AiOutlineDollarCircle } from "react-icons/ai";
import {ChartPie, Layers3, LayoutDashboard, ReceiptText, RefreshCw} from "lucide-react";


const PlatformOverviewCard = () => {
    const [informationUserAll, setInformationUserAll] = useState<AdminPanelStats>()
    const [updateLoading, setUpdateLoading] = useState<boolean>(false)

    useEffect(() => {
        const informationData = async () => {
            try {
                const informations = await adminApi.getAdminStats()

                setInformationUserAll(informations)
            } catch (e) {
                console.error(e)
            }
        }

        informationData()
    }, [])

    const updateAsset = async () => {
        setUpdateLoading(true)
        try {
            await adminApi.syncAssets()
        } catch (e) {
            console.error(e)
        } finally {
            setUpdateLoading(false)
        }
    }

    return (
        <div className="w-full h-full flex flex-col rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-6">
            <div className='flex flex-row items-center justify-between mb-5'>
                <div className='flex flex-row items-center gap-4'>
                    <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md shrink-0'>
                        <LayoutDashboard size={22} />
                    </div>
                    <div className='flex flex-col justify-center font-medium'>
                        <h3 className='text-xl sm:text-2xl'>Platform Overview</h3>
                        <p className='text-xs sm:text-sm text-gray-400'>Key metrics and statistics</p>
                    </div>
                </div>
                <button className='w-[155px] sm:w-[150px] flex flex-row items-center gap-3 text-white bg-[#429EFF] px-3 py-2 rounded-md cursor-pointer text-sm sm:text-[16px]' onClick={() => updateAsset()}><span className={`${updateLoading && 'animate-spin'}`}><RefreshCw size={20} /></span> Sync Assets</button>
            </div>
            <div>
                <div className='flex flex-col md:flex-row items-center gap-4 mb-3'>
                    <div className='w-full flex-1 flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <FiUsers size={22} />
                        </div>
                        <div className='flex flex-col font-medium'>
                            <h4 className='text-[15px]'>Total Users</h4>
                            <span>{informationUserAll?.total_users}</span>
                        </div>
                    </div>
                    <div className='w-full flex-1 flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <LuWallet size={22} />
                        </div>
                        <div className='flex flex-col font-medium'>
                            <h4 className='text-[15px]'>Total Wallet Balance</h4>
                            <span>{informationUserAll?.total_wallet_balance} <span className='text-sm'>USDT</span></span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row items-center gap-4 mb-3'>
                    <div className='w-full flex-1 flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <ReceiptText size={22} />
                        </div>
                        <div className='flex flex-col font-medium'>
                            <h4 className='text-[15px]'>Total Transactions (24h)</h4>
                            <span>{informationUserAll?.total_transactions_24h}</span>
                        </div>
                    </div>
                    <div className='w-full flex-1 flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <LiaExchangeAltSolid size={22} />
                        </div>
                        <div className='flex flex-col font-medium'>
                            <h4 className='text-[15px]'>Total Crypto Transactions (24h)</h4>
                            <span>{informationUserAll?.total_crypto_transaction_24h}</span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row items-center gap-4 mb-3'>
                    <div className='w-full flex-1 flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <AiOutlineDollarCircle size={22} />
                        </div>
                        <div className='flex flex-col font-medium'>
                            <h4 className='text-[15px]'>Total Crypto Value</h4>
                            <span>{informationUserAll?.total_crypto_value.slice(0,-4)} <span className='text-sm'>USDT</span></span>
                        </div>
                    </div>
                    <div className='w-full flex-1 flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <ChartPie size={22} />
                        </div>
                        <div className='flex flex-col font-medium'>
                            <h4 className='text-[15px]'>Total Portfolio Value</h4>
                            <span>{informationUserAll?.total_portfolio_value.slice(0,-4)} <span className='text-sm'>USDT</span></span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row items-center gap-4 border border-gray-100 rounded-md p-4'>
                    <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                        <Layers3 size={22} />
                    </div>
                    <div className='flex flex-col font-medium'>
                        <h4 className='text-[15px]'>Total Portfolio Snapshots</h4>
                        <span>{informationUserAll?.total_snapshots_count}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlatformOverviewCard