import { useEffect, useMemo, useState } from "react";
import { HiOutlineChartPie } from "react-icons/hi";
import walletApi, {
  type UserPortfolio,
  type UserSummary,
} from "../../../../features/wallet/api/walletApi.ts";
import WalletSparkline from "./WalletSparkline.tsx";
import { GrTransaction } from "react-icons/gr";
import { RiLoaderLine } from "react-icons/ri";
import { PiBag } from "react-icons/pi";
import { IoIosArrowDown } from "react-icons/io";
import TransactionOverviewCard from "../transactions/TransactionOverviewCard.tsx";
import TransactionsModal from "../transactions-modal/TransactionsModal.tsx";
import { useStore } from "zustand/react";
import themeStore from "../../../../entities/theme/themeStore.tsx";
import { formatNumber } from "../../../../shared/utils/formatNumber.ts";

type Period = "1d" | "7d" | "30d";

const COLORS = ["#F7931A", "#627EEA", "#9945FF", "#26A17B", "#94A3B8"];

const currentDate: Record<Period, string> = {
  "1d": "Day",
  "7d": "Week",
  "30d": "Month",
};

const WalletOverviewCard = () => {
  const theme = useStore(themeStore, (state) => state.theme);

  const [portfolio, setPortfolio] = useState<UserPortfolio[]>([]);
  const [allTimeSummary, setAllTimeSummary] = useState<UserSummary>();
  const [activitySummary, setActivitySummary] = useState<UserSummary | null>(
    null,
  );
  const [days, setDays] = useState<Period>("7d");
  const [isLoadingAsset, setIsLoadingAsset] = useState(true);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(true);

  const [openTransactionModal, setOpenTransactionModal] = useState(false);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setIsLoadingAsset(true);
        const [cryptoData, summaryData] = await Promise.all([
          await walletApi.getPortfolio(),
          await walletApi.getActivitySummary("all"),
        ]);

        setPortfolio(cryptoData.portfolio);
        setAllTimeSummary(summaryData.summary);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingAsset(false);
      }
    };

    fetchCryptoData();
  }, []);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setIsLoadingTransaction(true);
        const transactionData = await walletApi.getActivitySummary(days);

        setActivitySummary(transactionData.summary);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingTransaction(false);
      }
    };

    fetchTransactionData();
  }, [days]);

  const { totalValue, cryptoData } = useMemo(() => {
    const totalValue = portfolio.reduce(
      (sum, item) => sum + Number(item.current_value),
      0,
    );

    const sortPortfolio = [...portfolio].sort(
      (a, b) => Number(b.current_value) - Number(a.current_value),
    );

    const topAssets = sortPortfolio.slice(0, 4).map((item) => ({
      name: item.asset.replace("USDT", ""),
      value: Number(item.current_value),
      amount: Number(item.amount),
      percentage: (Number(item.current_value) / totalValue) * 100,
    }));

    const otherAssets = () => {
      const other = sortPortfolio.slice(4);
      let value = 0;
      let amount = 0;

      other.forEach((item) => {
        value += Number(item.current_value);
        amount += Number(item.amount);
      });

      return {
        name: "Other Assets",
        value: value,
        amount: amount,
        percentage: (value / totalValue) * 100,
      };
    };

    const cryptoData = [...topAssets, otherAssets()];

    return { totalValue, cryptoData };
  }, [portfolio]);

  const allTimeVolume = allTimeSummary
    ? Number(allTimeSummary.deposit) +
      Number(allTimeSummary.withdraw) +
      Number(allTimeSummary.buy) +
      Number(allTimeSummary.sell) +
      Number(allTimeSummary.exchange)
    : 0;

  const currentPeriodVolume = activitySummary
    ? Number(activitySummary.deposit) +
      Number(activitySummary.withdraw) +
      Number(activitySummary.buy) +
      Number(activitySummary.sell) +
      Number(activitySummary.exchange)
    : 0;

  return (
    <div
      className={`w-full flex flex-col rounded-[30px] p-4 sm:p-6 gap-5 ${
        theme === "dark"
          ? "border border-[#0B4EA2] bg-black/60"
          : "bg-[#FFFFFF]/60"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="min-h-[561px] sm:min-h-[432px] flex-1 rounded-[20px] bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] px-4 sm:px-5 py-4 sm:py-5 flex flex-col justify-between gap-4 sm:gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#429EFF] shrink-0">
                <HiOutlineChartPie className="text-[18px] sm:text-[24px] text-white" />
              </div>

              <h4 className="text-lg sm:text-2xl text-white font-medium">
                Asset Allocation
              </h4>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center">
            {isLoadingAsset ? (
              <RiLoaderLine size={42} className="text-white animate-spin" />
            ) : (
              <>
                <div className="w-full flex items-center justify-center">
                  <WalletSparkline
                    data={cryptoData}
                    totalValue={totalValue}
                    COLORS={COLORS}
                  />
                </div>
                <div className="w-full">
                  {cryptoData.length > 1 ? (
                    <ul>
                      {cryptoData.map((asset, index) => (
                        <li
                          key={asset.name}
                          className="flex flex-col gap-1 p-1"
                        >
                          <div className="flex flex-row justify-between">
                            <div className="flex flex-row justify-center gap-3">
                              <div
                                className="w-[12px] h-[12px] rounded-full"
                                style={{ backgroundColor: COLORS[index] }}
                              />
                              <div className="flex flex-col text-sm">
                                <h4 className="text-white">{asset.name}</h4>
                                <p className="text-[#BBD7FF]">
                                  ${formatNumber(asset.value)}
                                </p>
                              </div>
                            </div>
                            <p className="text-white">
                              {asset.percentage.toFixed(2)}%
                            </p>
                          </div>
                          {index <= 3 && (
                            <div className="w-full h-px bg-[rgba(255,255,255,.22)]" />
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center">
                      <p className="text-[18px] sm:text-xl text-[#E0E0E0] text-center">
                        You don’t have any cryptocurrencies in your portfolio
                        yet
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div
            className="w-full h-[52px] sm:h-[52px] flex flex-row justify-center items-center gap-4 bg-black rounded-full cursor-pointer"
            onClick={() =>
              setOpenTransactionModal((transactionsModal) => !transactionsModal)
            }
          >
            <GrTransaction className="text-white text-[18px] sm:text-[22px]" />
            <button className="text-white sm:text-xl cursor-pointer">
              Transactions
            </button>
          </div>
        </div>
        <div
          className={`min-h-[641px] sm:min-h-[432px] flex-1 rounded-[20px] px-4 sm:px-5 py-4 sm:py-5 ${
            theme === "dark"
              ? "bg-[#071329] border border-[#123A70] text-white"
              : "bg-white border border-[#DFE1E7]"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-[#429EFF] shrink-0">
                  <PiBag className="text-[18px] text-white sm:text-[24px] " />
                </div>
                <h4 className="text-lg sm:text-2xl font-medium">
                  Transaction Overview
                </h4>
              </div>
              <div className="relative w-[90px] sm:w-[110px] h-[36px] sm:h-[46px] border border-[#429EFF] rounded-full shrink-0">
                <select
                  className={`w-full h-full rounded-full border bg-transparent appearance-none pl-3 pr-8 sm:pr-10 text-sm sm:text-base outline-none cursor-pointer ${
                    theme === "dark"
                      ? "border-[#1597FF] text-white"
                      : "border-white text-black"
                  }`}
                  value={days}
                  onChange={(e) => setDays(e.target.value as Period)}
                >
                  <option
                    value="1d"
                    className={
                      theme === "dark"
                        ? "bg-[#071329] text-white"
                        : "text-black"
                    }
                  >
                    Day
                  </option>

                  <option
                    value="7d"
                    className={
                      theme === "dark"
                        ? "bg-[#071329] text-white"
                        : "text-black"
                    }
                  >
                    Week
                  </option>

                  <option
                    value="30d"
                    className={
                      theme === "dark"
                        ? "bg-[#071329] text-white"
                        : "text-black"
                    }
                  >
                    Month
                  </option>
                </select>

                <IoIosArrowDown
                  size={18}
                  className={`absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                    theme === "dark" ? "text-white" : "text-black"
                  }`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {isLoadingTransaction ? (
                <div className="flex items-center justify-center">
                  <RiLoaderLine
                    size={42}
                    className={`animate-spin ${
                      theme === "dark" ? "text-[#1597FF]" : "text-[#666D80]"
                    }`}
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-row items-center justify-between">
                    <h4
                      className={`text-[32px] sm:text-[40px] font-medium ${
                        theme === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      ${formatNumber(allTimeVolume)}
                    </h4>
                    <p className="text-[#DF1C41] text-right">
                      +${formatNumber(currentPeriodVolume)}
                      <span
                        className={
                          theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
                        }
                      >
                        {" "}
                        {currentDate[days]}
                      </span>
                    </p>
                  </div>
                  <div className="w-full h-full">
                    <TransactionOverviewCard
                      data={activitySummary}
                      currentPeriodVolume={currentPeriodVolume}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {openTransactionModal && (
        <TransactionsModal setOpenTransactionModal={setOpenTransactionModal} />
      )}
    </div>
  );
};

export default WalletOverviewCard;
