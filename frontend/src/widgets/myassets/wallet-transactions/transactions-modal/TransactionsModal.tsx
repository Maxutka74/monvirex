import {type SetStateAction, useEffect, useState} from "react";
import { CgClose } from "react-icons/cg";
import { GoChecklist } from "react-icons/go";
import {PiCreditCardLight} from "react-icons/pi";
import {CiBitcoin, CiCircleCheck} from "react-icons/ci";
import { MdOutlineBallot } from "react-icons/md";
import {RiArrowDownLine, RiArrowUpLine} from "react-icons/ri";
import { FaExchangeAlt } from "react-icons/fa";
import walletApi, {type UserCryptoTransaction, type UserTransaction} from "../../../../features/wallet/api/walletApi.ts";
import {useStore} from "zustand/react";
import themeStore from "../../../../entities/theme/themeStore.tsx";

type TranscarionsModalProps = {
    setOpenTransactionModal: React.Dispatch<SetStateAction<boolean>>
}

const TransactionsModal = ({setOpenTransactionModal}: TranscarionsModalProps) => {
    const theme = useStore(themeStore, (state) => state.theme);

    const SimpleFilters = [
        {'name': 'All', icon: <MdOutlineBallot size={18} /> },
        {'name': 'Deposit', icon: <RiArrowDownLine size={18} className='text-green-500' /> },
        {'name': 'Withdraw', icon: <RiArrowUpLine size={18} className='text-red-500' /> }
    ]

    const CryptoFilters = [
        {'name': 'All', icon: <MdOutlineBallot size={18} /> },
        {'name': 'Buy', icon: <RiArrowDownLine size={18} className='text-green-500' /> },
        {'name': 'Sell', icon: <RiArrowUpLine size={18} className='text-red-500' /> },
        {'name': 'Exchange', icon: <FaExchangeAlt size={18} className='text-purple-400' /> }
    ]

    const [transactions, setTransactions] = useState<'simple' | 'crypto'>('simple')
    const [filters, setFilters] = useState('All')
    const [simpleTransactions, setSimpleTransactions] = useState<UserTransaction[]>([])
    const [cryptoTransactions, setCryptoTransactions] = useState<UserCryptoTransaction[]>([])

    useEffect(() => {
        const dataTransaction = async () => {
            try {
                const simpleTransactions = await walletApi.getTransactions()
                const cryptoTransactions = await walletApi.getCryptoTransactions()

                setSimpleTransactions(simpleTransactions.transactions)
                setCryptoTransactions(cryptoTransactions.transactions)
            } catch (e) {
                console.error(e)
            }
        }

        dataTransaction()
    }, []);

    const clearSimpleTransactions = simpleTransactions.map((item) => {
        const date = new Intl.DateTimeFormat("en", {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(item.created_at));
        const time = new Intl.DateTimeFormat("en", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date(item.created_at));
        const type = item.transaction_type.charAt(0).toUpperCase() + item.transaction_type.slice(1)
        const status = item.status.charAt(0).toUpperCase() + item.status.slice(1)

        return {
            'id': item.id,
            'date': date,
            'time': time,
            'type': type,
            'amount': item.amount,
            'status': status
        }
    })

    const clearCryptoTransactions = cryptoTransactions.map((item) => {
        const date = new Intl.DateTimeFormat("en", {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(new Date(item.created_at));
        const time = new Intl.DateTimeFormat("en", {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date(item.created_at));
        const type = item.transaction_type.charAt(0).toUpperCase() + item.transaction_type.slice(1)
        const amount = Number(item.crypto_amount).toFixed(6)
        const price = Number(item.usdt_amount).toFixed(2)
        const status = item.status.charAt(0).toUpperCase() + item.status.slice(1)

        return {
            'id': item.id,
            'date': date,
            'time': time,
            'type': type,
            'from_asset': item.from_asset,
            'pair': item.asset.slice(0,-4),
            'amount': amount,
            'price': price,
            'status': status
        }

    })

    const filteredTransactions = filters === 'All' ?
        clearSimpleTransactions :
        clearSimpleTransactions.filter((item) => (
            item.type === filters && item.status !== 'Cancelled'
        ))

    const filteredCryptoTransactions = filters === 'All' ?
        clearCryptoTransactions:
        clearCryptoTransactions.filter((item) => (
            item.type === filters && item.status !== 'Cancelled'
        ))

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-5 ${
            theme === 'dark' ? 'bg-black/70' : 'bg-black/40'
        }`}>
            <div className={`max-w-[800px] max-h-[650px] overflow-y-auto w-full rounded-[20px] p-4 ${
                theme === 'dark'
                    ? 'bg-[#020817] border border-[#123A70] shadow-[0_0_35px_rgba(21,151,255,0.15)] text-white'
                    : 'bg-white'
            }`}>
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-row items-center justify-between'>
                        <div className='flex flex-row items-center gap-4'>
                            <div className={`w-[42px] h-[42px] flex items-center justify-center rounded-[8px] shrink-0 ${
                                theme === 'dark'
                                    ? 'bg-[#1597FF] shadow-[0_0_15px_rgba(21,151,255,0.3)]'
                                    : 'bg-[#429EFF]'
                            }`}>
                                <GoChecklist size={28} className='text-white' />
                            </div>
                            <div>
                                <h4 className='text-[26px] font-semibold'>Transactions</h4>
                                <p className={theme === 'dark' ? 'text-[#7184A3]' : 'text-gray-500'}>
                                    View and manage your transaction history
                                </p>
                            </div>
                        </div>
                        <button className={`flex h-[40px] w-[40px] items-center justify-center rounded-full sm:h-[48px] sm:w-[48px] cursor-pointer shrink-0 ${
                            theme === 'dark'
                                ? 'border border-[#164B86] text-[#A8B8D0] hover:bg-[#0B1D38] hover:text-white'
                                : 'border border-[#DFE1E7]'
                        }`} onClick={() => setOpenTransactionModal(false)}><CgClose size={24}/></button>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                        <div className={`flex-1 p-4 rounded-[10px] cursor-pointer ${
                            theme === 'dark'
                                ? transactions === 'simple'
                                    ? 'border border-[#1597FF] bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)]'
                                    : 'border border-[#164B86] bg-[#071329]'
                                : `border border-[#DFE1E7] ${transactions === 'simple' ? 'bg-[#429EFF] shadow-sm' : ''}`
                        }`} onClick={() => {setTransactions('simple'); setFilters('All')}}>
                            <div className='flex flex-row items-center gap-4'>
                                <div className={`w-[42px] h-[42px] flex items-center justify-center rounded-[10px] shrink-0 ${
                                    transactions === 'simple'
                                        ? 'bg-white'
                                        : theme === 'dark'
                                            ? 'bg-[#1597FF]'
                                            : 'bg-[#429EFF]'
                                }`}>
                                    <PiCreditCardLight size={28} className={`${transactions === 'simple' ? 'text-[#429EFF]': 'text-white'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-[22px] font-medium ${transactions === 'simple' && 'text-white'}`}>Simple Transactions</h3>
                                    <p className={theme === 'dark' && transactions !== 'simple' ? 'text-[#7184A3]' : 'text-[#6F6F6F]'}>
                                        Deposits, withdrawals.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex-1 p-4 rounded-[10px] cursor-pointer ${
                            theme === 'dark'
                                ? transactions === 'crypto'
                                    ? 'border border-[#1597FF] bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)]'
                                    : 'border border-[#164B86] bg-[#071329]'
                                : `border border-[#DFE1E7] ${transactions === 'crypto' ? 'bg-[#429EFF] shadow-sm' : ''}`
                        }`} onClick={() => {setTransactions('crypto'); setFilters('All')}}>
                            <div className='flex flex-row items-center gap-4'>
                                <div className={`w-[42px] h-[42px] flex items-center justify-center rounded-[10px] shrink-0 ${
                                    transactions === 'crypto'
                                        ? 'bg-white'
                                        : theme === 'dark'
                                            ? 'bg-[#1597FF]'
                                            : 'bg-[#429EFF]'
                                }`}>
                                    <CiBitcoin size={28} className={`${transactions === 'crypto' ? 'text-[#429EFF]': 'text-white'}`} />
                                </div>
                                <div>
                                    <h3 className={`text-[22px] font-medium ${transactions === 'crypto' && 'text-white'}`}>Crypto Transactions</h3>
                                    <p className={theme === 'dark' && transactions !== 'crypto' ? 'text-[#7184A3]' : 'text-[#6F6F6F]'}>
                                        Buys, sells, exchanges.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2 '>
                        <p className={theme === 'dark' ? 'text-[#7184A3]' : 'text-[#6F6F6F]'}>
                            Filter by type
                        </p>
                        <div>
                            <ul className='flex flex-col sm:flex-row sm:items-center gap-4'>
                                {(transactions === 'simple' ? SimpleFilters : CryptoFilters).map((item) => (
                                    <li key={item.name} className={`max-w-[140px] flex flex-row items-center gap-2 text-sm rounded-[10px] p-3 cursor-pointer ${
                                        theme === 'dark'
                                            ? item.name === filters
                                                ? 'text-white bg-[#1597FF] border border-[#1597FF] shadow-[0_0_12px_rgba(21,151,255,0.2)]'
                                                : 'text-[#A8B8D0] bg-[#071329] border border-[#164B86]'
                                            : `border border-[#DFE1E7] ${item.name === filters ? 'text-white bg-[#429EFF]' : ''}`
                                    }`}
                                        onClick={() => setFilters(item.name)}
                                    >{item.icon}{item.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={`min-h-[300px] rounded-[10px] mt-2 overflow-hidden ${
                        theme === 'dark'
                            ? 'border border-[#164B86] bg-[#071329]'
                            : 'border border-[#DFE1E7]'
                    }`}>
                        <div className='max-h-[300px] overflow-x-auto overflow-y-auto'>
                            <table className='w-full min-w-[700px]'>
                                {transactions === 'simple' ?
                                    <>
                                        <thead className={`text-sm ${
                                            theme === 'dark'
                                                ? 'text-[#7184A3] bg-[#0B1D38]'
                                                : 'text-[#6F6F6F] bg-gray-50'
                                        }`}>
                                        <tr className={`border-b ${
                                            theme === 'dark' ? 'border-[#123A70]' : 'border-[#DFE1E7]'
                                        }`}>
                                                <th className='text-start pl-5 pt-3 pb-3'>Date</th>
                                                <th className='text-start'>Type</th>
                                                <th className='text-start'>Amount</th>
                                                <th className='text-start'>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {filteredTransactions.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={`h-[70px] border-b ${
                                                    theme === 'dark'
                                                        ? 'border-[#102747] bg-[#071329]'
                                                        : 'border-[#DFE1E7]'
                                                }`}
                                            >
                                                <td className='font-medium pl-5'>{item.date}<br />
                                                    <span className={`text-sm ${
                                                        theme === 'dark' ? 'text-[#60718D]' : 'text-[#6F6F6F]'}`}>
                                                        {item.time}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className='flex flex-row items-center gap-3'>
                                                        <div className={`w-[38px] h-[38px] flex items-center justify-center rounded-full ${
                                                            theme === 'dark'
                                                                ? item.type === 'Deposit'
                                                                    ? 'bg-[#0B2E28]'
                                                                    : 'bg-[#2A0D18]'
                                                                : item.type === 'Deposit'
                                                                    ? 'bg-green-100'
                                                                    : 'bg-red-100'
                                                        }`}>
                                                            {item.type === 'Deposit' ? (
                                                                <RiArrowDownLine size={20} className='text-green-500' />
                                                            ):
                                                                <RiArrowUpLine size={20} className='text-red-500' />
                                                            }
                                                        </div>
                                                        <p>{item.type}</p>
                                                    </div>
                                                </td>
                                                <td className={`font-semibold ${item.type === 'Deposit' ? 'text-green-500': 'text-red-500'}`}>{item.type === 'Deposit'? `+${item.amount}`: `-${item.amount}`} USDT</td>
                                                <td>
                                                    <div className={`max-w-[135px] flex flex-row items-center justify-center gap-2 rounded-[10px] px-3 py-1 ${
                                                        item.status === 'Pending'
                                                            ? theme === 'dark'
                                                                ? 'text-[#A78BFA] bg-[#211A3A] border border-[#4C3A78]'
                                                                : 'text-purple-500 bg-purple-100'
                                                            : item.status === 'Cancelled'
                                                                ? theme === 'dark'
                                                                    ? 'text-[#DF1C41] bg-[#2A0D18] border border-[#7A1F35]'
                                                                    : 'text-red-500 bg-red-100'
                                                                : theme === 'dark'
                                                                    ? 'text-[#40C4AA] bg-[#0B2E28] border border-[#176B59]'
                                                                    : 'text-green-500 bg-green-100'
                                                    }`}>
                                                        <CiCircleCheck size={20} />
                                                        <p>{item.status}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </>
                                    :
                                    <>
                                        <thead className={`text-sm ${
                                            theme === 'dark'
                                                ? 'text-[#7184A3] bg-[#0B1D38]'
                                                : 'text-[#6F6F6F] bg-gray-50'
                                        }`}>
                                        <tr className={`border-b ${
                                            theme === 'dark' ? 'border-[#123A70]' : 'border-[#DFE1E7]'
                                        }`}>
                                            <th className='text-start pl-5 pt-3 pb-3'>Date</th>
                                            <th className='text-start'>Type</th>
                                            <th className='text-start'>Pair</th>
                                            <th className='text-start'>Amount</th>
                                            <th className='text-start'>Value</th>
                                            <th className='text-start'>Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredCryptoTransactions.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={`h-[70px] border-b ${
                                                    theme === 'dark'
                                                        ? 'border-[#102747] bg-[#071329]'
                                                        : 'border-[#DFE1E7]'
                                                }`}
                                            >
                                                <td className='font-medium pl-5'>{item.date}<br /><span className='text-sm text-[#6F6F6F]'>{item.time}</span></td>
                                                <td>
                                                    <div className='flex flex-row items-center gap-3'>
                                                        <div className={`w-[38px] h-[38px] flex items-center justify-center rounded-full ${
                                                            theme === 'dark'
                                                                ? item.type === 'Buy'
                                                                    ? 'bg-[#0B2E28]'
                                                                    : item.type === 'Sell'
                                                                        ? 'bg-[#2A0D18]'
                                                                        : 'bg-[#24183F]'
                                                                : item.type === 'Buy'
                                                                    ? 'bg-green-100'
                                                                    : item.type === 'Sell'
                                                                        ? 'bg-red-100'
                                                                        : 'bg-purple-100'
                                                        }`}>
                                                            {item.type === 'Buy' ? (
                                                                    <RiArrowDownLine size={20} className='text-green-500' />
                                                                ): item.type === 'Sell' ? (
                                                                    <RiArrowUpLine size={20} className='text-red-500' />
                                                                ): <FaExchangeAlt size={18} className='text-purple-400' />
                                                            }
                                                        </div>
                                                        <p>{item.type}</p>
                                                    </div>
                                                </td>
                                                <td className='font-medium'>{item.from_asset ? `${item.from_asset.slice(0,-4)} ⇄ ${item.pair}`: item.pair}</td>
                                                <td>{item.amount}</td>
                                                <td className='font-semibold'>{item.price} USDT</td>
                                                <td>
                                                    <div className={`max-w-[135px] flex flex-row items-center justify-center gap-2 rounded-[10px] px-3 py-1 ${
                                                        item.status === 'Pending'
                                                            ? theme === 'dark'
                                                                ? 'text-[#A78BFA] bg-[#211A3A] border border-[#4C3A78]'
                                                                : 'text-purple-500 bg-purple-100'
                                                            : item.status === 'Cancelled'
                                                                ? theme === 'dark'
                                                                    ? 'text-[#DF1C41] bg-[#2A0D18] border border-[#7A1F35]'
                                                                    : 'text-red-500 bg-red-100'
                                                                : theme === 'dark'
                                                                    ? 'text-[#40C4AA] bg-[#0B2E28] border border-[#176B59]'
                                                                    : 'text-green-500 bg-green-100'
                                                    }`}>
                                                        <CiCircleCheck size={20} />
                                                        <p>{item.status}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </>
                                }
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionsModal