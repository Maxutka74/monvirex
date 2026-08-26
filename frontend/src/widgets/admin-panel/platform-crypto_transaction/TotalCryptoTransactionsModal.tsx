import {type SetStateAction, useEffect, useState} from "react";
import adminApi from "../../../features/admin/api/adminApi.ts";
import {CgClose} from "react-icons/cg";
import {VscSearch} from "react-icons/vsc";
import {MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight} from "react-icons/md";
import {LiaExchangeAltSolid} from "react-icons/lia";


type CryptoTransactionFormatData = {
    id: string
    email: string
    asset: string
    type: string
    crypto_amount: string
    amount: string
    status: string
    joined: string
}

type TotalCryptoTransactionsModalProps = {
    setCryptoTransactionModalOpen: React.Dispatch<SetStateAction<boolean>>
    tableFormatingData: CryptoTransactionFormatData[]
    allPages: number

}

const TotalCryptoTransactionsModal = ({setCryptoTransactionModalOpen, tableFormatingData, allPages}: TotalCryptoTransactionsModalProps) => {
    const [totalCryptoTransactionAll, setTotalCryptoTransactionAll] = useState<CryptoTransactionFormatData[]>(tableFormatingData);
    const [searchInput, setSearchInput] = useState("");
    const [searchTotal, setSearchTotal] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const timeoutInput = setTimeout(async () => {
            if (!searchInput) {
                setCurrentPage(0);
                setTotalCryptoTransactionAll(tableFormatingData)
                setSearchTotal(null)
                return;
            }

            try {
                const searchCryptoTransaction = await adminApi.getAdminCryptoTransactions(currentPage+1, searchInput)

                const formatData = searchCryptoTransaction.results.map((transaction) => ({
                    id: transaction.id.slice(0,8)+'...',
                    email: transaction.user_email,
                    asset: transaction.asset.slice(0,-4),
                    type: transaction.transaction_type.toUpperCase(),
                    crypto_amount: transaction.crypto_amount.slice(0,-4),
                    amount: transaction.usdt_amount.slice(0,-4),
                    status: (transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)),
                    joined: Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }).format(new Date(transaction.created_at))
                }))

                setTotalCryptoTransactionAll(formatData)
                setSearchTotal(searchCryptoTransaction.count)
            } catch (e) {
                console.error(e);
            }

        }, 500)

        return () => {
            clearTimeout(timeoutInput)
        }

    }, [searchInput, searchInput && currentPage])

    const paginatedTransactions = async (page: number) => {
        try {
            const cryptoTransactionData = await adminApi.getAdminCryptoTransactions(page)

            const formatData = cryptoTransactionData.results.map((transaction) => ({
                id: transaction.id.slice(0,8)+'...',
                email: transaction.user_email,
                asset: transaction.asset.slice(0,-4),
                type: transaction.transaction_type.toUpperCase(),
                crypto_amount: transaction.crypto_amount.slice(0,-4),
                amount: transaction.usdt_amount.slice(0,-4),
                status: (transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)),
                joined: Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                }).format(new Date(transaction.created_at))
            }))

            setTotalCryptoTransactionAll(formatData)
        } catch (error) {
            console.log(error)
        }
    }

    const totalPage = Math.ceil((searchTotal ?? allPages) / 5)

    const paginatedPages = totalCryptoTransactionAll

    const pagesToDisplay = () => {
        const page = currentPage + 1

        if (totalPage <= 3) {
            return Array.from({length: totalPage}, (_, i) => i + 1)
        }

        let pageList = []

        pageList.push(1)

        if (page <= 2) {
            pageList.push(2)
            pageList.push(3)
            pageList.push('...')
        } else if (page >= totalPage - 1) {
            pageList.push('...')
            pageList.push(totalPage - 2)
            pageList.push(totalPage - 1)
        } else {
            pageList.push('...')
            pageList.push(page - 1)
            pageList.push(page)
            pageList.push(page + 1)
            pageList.push('...')
        }

        if (totalPage > 1) {
            pageList.push(totalPage)
        }

        return pageList
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5'>
            <div className='max-w-[1150px] overflow-y-auto w-full bg-white rounded-[20px] p-4'>
                <div className='flex flex-row justify-between gap-5 mb-5'>
                    <div className='flex flex-row items-center gap-4'>
                        <div className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                            <LiaExchangeAltSolid size={22} />
                        </div>
                        <div className='flex flex-col justify-center font-medium'>
                            <h3 className='text-xl sm:text-2xl'>All Crypto Transactions</h3>
                            <p className='text-xs sm:text-sm text-gray-400'>Latest crypto transactions</p>
                        </div>
                    </div>
                    <button className='flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#DFE1E7] sm:h-[48px] sm:w-[48px] cursor-pointer shrink-0' onClick={() => setCryptoTransactionModalOpen(false)}><CgClose size={24}/></button>
                </div>
                <div className='relative max-w-[400px]'>
                    <VscSearch size={20} className='absolute top-3 left-2.5' />
                    <input value={searchInput} className='w-full h-[44px] outline-none border border-gray-200 rounded-lg px-10 py-3 mb-5' type="text" placeholder='Search users by id or email...' onChange={(e) => setSearchInput(e.target.value)}/>
                </div>
                <div className='w-full overflow-x-auto border border-gray-200 rounded-lg'>
                    <table className='w-full min-w-[1100px]'>
                        <thead>
                        <tr className='h-[60px] bg-gray-300/60'>
                            <th className='px-4 py-3'>ID</th>
                            <th>Email</th>
                            <th className='px-4 py-3'>Asset</th>
                            <th className='px-4 py-3'>Type</th>
                            <th className='px-4 py-3'>Crypto Amount</th>
                            <th className='px-4 py-3'>Amount</th>
                            <th className='px-4 py-3'>Status</th>
                            <th className='px-4 py-3'>Created At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedPages.map((transaction) => (
                            <tr className='h-[60px] border-t border-gray-200' key={transaction.id}>
                                <td className='max-w-[80px] px-4'>{transaction.id}</td>
                                <td className='text-center'>{transaction.email}</td>
                                <td className='text-center'>{transaction.asset}</td>
                                <td className='flex justify-center pt-5'>
                                    <div className='text-sm flex justify-center rounded-full text-blue-500 bg-blue-100 px-4'>
                                        {transaction.type}
                                    </div>
                                </td>
                                <td className='text-center'>{transaction.crypto_amount}</td>
                                <td className='text-center'>{transaction.amount} USDT</td>
                                <td className='flex justify-center pt-5'>
                                    <div
                                        className={`w-[80px] text-sm flex justify-center rounded-full ${transaction.status === 'Completed' ? 'text-green-500 bg-green-100'
                                            : transaction.status === 'Cancelled' ? 'text-red-500 bg-red-100'
                                                : 'text-purple-500 bg-purple-100'}`}>
                                        {transaction.status}
                                    </div>
                                </td>
                                <td className='text-center'>{transaction.joined}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className='flex flex-col md:flex-row items-center justify-between mt-4'>
                    <p className='font-medium mb-3'>Showing page {totalPage === 0 ? currentPage: currentPage+1} of {totalPage}</p>
                    <div className='max-w-full flex flex-row items-center gap-2 '>
                        <button className={`w-[36px] h-[36px] flex justify-center items-center border border-gray-200 rounded-md cursor-pointer ${currentPage + 1 === 1 && 'pointer-events-none cursor-not-allowed'}`} onClick={() => {
                            if (!searchInput) {paginatedTransactions(currentPage)} setCurrentPage(currentPage => currentPage - 1);
                        }}><MdOutlineKeyboardArrowLeft size={23} /></button>

                        <div className='flex sm:hidden w-[36px] h-[36px] justify-center items-center border border-gray-200 bg-[#429EFF] text-white font-medium rounded-md'>
                            {currentPage + 1}
                        </div>

                        <div className='hidden sm:flex flex-row items-center gap-3'>
                            {pagesToDisplay().map((item, index) => (
                                <button key={`${item} - ${index}`} className={`w-[36px] h-[36px] flex justify-center items-center border border-gray-200 font-medium rounded-md cursor-pointer ${typeof item === 'number' ? currentPage === item - 1 && 'bg-[#429EFF] text-white': 'pointer-events-none cursor-not-allowed'}
                                 `}
                                        onClick={() => {
                                            if (typeof item === 'number') {
                                                setCurrentPage(item - 1)

                                                if (!searchInput) {
                                                    paginatedTransactions(item)
                                                }
                                            }
                                        }}>{item}</button>
                            ))}
                        </div>
                        <button  className={`w-[36px] h-[36px] flex justify-center items-center border border-gray-200 rounded-md cursor-pointer ${(currentPage + 1 === totalPage || totalPage === 0) && 'pointer-events-none cursor-not-allowed'}`} onClick={() => {if (!searchInput) {paginatedTransactions(currentPage + 2)} setCurrentPage(currentPage => currentPage + 1)}}><MdOutlineKeyboardArrowRight size={23} /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TotalCryptoTransactionsModal