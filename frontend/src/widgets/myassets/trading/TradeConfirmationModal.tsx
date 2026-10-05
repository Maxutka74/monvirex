import { CgClose } from "react-icons/cg";
import { type SetStateAction, useEffect, useState } from "react";
import { MdInfoOutline } from "react-icons/md";
import walletApi from "../../../features/wallet/api/walletApi.ts";
import type { SelectOption } from "./FastActionCard.tsx";
import tradeApi from "../../../features/trade/api/tradeApi.ts";
import { BiErrorCircle } from "react-icons/bi";
import SuccessPaymentModal from "../../../shared/ui/SuccessPaymentModal.tsx";
import { useStore } from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";
import { formatNumber } from "../../../shared/utils/formatNumber.ts";

type TradeConfirmationModalProps = {
  setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
  type: "Buy" | "Sell" | "Exchange";
  buyAsset?: SelectOption | null;
  sellAsset?: SelectOption | null;
  exchangeFromAsset?: SelectOption | null;
  exchangeToAsset?: SelectOption | null;
  assetMarketAction?: {
    symbol: string;
    value: string;
  };
  amountCurrent?: string | null;
};

export type PaymentSuccess = {
  type: "Buy" | "Sell" | "Exchange";
  receiveAmount: string;
  receiveCurrency: string;
};

const TradeConfirmationModal = ({
  setIsModalOpen,
  type,
  buyAsset,
  sellAsset,
  exchangeFromAsset,
  exchangeToAsset,
  assetMarketAction,
  amountCurrent,
}: TradeConfirmationModalProps) => {
  const theme = useStore(themeStore, (state) => state.theme);

  const [amount, setAmount] = useState<string>(amountCurrent ?? "0");
  const [balance, setBalance] = useState<string>();

  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentSuccess | null>(
    null,
  );

  useEffect(() => {
    const balanceData = async () => {
      try {
        const balanceUser = await walletApi.getBalance();

        setBalance(balanceUser.balance);
      } catch (e) {
        console.error(e);
      }
    };

    balanceData();
  }, []);

  const confirmAction = async () => {
    const currentAmount = Number(amount);

    if (currentAmount <= 0) {
      setIsError(true);
      setErrorMessage("Amount must be greater than 0");
      return;
    }

    if (type === "Buy" && currentAmount > Number(balance)) {
      setIsError(true);
      setErrorMessage("Insufficient USDT balance");
      return;
    }

    if (type === "Sell" && currentAmount > Number(sellAsset?.amount)) {
      setIsError(true);
      setErrorMessage("Insufficient crypto balance");
      return;
    }

    if (
      type === "Exchange" &&
      currentAmount > Number(exchangeFromAsset?.amount)
    ) {
      setIsError(true);
      setErrorMessage("Insufficient crypto balance");
      return;
    }

    if (type === "Buy") {
      const buyAssets = async () => {
        try {
          const response = await tradeApi.buyAsset({
            symbol:
              (assetMarketAction ? assetMarketAction.symbol : buyAsset?.value) +
              "USDT",
            amount_usdt: amount,
          });

          setPaymentResult({
            type: "Buy",
            receiveAmount: response.buy.crypto_amount,
            receiveCurrency: response.buy.asset,
          });
          setIsOpenModal(true);
        } catch {
          setIsError(true);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      };
      buyAssets();
    }

    if (type === "Sell") {
      const sellAssets = async () => {
        try {
          const response = await tradeApi.sellAsset({
            symbol: sellAsset?.value + "USDT",
            amount_crypto: amount,
          });

          setPaymentResult({
            type: "Sell",
            receiveAmount: response.sell.usdt_amount,
            receiveCurrency: "USDT",
          });
          setIsOpenModal(true);
        } catch {
          setIsError(true);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      };
      sellAssets();
    }

    if (type === "Exchange") {
      const exchangeAsset = async () => {
        try {
          const response = await tradeApi.exchangeAsset({
            from_asset: exchangeFromAsset?.value + "USDT",
            to_asset: exchangeToAsset?.value + "USDT",
            amount_crypto: amount,
          });

          setPaymentResult({
            type: "Exchange",
            receiveAmount: response.exchange.amount_to,
            receiveCurrency: response.exchange.to_asset,
          });
          setIsOpenModal(true);
        } catch {
          setIsError(true);
          setErrorMessage("Something went wrong. Please try again later.");
        }
      };
      exchangeAsset();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 w-full h-full flex justify-center items-center backdrop-blur-sm p-5 ${
          theme === "dark" ? "bg-black/70" : "bg-black/40"
        }`}
      >
        <div
          className={`w-[500px] rounded-[20px] p-5 ${
            theme === "dark"
              ? "bg-[#020817] border border-[#123A70] shadow-[0_0_35px_rgba(21,151,255,0.15)] text-white"
              : "bg-white"
          }`}
        >
          <div className="w-full">
            <div className="w-full flex items-center justify-between">
              <h3 className="text-[26px] font-medium">
                {type}{" "}
                {assetMarketAction
                  ? assetMarketAction.symbol
                  : type === "Buy"
                    ? buyAsset?.value
                    : type === "Sell"
                      ? sellAsset?.value
                      : exchangeFromAsset?.value}{" "}
                {type === "Exchange" && `⇄ ${exchangeToAsset?.value}`}
              </h3>
              <button
                className={`h-[34px] w-[34px] flex items-center justify-center rounded-full sm:h-[40px] sm:w-[40px] cursor-pointer ${
                  theme === "dark"
                    ? "text-[#A8B8D0] border border-[#164B86] hover:text-white hover:bg-[#0B1D38]"
                    : "text-gray-500"
                }`}
                onClick={() => setIsModalOpen(false)}
              >
                <CgClose size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-1 mb-3">
              <p
                className={
                  theme === "dark" ? "text-[#7184A3]" : "text-gray-500"
                }
              >
                Current Price:{" "}
                {assetMarketAction
                  ? assetMarketAction.value
                  : type === "Buy"
                    ? formatNumber(buyAsset?.currentPrice ?? 0)
                    : type === "Sell"
                      ? formatNumber(sellAsset?.currentPrice ?? 0)
                      : formatNumber(exchangeFromAsset?.currentPrice ?? 0)}{" "}
                USDT
              </p>
            </div>
            <div
              className={`w-full h-px mb-3 ${
                theme === "dark" ? "bg-[#123A70]" : "bg-gray-100"
              }`}
            />
            <div className="flex flex-col gap-2 mb-2">
              <p className="text-[18px]">
                You{" "}
                {type === "Sell"
                  ? `Sell (${sellAsset?.value})`
                  : type === "Exchange"
                    ? `Pay (${exchangeFromAsset?.value})`
                    : "Pay (USDT)"}
              </p>
              {isError && (
                <div
                  className={`w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] mb-1 ${
                    theme === "dark"
                      ? "bg-[#2A0D18] border border-[#6B1830]"
                      : "bg-[#FFF0F3]"
                  }`}
                >
                  <BiErrorCircle
                    size={16}
                    className="ml-[10px] text-[#DF1C41]"
                  />
                  <p className="text-[14px] font-medium">{errorMessage}</p>
                </div>
              )}
              <div
                className={`relative flex flex-row items-center rounded-[10px] ${
                  theme === "dark"
                    ? "border border-[#164B86] bg-[#071329]"
                    : "border border-gray-100"
                }`}
              >
                <input
                  value={amount}
                  type="number"
                  className={`w-full text-xl outline-none p-3 [&::-webkit-inner-spin-button]:appearance-none ${
                    theme === "dark" ? "bg-transparent text-white" : ""
                  }`}
                  onChange={(e) => setAmount(e.target.value)}
                  onClick={() => setIsError(false)}
                />
              </div>
              <div className="flex flex-row items-center justify-between">
                <p
                  className={
                    theme === "dark" ? "text-[#7184A3]" : "text-gray-500"
                  }
                >
                  Available:{" "}
                  {type === "Buy"
                    ? balance
                    : type === "Sell"
                      ? sellAsset?.amount
                      : exchangeFromAsset?.amount}{" "}
                  <span>
                    {type === "Buy"
                      ? "USDT"
                      : type === "Sell"
                        ? sellAsset?.value
                        : exchangeFromAsset?.value}
                  </span>
                </p>
                <button
                  className={`w-[40px] h-[40px] text-sm cursor-pointer ${
                    theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"
                  }`}
                  onClick={() =>
                    setAmount(
                      type === "Buy"
                        ? String(balance)
                        : type === "Sell"
                          ? String(sellAsset?.amount)
                          : String(exchangeFromAsset?.amount),
                    )
                  }
                >
                  MAX
                </button>
              </div>
            </div>
            <div
              className={`w-full p-3 rounded-[10px] mb-3 ${
                theme === "dark"
                  ? "border border-[#123A70] bg-[#071329]"
                  : "border border-gray-200 bg-gray-100"
              }`}
            >
              <div className="flex flex-row items-center justify-between mb-3">
                <p>You Receive (Estimated)</p>
                <p className="text-[18px] text-right font-medium">
                  {type === "Buy"
                    ? Number(
                        (
                          Number(amount) /
                          Number(
                            assetMarketAction
                              ? assetMarketAction.value
                              : buyAsset?.currentPrice,
                          )
                        ).toFixed(6),
                      ) > 0
                      ? formatNumber(
                          Number(amount) /
                            Number(
                              assetMarketAction
                                ? assetMarketAction.value
                                : buyAsset?.currentPrice,
                            ),
                        )
                      : 0
                    : type === "Sell"
                      ? Number(
                          Number(
                            Number(amount) * Number(sellAsset?.currentPrice),
                          ).toFixed(6),
                        ) > 0
                        ? formatNumber(
                            Number(amount) * Number(sellAsset?.currentPrice),
                          )
                        : 0
                      : Number(
                            Number(
                              (Number(amount) *
                                Number(exchangeFromAsset?.currentPrice)) /
                                Number(exchangeToAsset?.currentPrice),
                            ).toFixed(6),
                          ) > 0
                        ? formatNumber(
                            (Number(amount) *
                              Number(exchangeFromAsset?.currentPrice)) /
                              Number(exchangeToAsset?.currentPrice),
                          )
                        : 0}
                  <span>
                    {" "}
                    {type === "Buy"
                      ? buyAsset?.value
                      : type === "Sell"
                        ? "USDT"
                        : exchangeToAsset?.value}
                  </span>
                </p>
              </div>
              <div className="flex flex-row items-center justify-between mb-3">
                <p>Network Fee</p>
                <span className="text-[18px] font-medium">Free</span>
              </div>
              <div
                className={`w-full h-px mb-3 ${
                  theme === "dark" ? "bg-[#123A70]" : "bg-gray-200"
                }`}
              />
              <div className="flex flex-row items-center justify-between">
                <span>Total</span>
                <p className="text-[18px] font-medium">
                  {type === "Buy"
                    ? formatNumber(amount)
                    : type === "Sell"
                      ? Number(
                          (
                            Number(amount) * Number(sellAsset?.currentPrice)
                          ).toFixed(6),
                        ) > 0
                        ? formatNumber(
                            Number(amount) * Number(sellAsset?.currentPrice),
                          )
                        : 0
                      : Number(amount) > 0
                        ? formatNumber(
                            Number(amount) *
                              Number(exchangeFromAsset?.currentPrice),
                          )
                        : 0}{" "}
                  <span>USDT</span>
                </p>
              </div>
            </div>
            <div
              className={`flex flex-row items-center gap-2 text-sm mb-5 ${
                theme === "dark" ? "text-[#7184A3]" : "text-gray-500"
              }`}
            >
              <MdInfoOutline size={20} />
              <p>
                The amount you receive may change slightly due to market
                fluctuations.
              </p>
            </div>
            <div className="flex flex-row items-center justify-between gap-6 font-medium">
              <button
                className={`min-h-[44px] flex-1 cursor-pointer rounded-[10px] ${
                  theme === "dark"
                    ? "border border-[#164B86] text-[#A8B8D0] hover:bg-[#0B1D38]"
                    : "border border-gray-200"
                }`}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`min-h-[44px] flex-1 cursor-pointer text-white rounded-[10px] ${
                  theme === "dark"
                    ? "bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]"
                    : "bg-[#429EFF]"
                }`}
                onClick={() => confirmAction()}
              >
                Confirm {type}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isOpenModal && paymentResult && (
        <SuccessPaymentModal
          type={paymentResult.type}
          receiveAmount={paymentResult.receiveAmount}
          receiveCurrency={paymentResult.receiveCurrency}
        />
      )}
    </>
  );
};

export default TradeConfirmationModal;
