import { RiShoppingCartLine } from "react-icons/ri";
import { CgClose } from "react-icons/cg";
import { type SetStateAction, useEffect, useState } from "react";
import { IoMdArrowDown } from "react-icons/io";
import walletApi from "../../../features/wallet/api/walletApi.ts";
import tradeApi from "../../../features/trade/api/tradeApi.ts";
import SuccessPaymentModal from "../../../shared/ui/SuccessPaymentModal.tsx";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { LuHandCoins } from "react-icons/lu";
import { BiErrorCircle } from "react-icons/bi";
import { useStore } from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";
import { formatNumber } from "../../../shared/utils/formatNumber.ts";

type TradingActionsProps = {
  setOpenTradeActionModal: React.Dispatch<SetStateAction<boolean>>;
  dataActions: {
    type: "Buy" | "Sell";
    interval: string;
    symbol: string;
    name: string;
    crypto_icon: string;
    current_price: string;
    current_amount: string;
  };
};

const TradingActions = ({
  setOpenTradeActionModal,
  dataActions,
}: TradingActionsProps) => {
  const theme = useStore(themeStore, (state) => state.theme);

  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  useEffect(() => {
    const getBalanceData = async () => {
      try {
        const balanceData = await walletApi.getBalance();

        setBalance(balanceData.balance);
      } catch (e) {
        console.error(e);
      }
    };

    getBalanceData();
  }, []);

  const confirmAction = async () => {
    const currentAmount = Number(amount);

    if (currentAmount <= 0) {
      setIsError(true);
      setErrorMessage("Amount must be greater than 0");
      return;
    }

    if (dataActions.type === "Buy" && currentAmount > Number(balance)) {
      setIsError(true);
      setErrorMessage("Insufficient USDT balance");
      return;
    }

    if (
      dataActions.type === "Sell" &&
      currentAmount > Number(dataActions?.current_amount)
    ) {
      setIsError(true);
      setErrorMessage("Insufficient crypto balance");
      return;
    }

    if (dataActions.type === "Buy") {
      const buyAsset = async () => {
        try {
          await tradeApi.buyAsset({
            symbol: dataActions.symbol,
            amount_usdt: amount,
            interval: dataActions.interval,
            type_buy: "trade",
          });

          setOpenTradeActionModal(true);
          setOpenSuccessModal(true);
        } catch {
          setIsError(true);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      };
      buyAsset();
    }

    if (dataActions.type === "Sell") {
      const sellAsset = async () => {
        try {
          await tradeApi.sellAsset({
            symbol: dataActions.symbol,
            amount_crypto: amount,
            interval: dataActions.interval,
            type_sell: "trade",
          });

          setOpenSuccessModal(true);
        } catch {
          setIsError(true);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      };
      sellAsset();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-5 ${
        theme === "dark" ? "bg-black/60" : "bg-black/40"
      }`}
    >
      <div
        className={`max-w-[600px] w-full p-5 rounded-xl ${
          theme === "dark"
            ? "bg-[#020817] border border-[#123A70] shadow-[0_0_35px_rgba(21,151,255,0.15)] text-white"
            : "bg-white"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-end">
              <button
                className={`h-[20px] w-[20px] flex items-center justify-center rounded-full sm:h-[28px] sm:w-[28px] cursor-pointer ${
                  theme === "dark"
                    ? "text-[#7184A3] hover:text-white hover:bg-[#0B1D38]"
                    : "text-gray-500"
                }`}
                onClick={() => setOpenTradeActionModal(false)}
              >
                <CgClose size={24} />
              </button>
            </div>
            <div
              className={`w-[56px] h-[56px] flex items-center justify-center text-white rounded-full ${
                theme === "dark"
                  ? "bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.3)]"
                  : "bg-[#429EFF]"
              }`}
            >
              {dataActions.type === "Buy" ? (
                <RiShoppingCartLine size={25} />
              ) : (
                <LuHandCoins size={25} />
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3 className="text-2xl font-medium">
              {dataActions.type === "Buy" ? "Buy" : "Sell"}
            </h3>
            <p
              className={theme === "dark" ? "text-[#7184A3]" : "text-gray-400"}
            >
              {dataActions.type === "Buy"
                ? "Buy cryptocurrency with USDT"
                : "Sell your cryptocurrency for USDT"}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full flex flex-col justify-center gap-3 font-medium">
            <span className="text-[18px]">
              {dataActions.type === "Buy" ? "You pay" : "You sell"}
            </span>
            {isError && (
              <div
                className={`w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] mb-1 ${
                  theme === "dark"
                    ? "bg-[#2A0D18] border border-[#6B1830]"
                    : "bg-[#FFF0F3]"
                }`}
              >
                <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41]" />
                <p className="text-[14px] font-medium">{errorMessage}</p>
              </div>
            )}
            <div className="relative">
              <input
                value={amount}
                type="number"
                className={`w-full h-16 outline-none rounded-lg p-4 text-xl [&::-webkit-inner-spin-button]:appearance-none ${
                  theme === "dark"
                    ? "border border-[#164B86] bg-[#071329] text-white"
                    : "border border-gray-300"
                }`}
                onChange={(e) => setAmount(e.target.value)}
                onClick={() => {
                  setIsError(false);
                  setErrorMessage("");
                }}
              />
              <div className="absolute top-4 right-4 flex flex-row items-center gap-4">
                <span className="text-[18px]">
                  {dataActions.type === "Buy" ? "USDT" : dataActions.name}
                </span>
                <button
                  className={`px-2 py-1 rounded-lg cursor-pointer ${
                    theme === "dark"
                      ? "text-[#1597FF] border border-[#164B86] bg-[#0B1D38] hover:bg-[#0B2A52]"
                      : "text-[#429EFF] border border-gray-200"
                  }`}
                  onClick={() =>
                    setAmount(
                      dataActions.type === "Buy"
                        ? balance
                        : dataActions.current_amount,
                    )
                  }
                >
                  MAX
                </button>
              </div>
            </div>
            <p
              className={`text-end font-normal ${
                theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
              }`}
            >
              Available:{" "}
              {dataActions.type === "Buy"
                ? balance
                : dataActions.current_amount}{" "}
              <span>
                {dataActions.type === "Buy" ? "USDT" : dataActions.name}
              </span>
            </p>
          </div>
        </div>
        <div
          className={`flex items-center justify-center text-center my-3 ${
            theme === "dark" ? "text-[#1597FF]" : "text-gray-500"
          }`}
        >
          <IoMdArrowDown size={28} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="w-full flex flex-col justify-center gap-3 font-medium">
            <span className="text-[18px]">You Receive</span>
            <div
              className={`w-full h-20 flex flex-row items-center justify-between rounded-lg p-4 text-xl ${
                theme === "dark"
                  ? "border border-[#164B86] bg-[#071329]"
                  : "border border-[#D7E5FF] bg-[#F7FAFF]"
              }`}
            >
              <div className="flex flex-row items-center gap-4 font-medium">
                {dataActions.type === "Buy" ? (
                  <>
                    <img
                      className="w-[38px] h-[38px]"
                      src={dataActions.crypto_icon}
                      alt="Crypto Icon"
                    />
                    <div className="flex flex-col">
                      <span>{dataActions.name}</span>
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        }`}
                      >
                        {dataActions.symbol}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-row items-center justify-center gap-3">
                    <AiOutlineDollarCircle size={38} />
                    <span>USDT</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end ">
                <p>
                  {dataActions.type === "Buy"
                    ? Number(
                        (
                          Number(amount) / Number(dataActions.current_price)
                        ).toFixed(6),
                      ) >= 0
                      ? formatNumber(
                          Number(amount) / Number(dataActions.current_price),
                        )
                      : 0
                    : Number(
                          (
                            Number(amount) * Number(dataActions.current_price)
                          ).toFixed(2),
                        ) > 0
                      ? `${formatNumber(Number(amount) * Number(dataActions.current_price))} $`
                      : `${0} $`}{" "}
                  <span className="text-sm">
                    {dataActions.type === "Buy" && dataActions.name}
                  </span>
                </p>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                  }`}
                >
                  ≈ $
                  {dataActions.type === "Buy"
                    ? Number(Number(amount).toFixed(2)) >= 0
                      ? formatNumber(amount)
                      : 0
                    : Number(
                          (
                            Number(amount) * Number(dataActions.current_price)
                          ).toFixed(2),
                        ) >= 0
                      ? formatNumber(
                          Number(amount) * Number(dataActions.current_price),
                        )
                      : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between gap-6 font-medium mt-8">
          <button
            className={`min-h-[52px] flex-1 cursor-pointer rounded-[10px] ${
              theme === "dark"
                ? "border border-[#164B86] text-[#A8B8D0] hover:bg-[#0B1D38]"
                : "border border-gray-200"
            }`}
            onClick={() => setOpenTradeActionModal(false)}
          >
            Cancel
          </button>
          <button
            className={`min-h-[52px] flex-1 cursor-pointer text-white rounded-[10px] ${
              theme === "dark"
                ? "bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]"
                : "bg-[#429EFF]"
            }`}
            onClick={() => confirmAction()}
          >
            Confirm {dataActions.type === "Buy" ? dataActions.type : "Sell"}
          </button>
        </div>
      </div>
      {openSuccessModal && (
        <SuccessPaymentModal
          type={dataActions.type}
          receiveAmount={
            dataActions.type === "Buy"
              ? (Number(amount) / Number(dataActions.current_price)).toFixed(6)
              : (Number(amount) * Number(dataActions.current_price)).toFixed(6)
          }
          receiveCurrency={
            dataActions.type === "Buy" ? dataActions.symbol : "USDT"
          }
        />
      )}
    </div>
  );
};

export default TradingActions;
