import {useEffect, useState} from "react";
import adminApi, {
    type AdminPanelCryptoTransactions,
} from "../../../features/admin/api/adminApi.ts";
import {BsArrowRight} from "react-icons/bs";
import {LiaExchangeAltSolid} from "react-icons/lia";
import TotalCryptoTransactionsModal from "./TotalCryptoTransactionsModal.tsx";


const CryptoTransactionsCard = () => {
    const [cryptoTransactions, setCryptoTransactions] = useState<AdminPanelCryptoTransactions[]>([]);
    const [cryptoTransactionsModalOpen, setCryptoTransactionsModalOpen] = useState(false);
    const [allPages, setAllPages] = useState(0);

    useEffect(() => {
        const transactionsData = async () => {
            try {
                const transactionDataAll = await adminApi.getAdminCryptoTransactions();

                setCryptoTransactions(transactionDataAll.results)
                setAllPages(transactionDataAll.count)
            } catch (e) {
                console.error(e);
            }
        }


        transactionsData();
    }, []);

    const tableFormatingData = cryptoTransactions.map((transaction) => ({
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

    return (
        <div className="w-full h-full flex flex-col rounded-[30px] bg-[#FFFFFF]/60 p-4 sm:p-6">
            <div className='flex flex-col sm:flex-row justify-between gap-5 mb-5'>
                <div className='flex flex-row items-center gap-4'>
                    <div
                        className='w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md'>
                        <LiaExchangeAltSolid size={22}/>
                    </div>
                    <div className='flex flex-col justify-center font-medium'>
                        <h3 className='text-xl sm:text-2xl'>Recent Crypto Transactions</h3>
                        <p className='text-xs sm:text-sm text-gray-400'>Latest crypto transactions</p>
                    </div>
                </div>
                <div
                    className='max-w-[260px] w-full flex flex-row items-center justify-between cursor-pointer border border-gray-300 px-4 py-2 rounded-lg font-medium' onClick={() => setCryptoTransactionsModalOpen(true)}>
                    <span>View all crypto transactions</span>
                    <BsArrowRight size={20}/>
                </div>
            </div>
            <div className='w-full overflow-x-auto border border-gray-200 rounded-lg'>
                <table className='w-[1100px] lg:w-full'>
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
                    {tableFormatingData.map((transaction) => (
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
            {cryptoTransactionsModalOpen && (
                <TotalCryptoTransactionsModal setCryptoTransactionModalOpen={setCryptoTransactionsModalOpen} tableFormatingData={tableFormatingData} allPages={allPages} />
            )}
        </div>
    )
}

export default CryptoTransactionsCard;