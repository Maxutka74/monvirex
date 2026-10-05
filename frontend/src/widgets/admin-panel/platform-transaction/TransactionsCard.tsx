import adminApi, {
  type AdminPanelTransactions,
} from "../../../features/admin/api/adminApi.ts";
import { BsArrowRight } from "react-icons/bs";
import { useEffect, useMemo, useState } from "react";
import { ReceiptText } from "lucide-react";
import TotalTransactionsModal from "./TotalTransactionsModal.tsx";
import { useStore } from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";

const TransactionsCard = () => {
  const theme = useStore(themeStore, (state) => state.theme);

  const [transactions, setTransactions] = useState<AdminPanelTransactions[]>(
    [],
  );
  const [transactionsModalOpen, setTransactionsModalOpen] = useState(false);
  const [allPages, setAllPages] = useState(0);

  useEffect(() => {
    const transactionsData = async () => {
      try {
        const transactionDataAll = await adminApi.getAdminTransactions();

        setTransactions(transactionDataAll.results);
        setAllPages(transactionDataAll.count);
      } catch (e) {
        console.error(e);
      }
    };

    transactionsData();
  }, []);

  const tableFormatingData = useMemo(
    () =>
      transactions.map((transaction) => ({
        id: transaction.id.slice(0, 8) + "...",
        email: transaction.user_email,
        type: transaction.transaction_type.toUpperCase(),
        amount: transaction.amount,
        status:
          transaction.status.charAt(0).toUpperCase() +
          transaction.status.slice(1),
        joined: Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(transaction.created_at)),
      })),
    [transactions],
  );

  return (
    <div
      className={`w-full h-full flex flex-col rounded-[30px] p-4 sm:p-6 ${
        theme === "dark"
          ? "bg-black/60 border border-[#123A70] text-white shadow-[0_0_25px_rgba(21,151,255,0.08)]"
          : "bg-[#FFFFFF]/60"
      }`}
    >
      <div className="flex flex-col sm:flex-row justify-between gap-5 mb-5">
        <div className="flex flex-row items-center gap-4">
          <div className="w-[44px] h-[44px] flex items-center justify-center text-white bg-[#429EFF] rounded-md">
            <ReceiptText size={22} />
          </div>
          <div className="flex flex-col justify-center font-medium">
            <h3 className="text-xl sm:text-2xl">Recent Transactions</h3>
            <p
              className={`text-xs sm:text-sm ${
                theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
              }`}
            >
              Latest fiat transactions
            </p>
          </div>
        </div>
        <div
          className={`max-w-[210px] w-full flex flex-row items-center justify-between cursor-pointer px-4 py-2 rounded-lg font-medium ${
            theme === "dark"
              ? "border border-[#164B86] bg-[#071329] text-[#A8B8D0] hover:bg-[#0B2A52] hover:text-white"
              : "border border-gray-300"
          }`}
          onClick={() => setTransactionsModalOpen(true)}
        >
          <span>View all transactions</span>
          <BsArrowRight size={20} />
        </div>
      </div>
      <div
        className={`w-full overflow-x-auto rounded-lg ${
          theme === "dark"
            ? "border border-[#164B86]"
            : "border border-gray-200"
        }`}
      >
        <table className="w-full min-w-[700px]">
          <thead>
            <tr
              className={`h-[60px] ${
                theme === "dark"
                  ? "bg-[#0B2A52] text-[#A8B8D0]"
                  : "bg-gray-300/60"
              }`}
            >
              <th className="px-4 py-3">ID</th>
              <th>Email</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {tableFormatingData.map((transaction) => (
              <tr
                className={`h-[60px] border-t ${
                  theme === "dark" ? "border-[#123A70]" : "border-gray-200"
                }`}
                key={transaction.id}
              >
                <td className="max-w-[80px] px-4">{transaction.id}</td>
                <td className="text-center">{transaction.email}</td>
                <td className="flex justify-center pt-5">
                  <div
                    className={`w-[85px] text-sm flex justify-center rounded-full px-1 ${
                      theme === "dark"
                        ? "text-[#1597FF] bg-[#0B2A52] border border-[#164B86]"
                        : "text-blue-500 bg-blue-100"
                    }`}
                  >
                    {transaction.type}
                  </div>
                </td>
                <td className="text-center">{transaction.amount} USDT</td>
                <td className="flex justify-center pt-5">
                  <div
                    className={`w-[85px] text-sm flex justify-center rounded-full px-1 ${
                      transaction.status === "Completed"
                        ? theme === "dark"
                          ? "text-[#40C4AA] bg-[#0B2E28] border border-[#176B59]"
                          : "text-green-500 bg-green-100"
                        : transaction.status === "Cancelled"
                          ? theme === "dark"
                            ? "text-[#DF1C41] bg-[#2A0D18] border border-[#7A1F35]"
                            : "text-red-500 bg-red-100"
                          : theme === "dark"
                            ? "text-[#A78BFA] bg-[#211A3A] border border-[#4C3A78]"
                            : "text-purple-500 bg-purple-100"
                    }`}
                  >
                    {transaction.status}
                  </div>
                </td>
                <td className="text-center">{transaction.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactionsModalOpen && (
        <TotalTransactionsModal
          setTransactionModalOpen={setTransactionsModalOpen}
          tableFormatingData={tableFormatingData}
          allPages={allPages}
        />
      )}
    </div>
  );
};

export default TransactionsCard;
