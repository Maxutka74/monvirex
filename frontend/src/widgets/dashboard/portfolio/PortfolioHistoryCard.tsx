import {BsCircleFill} from "react-icons/bs";
import { useEffect, useState } from "react";
import PortfolioHistoryChart from "./PortfolioHistoryChart.tsx";
import walletApi, {type UserSnapshot} from "../../../features/wallet/api/walletApi.ts";

const PortfolioHistoryCard = () => {
    const [history, setHistory] = useState<UserSnapshot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = async () => {
            try {
                setIsLoading(true);

                const portfolioHistory =
                    await walletApi.getPortfolioHistory();

                setHistory(portfolioHistory.portfolio_snapshots);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        data();
    }, []);

    const firstTotalValueSnapshot = history.find(
        (snapshot) => Number(snapshot.total_value) > 0
    );

    const firstWalletBalanceSnapshot = history.find(
        (snapshot) => Number(snapshot.wallet_balance) > 0
    );

    const lastSnapshot = history[history.length - 1];

    const totalValue =
        firstTotalValueSnapshot &&
        lastSnapshot &&
        Number(firstTotalValueSnapshot.total_value) !== 0
            ? `${(
                ((Number(lastSnapshot.total_value) -
                        Number(firstTotalValueSnapshot.total_value)) /
                    Number(firstTotalValueSnapshot.total_value)) *
                100
            ).toFixed(2)}`
            : "+0.00";

    const totalBalance =
        firstWalletBalanceSnapshot &&
        lastSnapshot &&
        Number(firstWalletBalanceSnapshot.wallet_balance) !== 0
            ? `${(
                ((Number(lastSnapshot.wallet_balance) -
                        Number(firstWalletBalanceSnapshot.wallet_balance)) /
                    Number(firstWalletBalanceSnapshot.wallet_balance)) *
                100
            ).toFixed(2)}`
            : "0.00";

    return (
        <div className="flex flex-col lg:flex-row h-full gap-5">
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-[200px] lg:shrink-0">
                <h5 className="text-[18px] sm:text-[20px] font-medium lg:mb-0">
                    Portfolio History
                </h5>

                <div className="w-full sm:flex-1 lg:w-[200px] h-[117px] border border-[#DFE1E7] rounded-xl p-3">
                    <div className="flex items-center gap-3">
                        <BsCircleFill
                            size={24}
                            className="text-[#429EFF]"
                        />

                        <p className="font-medium text-[#666D80]">
                            Total Value
                        </p>
                    </div>

                    <h5 className="text-[28px] font-medium">
                        {lastSnapshot
                            ? `$${Number(
                                lastSnapshot.total_value
                            ).toFixed(2)}`
                            : "$0.00"}
                    </h5>

                    <p className="text-[15px] text-[#666D80]">
                        <span className="text-blue-500">
                            {Number(totalValue) > 0
                                ? `+${totalValue}%`
                                : `${totalValue}%`}
                        </span>{" "}
                        this period
                    </p>
                </div>

                <div className="w-full sm:flex-1 lg:w-[200px] h-[117px] border border-[#DFE1E7] rounded-xl p-3 text-[#666D80]">
                    <div className="flex items-center gap-3">
                        <BsCircleFill size={24} />

                        <p className="font-medium text-[#666D80]">
                            Wallet Balance
                        </p>
                    </div>

                    <h5 className="text-[28px] font-medium text-black">
                        {lastSnapshot
                            ? `$${Number(
                                lastSnapshot.wallet_balance
                            ).toFixed(2)}`
                            : "$0.00"}
                    </h5>

                    <p className="text-[15px]">
                        <span>
                            {Number(totalBalance) > 0
                                ? `+${totalBalance}%`
                                : `${totalBalance}%`}
                        </span>{" "}
                        this period
                    </p>
                </div>
            </div>

            <div className="w-full lg:flex-1 h-[220px] sm:h-[260px] lg:h-[286px]">
                {isLoading ? (
                    "..."
                ) : (
                    <PortfolioHistoryChart history={history} />
                )}
            </div>
        </div>
    );
};

export default PortfolioHistoryCard;