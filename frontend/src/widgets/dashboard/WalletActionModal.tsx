import { FiDollarSign } from "react-icons/fi"
import { LuWallet } from "react-icons/lu"
import {IoMdClose} from "react-icons/io";
import {useState} from "react";
import walletApi from "../../features/wallet/api/walletApi.ts";
import {RiLoaderLine} from "react-icons/ri";
import {BiErrorCircle} from "react-icons/bi";

type WalletActionModalProps = {
    balance: string
    walletActionModal: 'deposit' | 'withdraw'
    setWalletActionModal: React.Dispatch<React.SetStateAction<'deposit' | 'withdraw'>>
    onClose: () => void
}

const WalletActionModal = ({balance, walletActionModal, setWalletActionModal, onClose}: WalletActionModalProps) => {

    const [amountDeposit, setAmountDeposit] = useState('0')
    const [amountWithdraw, setAmountWithdraw] = useState('0')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDeposit = async () => {
        setError(null)

        const amount = Number(amountDeposit)

        if (Number.isNaN(amount)) {
            setError('Amount must be a valid number')
            return
        }

        if (amount <= 0) {
            setError('Amount must be greater than 0')
            return
        }

        if (amount < 10) {
            setError('Minimum deposit is 10 USDT')
            return
        }

        try {
            setIsLoading(true)

            let idempotencyKey = sessionStorage.getItem('deposit_idempotency')

            if (!idempotencyKey) {
                idempotencyKey = crypto.randomUUID()
                sessionStorage.setItem('deposit_idempotency', idempotencyKey)
            }

            const data = await walletApi.deposit({amount: amountDeposit, idempotency_key: idempotencyKey})

            sessionStorage.removeItem('deposit_idempotency')

            if (data.checkout_url){
                window.location.href = data.checkout_url
            }
        } catch (error) {
            console.error(error)
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }

    }

    const maxWithdraw = (Number(balance) / 1.01) .toFixed(2)

    const handleWithdraw = async () => {
        setError(null)

        const amount = Number(amountWithdraw)

        if (Number.isNaN(amount)) {
            setError('Amount must be a valid number')
            return
        }

        if (amount <= 0) {
            setError('Amount must be greater than 0')
            return
        }

        if (amount < 10) {
            setError('Minimum withdraw is 10 USDT')
            return
        }

        if (amount > Number(maxWithdraw)) {
            setError('Insufficient balance')
            return
        }

        try {
            setIsLoading(true)

            let idempotencyKey = sessionStorage.getItem('withdraw_idempotency')

            if (!idempotencyKey) {
                idempotencyKey = crypto.randomUUID()
                sessionStorage.setItem('withdraw_idempotency', idempotencyKey)
            }

            await walletApi.withdraw({amount: amountWithdraw, idempotency_key: idempotencyKey})

            sessionStorage.removeItem('withdraw_idempotency')
            window.location.reload()
        } catch (error) {
            console.error(error)
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return(
        <div className='fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
            <div className='w-[500px] flex flex-col gap-4 bg-white rounded-[30px] p-5'>
                {isLoading ? (
                    <div className='w-full h-[400px] flex items-center justify-center'>
                        <RiLoaderLine size={52} className='text-[#666D80] animate-spin' />
                    </div>):
                    <>
                        <div className='flex flex-row items-center justify-between'>
                            <div className='flex flex-row items-center gap-2'>
                                <div className='w-[54px] h-[54px] flex justify-center items-center bg-[#429EFF] rounded-full'>
                                    <LuWallet size={28} className='text-white'/>
                                </div>
                                <div>
                                    <h4 className='text-[24px] font-medium'>USDT Wallet</h4>
                                    <p className='text-[#666D80]'>Manage your balance</p>
                                </div>
                            </div>
                            <button className={'w-[44px] h-[44px] flex justify-center items-center border border-[#DFE1E7] rounded-full cursor-pointer'} onClick={onClose}>
                                <IoMdClose size={18} />
                            </button>
                        </div>
                        <div className='w-[460px] h-[50px] flex flex-row items-center justify-center gap-3 rounded-full'>
                            <button className={`w-[230px] h-[48px] rounded-full cursor-pointer ${walletActionModal === 'deposit' && 'text-white bg-[#429EFF]'}`} onClick={() => {setWalletActionModal('deposit'); setAmountDeposit('0'); setError(null)}}>Deposit</button>
                            <button className={`w-[230px] h-[48px] rounded-full cursor-pointer ${walletActionModal === 'withdraw' && 'text-white bg-[#429EFF]'}`} onClick={() => {setWalletActionModal('withdraw'); setAmountWithdraw('0'); setError(null)}}>Withdraw</button>
                        </div>
                        {walletActionModal === 'deposit'  && (
                            <>
                                <div className='w-[460px] flex flex-col justify-center gap-2 border border-[#DFE1E7] p-4 rounded-[20px]'>
                                    <p className='text-[#666D80]'>Current Balance</p>
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='w-[44px] h-[44px] flex justify-center items-center bg-[#429EFF] rounded-full'>
                                            <FiDollarSign size={24} className='text-white'/>
                                        </div>
                                        <h4  className='text-[28px] font-medium'>{balance}</h4>
                                        <span className='text-[#666D80]'>USDT</span>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-center gap-2'>
                                    <p>Amount</p>
                                    {(error) &&
                                        <div className="w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3]">
                                            <BiErrorCircle size={16}
                                                           className="ml-[10px] text-[#DF1C41]"
                                            />
                                            <p className="text-[14px] font-medium">
                                                {error}
                                            </p>
                                        </div>
                                    }
                                    <div className='w-[460px] h-[62px] relative border border-[#DFE1E7] text-[#666D80] rounded-[20px]'>
                                        <input value={amountDeposit} className={`w-full h-full rounded-[20px] outline-none p-4 ${error && 'border-1 border-red-400'}`} type="text" placeholder='Enter Amount' onChange={(e) => {setAmountDeposit(e.target.value); setError(null)}}/>
                                        <span className='absolute top-4.5 right-3'>USDT</span>
                                    </div>
                                    <p className='text-[#666D80]'>Minimum deposit: 10 USDT</p>
                                </div>
                                <button className='w-[460px] h-[52px] bg-[#429EFF] text-white rounded-full cursor-pointer' onClick={() => handleDeposit()} disabled={isLoading}>Continue to Deposit</button>
                            </>
                        )}

                        {walletActionModal === 'withdraw'  && (
                            <>
                                <div className='w-[460px] flex flex-col justify-center gap-2 border border-[#DFE1E7] p-4 rounded-[20px]'>
                                    <p className='text-[#666D80]'>Available Balance</p>
                                    <div className='flex flex-row items-center gap-3'>
                                        <div className='w-[44px] h-[44px] flex justify-center items-center bg-[#429EFF] rounded-full'>
                                            <FiDollarSign size={24} className='text-white'/>
                                        </div>
                                        <h4  className='text-[28px] font-medium'>{balance}</h4>
                                        <span className='text-[#666D80]'>USDT</span>
                                    </div>
                                </div>
                                <div className='flex flex-col justify-center gap-2'>
                                    <p>Amount</p>
                                    {(error) &&
                                        <div className="w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3]">
                                            <BiErrorCircle size={16}
                                                           className="ml-[10px] text-[#DF1C41]"
                                            />
                                            <p className="text-[14px] font-medium">
                                                {error}
                                            </p>
                                        </div>
                                    }
                                    <div className='w-[460px] h-[62px] relative border border-[#DFE1E7] text-[#666D80] rounded-[20px]'>
                                        <input value={amountWithdraw} className={`w-full h-full rounded-[20px] outline-none p-4 ${error && 'border-1 border-red-400'}`} type="text" placeholder='Enter Amount' onChange={(e) => {setAmountWithdraw(e.target.value); setError(null)}}/>
                                        <span className='absolute top-4.5 right-16'>USDT</span>
                                        <span className='absolute top-5.5 right-13 w-px h-[20px] bg-[#DFE1E7] ' ></span>
                                        <button className='w-[50px] absolute top-4.5 right-0.5 text-[#429EFF] cursor-pointer' onClick={() => {setAmountWithdraw(maxWithdraw); setError(null)}}>Max</button>
                                    </div>
                                    <div>
                                        <p className='text-[#666D80]'>Available to withdraw: {maxWithdraw} USDT</p>
                                        <p className='text-[#666D80]'>You will receive {(Number(amountWithdraw)).toFixed(2)} USDT. A 1% withdrawal fee applies.</p>
                                        <p className='text-[#666D80]'>Minimum withdrawal: 10 USDT</p>
                                    </div>
                                </div>
                                <button className='w-[460px] h-[52px] bg-[#429EFF] text-white rounded-full cursor-pointer' onClick={() => handleWithdraw()} disabled={isLoading}>Confirm Withdrawal</button>
                            </>
                        )}
                    </>
                }
            </div>
        </div>
    )
}

export default WalletActionModal