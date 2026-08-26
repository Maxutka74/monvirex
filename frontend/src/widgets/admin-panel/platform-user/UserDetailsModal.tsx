import {type SetStateAction, useEffect, useState} from "react";
import adminApi, {type AdminPanelUser} from "../../../features/admin/api/adminApi.ts";
import {CgClose} from "react-icons/cg";
import {LuChartNoAxesColumnIncreasing, LuUserRound, LuWalletMinimal} from "react-icons/lu";
import { PiCoinsLight } from "react-icons/pi";

type UserDetailsModalProps = {
    setUserDetailsModalOpen: React.Dispatch<SetStateAction<boolean>>
    id?: number
}


const UserDetailsModal = ({setUserDetailsModalOpen, id}: UserDetailsModalProps) => {
    const [userData, setUserData] = useState<AdminPanelUser>()

    useEffect(() => {
        if (!id) return;

        const userDetailData = async () => {
            try {
                const data = await adminApi.getAdminUserById(id)

                setUserData(data)
            } catch (e) {
                console.error(e)
            }
        }


        userDetailData()
    }, [id])

    const join_data = (join?: string) => {
        if (!join) return;

        const date = Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        }).format(new Date(join))

        const time = Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(join))

        return `${date} • ${time}`
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5'>
            <div className='max-w-[800px] w-full max-sm:max-h-[720px] max-sm:h-full overflow-y-auto flex flex-col gap-5 bg-white rounded-[20px] p-4'>
                <div className='flex flex-row justify-between gap-5'>
                    <div className='flex flex-row items-center gap-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md shrink-0'>
                            <LuUserRound size={22} />
                        </div>
                        <div className='flex flex-col justify-center font-medium'>
                            <h3 className='text-xl sm:text-2xl'>User Details</h3>
                            <p className='text-xs sm:text-sm text-gray-400'>Detailed information about the user</p>
                        </div>
                    </div>
                    <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#DFE1E7] sm:h-[48px] sm:w-[48px] cursor-pointer shrink-0' onClick={() => setUserDetailsModalOpen(false)}><CgClose size={24}/></button>
                </div>

                <div className='w-full border-b border-gray-100' />

                <div className='w-full flex flex-col gap-4 border border-gray-100 rounded-md p-4'>
                    <h4 className='text-xl font-medium'>User Information</h4>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row items-center border-b border-gray-100 pb-1'>
                            <span className='w-[120px] sm:w-[220px] text-gray-500'>ID</span>
                            <p className='flex-1 text-gray-600'>{userData?.id}</p>
                        </div>
                        <div className='flex flex-row items-center border-b border-gray-100 pb-1'>
                            <span className='w-[120px] sm:w-[220px] text-gray-500'>Email</span>
                            <p className='min-w-0 flex-1 text-gray-600'>{userData?.email}</p>
                        </div>
                        <div className='flex flex-row items-center border-b border-gray-100 pb-1'>
                            <span className='w-[120px] sm:w-[220px] text-gray-500'>First Name</span>
                            <p className='flex-1 text-gray-600'>{userData?.first_name}</p>
                        </div>
                        <div className='flex flex-row items-center border-b border-gray-100 pb-1'>
                            <span className='w-[120px] sm:w-[220px] text-gray-500'>Last Name</span>
                            <p className='flex-1 text-gray-600'>{userData?.last_name}</p>
                        </div>
                        <div className='flex flex-row items-center border-b border-gray-100 pb-1'>
                            <span className='w-[120px] sm:w-[220px] text-gray-500'>Status</span>
                            <div className='flex-1 flex'>
                                <p className={` text-gray-600 ${userData?.is_active === true ? 'text-green-500 bg-green-100': 'text-red-500 bg-red-100'} px-3 rounded-full`}>{userData?.is_active? 'Active': 'Inactive'}</p>
                            </div>
                        </div>
                        <div className='flex flex-row items-center'>
                            <span className='w-[120px] sm:w-[220px] text-gray-500'>Date Joined</span>
                            <p className='min-w-0 flex-1 text-gray-600'>{join_data(userData?.date_joined)}</p>
                        </div>
                    </div>
                </div>

                <div className='w-full flex flex-col gap-4 border border-gray-100 rounded-md p-3'>
                    <h4 className='text-xl font-medium'>User Statistics</h4>

                    <div className='w-full flex flex-col md:flex-row gap-3'>
                        <div className='flex flex-1 flex-row items-center border border-gray-100 gap-4 px-3 py-2 rounded-md'>
                            <div className='w-[44px] h-[44px] flex items-center justify-center text-blue-500 bg-blue-100 rounded-md'>
                                <LuWalletMinimal size={24} />
                            </div>
                            <div className='flex flex-col justify-center'>
                                <p className='text-gray-400 text-sm'>Wallet Balance</p>
                                <p className='text-[18px] font-medium'>{userData?.wallet_balance} USDT</p>
                            </div>
                        </div>
                        <div className='flex flex-1 flex-row items-center border border-gray-100 gap-4 px-3 py-2 rounded-md'>
                            <div className='w-[44px] h-[44px] flex items-center justify-center text-blue-500 bg-blue-100 rounded-md'>
                                <PiCoinsLight size={24} />
                            </div>
                            <div className='flex flex-col justify-center'>
                                <p className='text-gray-400 text-sm'>Crypto Holdings Count</p>
                                <p className='text-[18px] font-medium'>{userData?.crypto_holdings_count}</p>
                            </div>
                        </div>
                        <div className='flex flex-1 flex-row items-center border border-gray-100 gap-4 px-3 py-2 rounded-md'>
                            <div className='w-[44px] h-[44px] flex items-center justify-center text-blue-500 bg-blue-100 rounded-md'>
                                <LuChartNoAxesColumnIncreasing size={24} />
                            </div>
                            <div className='flex flex-col justify-center'>
                                <p className='text-gray-400 text-sm'>Total Trades Count</p>
                                <p className='text-[18px] font-medium'>{userData?.total_trades_count}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default UserDetailsModal