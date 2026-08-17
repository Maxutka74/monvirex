import {RiShoppingCartLine} from "react-icons/ri";
import {CgClose} from "react-icons/cg";
import {type SetStateAction, useEffect, useState} from "react";
import { IoMdArrowDown } from "react-icons/io";
import walletApi from "../../../features/wallet/api/walletApi.ts";
import tradeApi from "../../../features/trade/api/tradeApi.ts";
import SuccessPaymentModal from "../../myassets/trading/SuccessPaymentModal.tsx";
import {AiOutlineDollarCircle} from "react-icons/ai";
import {LuHandCoins} from "react-icons/lu";
import {BiErrorCircle} from "react-icons/bi";

type TradingActionsProps = {
    setOpenTradeActionModal: React.Dispatch<SetStateAction<boolean>>
    dataActions: {
        type: 'Buy' | 'Sell',
        interval: string,
        symbol: string,
        name: string,
        crypto_icon: string,
        current_price: string,
        current_amount: string,
    }
}

const TradingActions = ({setOpenTradeActionModal, dataActions}: TradingActionsProps) => {
    const [balance, setBalance] = useState('');
    const [amount, setAmount] = useState<string>('0');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(false);
    const [openSuccessModal, setOpenSuccessModal] = useState(false);

    useEffect(() => {
        const getBalanceData = async () => {
            try {
                const balanceData = await walletApi.getBalance()

                setBalance(balanceData.balance);
            } catch (e) {
                console.error(e);
            }
        }

        getBalanceData();
    }, [])

    const confirmAction = async () => {
        const currentAmount = Number(amount)

        if (currentAmount <= 0) {
            setIsError(true);
            setErrorMessage('Amount must be greater than 0');
            return;
        }

        if (dataActions.type === 'Buy' && currentAmount > Number(balance)) {
            setIsError(true);
            setErrorMessage('Insufficient USDT balance')
            return;
        }

        if (dataActions.type === 'Sell' && currentAmount > Number(dataActions?.current_amount)) {
            setIsError(true);
            setErrorMessage('Insufficient crypto balance')
            return;
        }

        if (dataActions.type === 'Buy') {
            const buyAsset = async () => {
                try {
                    await tradeApi.buyAsset({
                        symbol: dataActions.symbol,
                        amount_usdt: amount,
                        interval: dataActions.interval,
                        type_buy: 'trade'
                    })

                    setOpenTradeActionModal(true)
                    setOpenSuccessModal(true);
                } catch (e) {
                    setIsError(true);
                    setErrorMessage('Something went wrong. Please try again later.')
                }
            }
            buyAsset()
        }

        if (dataActions.type === 'Sell') {
            const sellAsset = async () => {
                try {
                    await tradeApi.sellAsset({
                        symbol: dataActions.symbol,
                        amount_crypto: amount,
                        interval: dataActions.interval,
                        type_sell: 'trade'
                    })

                    setOpenSuccessModal(true);
                } catch (e) {
                    setIsError(true);
                    setErrorMessage('Something went wrong. Please try again later.')
                }
            }
            sellAsset()
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5'>
            <div className='max-w-[600px] w-full bg-white p-5 rounded-xl'>
                <div className='flex flex-col gap-2'>
                    <div className='flex flex-col items-center justify-center'>
                        <div className='w-full flex items-center justify-end'>
                            <button className='h-[20px] w-[20px] flex items-center justify-center rounded-full sm:h-[28px] sm:w-[28px] text-gray-500 cursor-pointer' onClick={() => setOpenTradeActionModal(false)}><CgClose size={24}/></button>
                        </div>
                        <div className='w-[56px] h-[56px] flex items-center justify-center text-white bg-[#429EFF] rounded-full'>
                            {dataActions.type === 'Buy' ? (
                                <RiShoppingCartLine size={25} />
                            ):
                                <LuHandCoins size={25} />
                            }
                        </div>
                    </div>
                    <div className='flex flex-col items-center gap-1'>
                        <h3 className='text-2xl font-medium'>{dataActions.type === 'Buy'? 'Buy': 'Sell'}</h3>
                        <p className='text-gray-400'>
                            {dataActions.type === 'Buy' ? 'Buy cryptocurrency with USDT': 'Sell your cryptocurrency for USDT'}
                        </p>
                    </div>
                </div>
                <div className='flex flex-col gap-3'>
                    <div className='w-full flex flex-col justify-center gap-3 font-medium'>
                        <span className='text-[18px]'>{dataActions.type === 'Buy' ? 'You pay': 'You sell'}</span>
                        {isError &&
                            <div className="w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-1">
                                <BiErrorCircle size={16}
                                               className="ml-[10px] text-[#DF1C41]"
                                />
                                <p className="text-[14px] font-medium">
                                    {errorMessage}
                                </p>
                            </div>
                        }
                        <div className='relative'>
                            <input value={amount} type="number" className='w-full h-16 outline-none border border-gray-300 rounded-lg p-4 text-xl
                                [&::-webkit-inner-spin-button]:appearance-none' onChange={(e) => setAmount(e.target.value)}/>
                            <div className='absolute top-4 right-4 flex flex-row items-center gap-4'>
                                <span className='text-[18px]'>{dataActions.type === 'Buy' ? 'USDT': dataActions.name}</span>
                                <button className='text-[#429EFF] border border-gray-200 px-2 py-1 rounded-lg cursor-pointer' onClick={() => setAmount(dataActions.type === 'Buy'? balance: dataActions.current_amount.slice(0,8))}>MAX</button>
                            </div>
                        </div>
                        <p className='text-end text-gray-400 font-normal'>Available: {dataActions.type === 'Buy'? balance: dataActions.current_amount.slice(0,8)} <span>{dataActions.type === 'Buy'? 'USDT': dataActions.name}</span></p>
                    </div>
                </div>
                <div className='flex items-center justify-center text-gray-500 text-center my-3'>
                    <IoMdArrowDown size={28} />
                </div>
                <div className='flex flex-col gap-3'>
                    <div className='w-full flex flex-col justify-center gap-3 font-medium'>
                        <span className='text-[18px]'>You Receive</span>
                        <div className='w-full h-20 flex flex-row items-center justify-between border border-[#D7E5FF] bg-[#F7FAFF] rounded-lg p-4 text-xl'>
                            <div className='flex flex-row items-center gap-4 font-medium'>
                                {dataActions.type === 'Buy'? (
                                    <>
                                        <img className='w-[38px] h-[38px]' src={dataActions.crypto_icon} alt="Crypto Icon"/>
                                        <div className='flex flex-col'>
                                            <span>{dataActions.name}</span>
                                            <span className='text-sm text-gray-400'>{dataActions.symbol}</span>
                                        </div>
                                    </>
                                ): (
                                    <div className='flex flex-row items-center justify-center gap-3'>
                                        <AiOutlineDollarCircle size={38}/>
                                        <span>USDT</span>
                                    </div>
                                    )}
                            </div>
                            <div className='flex flex-col items-end '>
                                <p>{dataActions.type === 'Buy' ? Number((Number(amount) / Number(dataActions.current_price)).toFixed(6)) >= 0? Number((Number(amount) / Number(dataActions.current_price)).toFixed(6)):  0: Number((Number(amount) * Number(dataActions.current_price)).toFixed(2)) > 0 ? `${(Number(amount) * Number(dataActions.current_price)).toFixed(2)} $`: `${0} $`} <span className='text-sm'>{dataActions.type === 'Buy' && dataActions.name}</span></p>
                                <p className='text-sm text-gray-400'>≈ ${dataActions.type === 'Buy' ? Number(Number(amount).toFixed(2)) >= 0? Number(amount).toFixed(2): 0: Number((Number(amount) * Number(dataActions.current_price)).toFixed(2)) >= 0 ? (Number(amount) * Number(dataActions.current_price)).toFixed(2): 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-between gap-6 font-medium mt-8'>
                    <button className='min-h-[52px] flex-1 cursor-pointer border border-gray-200 rounded-[10px]' onClick={() => setOpenTradeActionModal(false)}>Cancel</button>
                    <button className='min-h-[52px] flex-1 cursor-pointer text-white bg-[#429EFF] rounded-[10px]' onClick={() => confirmAction()} >Confirm {dataActions.type === 'Buy' ? dataActions.type: 'Sell'}</button>
                </div>
            </div>
            {openSuccessModal && (
                <SuccessPaymentModal type={dataActions.type} receiveAmount={dataActions.type === 'Buy'? (Number(amount) / Number(dataActions.current_price)).toFixed(6): (Number(amount) * Number(dataActions.current_price)).toFixed(6)} receiveCurrency={dataActions.type === 'Buy'? dataActions.symbol: 'USDT'} />
            )}
        </div>
    )
}

export default TradingActions;