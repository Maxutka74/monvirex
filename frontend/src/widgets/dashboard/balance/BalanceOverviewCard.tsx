import {IoCardOutline} from "react-icons/io5";
import {useEffect, useState} from "react";
import type {UserSummary} from "../../../features/wallet/api/walletApi.ts";
import walletApi from "../../../features/wallet/api/walletApi.ts";
import {LuArrowDownLeft} from "react-icons/lu";
import {IoIosArrowDown} from "react-icons/io";
import {RiLoaderLine, RiMoneyDollarCircleLine} from "react-icons/ri";
import {FiArrowUpRight} from "react-icons/fi";
import PortfolioHistoryCard from "../portfolio/PortfolioHistory/PortfolioHistoryCard.tsx";
import WalletActionModal from "../../../features/wallet/ui/WalletActionModal.tsx";
import {useStore} from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";


const BalanceOverviewCard = () => {
    const theme = useStore(themeStore, (state) => state.theme);

    const [balance, setBalance] = useState("0.000");
    const [summary, setSummary] = useState<UserSummary | null>(null);
    const [days, setDays] = useState("7d");
    const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
    const [walletActionMode, setWalletActionMode] =
        useState<"deposit" | "withdraw">("deposit");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBalanceData = async () => {
            try {
                setIsLoading(true);

                const balanceData = await walletApi.getBalance();
                const symmaryData = await walletApi.getActivitySummary(days);

                setBalance(balanceData.balance);
                setSummary(symmaryData.summary);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalanceData();
    }, [days]);

    const periodText =
        days === "1d"
            ? "today"
            : days === "7d"
                ? "this week"
                : "this month";

    const totalIncome = summary
        ? Number(summary.deposit) + Number(summary.sell)
        : 0;

    const depositModalAction = () => {
        setIsWalletModalOpen(!isWalletModalOpen);
        setWalletActionMode("deposit");
    };

    const withdrawModalAction = () => {
        setIsWalletModalOpen(!isWalletModalOpen);
        setWalletActionMode("withdraw");
    };

    const closeModalAction = () => {
        setIsWalletModalOpen(!isWalletModalOpen);
    };

    return (
        <div className={`
                w-full flex flex-col rounded-[30px] p-4 sm:p-6 gap-5
                ${theme === "dark" ? "border border-[#0B4EA2] bg-black/60 text-white" : "bg-[#FFFFFF]/60"}
            `}>
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 rounded-[20px] bg-[#429EFF] px-4 sm:px-5 py-4 sm:py-5 flex flex-col justify-between min-h-[140px] sm:min-h-[154px] gap-4 sm:gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white">
                                <IoCardOutline className="text-[18px] sm:text-[24px] text-black" />
                            </div>

                            <h4 className="text-lg sm:text-2xl text-white font-medium">
                                My Balance
                            </h4>
                        </div>

                        <div className="relative w-[90px] sm:w-[110px] h-[36px] sm:h-[46px] shrink-0">
                            <select
                                className={`
                                    w-full h-full rounded-full border border-white
                                    appearance-none pl-3 pr-8 sm:pr-10
                                    text-sm sm:text-base
                                    ${theme === "dark"
                                        ? "bg-black/40 text-white"
                                        : "bg-transparent text-white"
                                    }
                                `}
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                            >
                                <option value="1d" className={theme === 'dark' ? 'bg-[#071329] text-white' : ''}>
                                    Day
                                </option>

                                <option value="7d" className={theme === 'dark' ? 'bg-[#071329] text-white' : ''}>
                                    Week
                                </option>

                                <option value="30d" className={theme === 'dark' ? 'bg-[#071329] text-white' : ''}>
                                    Month
                                </option>
                            </select>

                            <IoIosArrowDown
                                size={18}
                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-[28px] sm:text-[40px] font-medium text-white flex items-center">
                            $
                            {isLoading ? (
                                <RiLoaderLine
                                    size={28}
                                    className="animate-spin"
                                />
                            ) : (
                                balance
                            )}
                        </h2>

                        <p className="flex items-center gap-1 sm:gap-2 text-base sm:text-xl text-white font-medium whitespace-nowrap">
                            {totalIncome ? `+$${totalIncome}` : "$0"}

                            <span className="text-xs sm:text-lg">
                                {periodText}
                            </span>
                        </p>
                    </div>
                </div>

                <div className={`
                        flex-1 min-h-[154px] rounded-[20px] sm:rounded-[30px]
                        p-4 sm:p-5 border
                        ${theme === "dark"
                                        ? "border-[#263452] bg-black/40"
                                        : "border-[#DFE1E7] bg-[#FFFFFF]/60"
                                    }
                    `}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 sm:w-[44px] sm:h-[44px] flex justify-center items-center rounded-full bg-[#429EFF]">
                                <RiMoneyDollarCircleLine
                                    size={24}
                                    className="text-white"
                                />
                            </div>

                            <h5 className="text-lg sm:text-[20px] font-medium">
                                Fast Action
                            </h5>
                        </div>

                        <div className={`
                                flex items-center justify-between border rounded-xl
                                px-3 py-2 gap-2 w-full sm:w-auto
                                ${theme === "dark"
                                    ? "border-[#429EFF] bg-black text-white"
                                    : "border-[#429EFF]"
                                }
                            `}>
                            <div className="flex items-center gap-2">
                                <RiMoneyDollarCircleLine size={24} />

                                <p className="text-[14px] font-medium">
                                    USDT Wallet
                                </p>
                            </div>

                            <h5 className="flex flex-row justify-center items-center text-[18px] font-medium">
                                $
                                {isLoading ? (
                                    <RiLoaderLine
                                        size={18}
                                        className={`
                                            animate-spin
                                            ${theme === "dark" ? "text-white" : "text-black"}
                                        `}
                                    />
                                ) : (
                                    balance
                                )}
                            </h5>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div
                            className={`
                                w-full sm:flex-1 h-[44px]
                                flex items-center justify-center gap-2
                                rounded-full text-white font-medium cursor-pointer
                                ${theme === "dark"
                                    ? "bg-[#111827] border border-[#429EFF] shadow-[0_0_10px_rgba(66,158,255,0.2)]"
                                    : "bg-black"
                                }
                            `}
                            onClick={() => depositModalAction()}
                        >
                            <button className="text-[14px] cursor-pointer">
                                Deposit
                            </button>

                            <FiArrowUpRight size={18} />
                        </div>

                        <div
                            className="w-full sm:flex-1 h-[44px] flex items-center justify-center gap-2 bg-[#429EFF] rounded-full text-white font-medium cursor-pointer"
                            onClick={() => withdrawModalAction()}
                        >
                            <button className="text-[14px] cursor-pointer">
                                Withdraw
                            </button>

                            <LuArrowDownLeft size={18} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full">
                <PortfolioHistoryCard />
            </div>

            {isWalletModalOpen && (
                <WalletActionModal
                    balance={balance}
                    walletActionModal={walletActionMode}
                    setWalletActionModal={setWalletActionMode}
                    onClose={closeModalAction}
                />
            )}
        </div>
    );
};

export default BalanceOverviewCard;