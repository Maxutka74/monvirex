import { FiDollarSign } from "react-icons/fi";
import { LuWallet } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import walletApi from "../api/walletApi.ts";
import { RiLoaderLine } from "react-icons/ri";
import { BiErrorCircle } from "react-icons/bi";
import { formatNumber } from "../../../shared/utils/formatNumber.ts";

type WalletActionModalProps = {
  balance: string;
  walletActionModal: "deposit" | "withdraw";
  setWalletActionModal: React.Dispatch<
    React.SetStateAction<"deposit" | "withdraw">
  >;
  onClose: () => void;
};

const WalletActionModal = ({
  balance,
  walletActionModal,
  setWalletActionModal,
  onClose,
}: WalletActionModalProps) => {
  const theme = localStorage.getItem("CHANGE_THEME");

  const [amountDeposit, setAmountDeposit] = useState("0");
  const [amountWithdraw, setAmountWithdraw] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    setError(null);

    const amount = Number(amountDeposit);

    if (Number.isNaN(amount)) {
      setError("Amount must be a valid number");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (amount < 10) {
      setError("Minimum deposit is 10 USDT");
      return;
    }

    try {
      setIsLoading(true);

      let idempotencyKey = sessionStorage.getItem("deposit_idempotency");

      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();

        sessionStorage.setItem("deposit_idempotency", idempotencyKey);
      }

      const data = await walletApi.deposit({
        amount: amountDeposit,
        idempotency_key: idempotencyKey,
      });

      sessionStorage.removeItem("deposit_idempotency");

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const maxWithdraw = (Number(balance) / 1.01).toFixed(2);

  const handleWithdraw = async () => {
    setError(null);

    const amount = Number(amountWithdraw);

    if (Number.isNaN(amount)) {
      setError("Amount must be a valid number");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (amount < 10) {
      setError("Minimum withdraw is 10 USDT");
      return;
    }

    if (amount > Number(maxWithdraw)) {
      setError("Insufficient balance");
      return;
    }

    try {
      setIsLoading(true);

      let idempotencyKey = sessionStorage.getItem("withdraw_idempotency");

      if (!idempotencyKey) {
        idempotencyKey = crypto.randomUUID();

        sessionStorage.setItem("withdraw_idempotency", idempotencyKey);
      }

      await walletApi.withdraw({
        amount: amountWithdraw,
        idempotency_key: idempotencyKey,
      });

      sessionStorage.removeItem("withdraw_idempotency");

      window.location.reload();
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-sm ${
        theme === "dark" ? "bg-black/70" : "bg-black/40"
      }`}
    >
      <div
        className={`max-h-[95vh] w-full max-w-[500px] overflow-y-auto rounded-[24px] p-4 sm:p-5 ${
          theme === "dark"
            ? "bg-[#020817] border border-[#123A70] shadow-[0_0_35px_rgba(21,151,255,0.15)] text-white"
            : "bg-white"
        }`}
      >
        {isLoading ? (
          <div className="flex h-[350px] items-center justify-center">
            <RiLoaderLine
              size={52}
              className={`animate-spin ${
                theme === "dark" ? "text-[#1597FF]" : "text-[#666D80]"
              }`}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-[46px] w-[46px] items-center justify-center rounded-full sm:h-[54px] sm:w-[54px] ${
                    theme === "dark"
                      ? "bg-[#1597FF] shadow-[0_0_15px_rgba(21,151,255,0.3)]"
                      : "bg-[#429EFF]"
                  }`}
                >
                  <LuWallet size={24} className="text-white" />
                </div>

                <div>
                  <h4 className="text-xl font-medium sm:text-2xl">
                    USDT Wallet
                  </h4>

                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
                    }`}
                  >
                    Manage your balance
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`flex h-[40px] w-[40px] items-center justify-center rounded-full sm:h-[44px] sm:w-[44px] cursor-pointer ${
                  theme === "dark"
                    ? "border border-[#164B86] text-[#A8B8D0] hover:bg-[#0B1D38] hover:text-white"
                    : "border border-[#DFE1E7]"
                }`}
              >
                <IoMdClose size={24} />
              </button>
            </div>

            <div className="mt-5 flex w-full gap-2">
              <button
                onClick={() => {
                  setWalletActionModal("deposit");
                  setAmountDeposit("0");
                  setError(null);
                }}
                className={`h-[46px] flex-1 rounded-full cursor-pointer ${
                  walletActionModal === "deposit"
                    ? theme === "dark"
                      ? "bg-[#1597FF] text-white shadow-[0_0_15px_rgba(21,151,255,0.25)]"
                      : "bg-[#429EFF] text-white"
                    : theme === "dark"
                      ? "bg-[#071329] border border-[#164B86] text-[#A8B8D0]"
                      : ""
                }`}
              >
                Deposit
              </button>

              <button
                onClick={() => {
                  setWalletActionModal("withdraw");
                  setAmountWithdraw("0");
                  setError(null);
                }}
                className={`h-[46px] flex-1 rounded-full cursor-pointer ${
                  walletActionModal === "withdraw"
                    ? theme === "dark"
                      ? "bg-[#1597FF] text-white shadow-[0_0_15px_rgba(21,151,255,0.25)]"
                      : "bg-[#429EFF] text-white"
                    : theme === "dark"
                      ? "bg-[#071329] border border-[#164B86] text-[#A8B8D0]"
                      : ""
                }`}
              >
                Withdraw
              </button>
            </div>

            {walletActionModal === "deposit" && (
              <>
                <div
                  className={`mt-5 flex w-full flex-col gap-2 rounded-[20px] border p-4 ${
                    theme === "dark"
                      ? "border-[#123A70] bg-[#071329]"
                      : "border-[#DFE1E7]"
                  }`}
                >
                  <p
                    className={
                      theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
                    }
                  >
                    Current Balance
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${
                        theme === "dark"
                          ? "bg-[#1597FF] shadow-[0_0_12px_rgba(21,151,255,0.25)]"
                          : "bg-[#429EFF]"
                      }`}
                    >
                      <FiDollarSign size={24} className="text-white" />
                    </div>

                    <h4 className="text-2xl font-medium sm:text-[28px]">
                      {formatNumber(balance)}
                    </h4>

                    <span
                      className={
                        theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
                      }
                    >
                      USDT
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <p>Amount</p>

                  {error && (
                    <div
                      className={`flex items-center gap-2 rounded-md p-3 ${
                        theme === "dark"
                          ? "bg-[#2A0D18] border border-[#6B1830]"
                          : "bg-[#FFF0F3]"
                      }`}
                    >
                      <BiErrorCircle size={16} className="text-[#DF1C41]" />

                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div
                    className={`relative h-[60px] w-full rounded-[20px] border ${
                      theme === "dark"
                        ? "border-[#164B86] bg-[#071329]"
                        : "border-[#DFE1E7]"
                    }`}
                  >
                    <input
                      value={amountDeposit}
                      type="text"
                      placeholder="Enter Amount"
                      onChange={(e) => {
                        setAmountDeposit(e.target.value);
                        setError(null);
                      }}
                      className={`h-full w-full rounded-[20px] px-4 pr-16 outline-none ${
                        theme === "dark"
                          ? "bg-transparent text-white placeholder:text-[#60718D]"
                          : ""
                      }`}
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666D80]">
                      USDT
                    </span>
                  </div>

                  <p className="text-sm text-[#666D80]">
                    Minimum deposit: 10 USDT
                  </p>
                </div>

                <button
                  onClick={handleDeposit}
                  disabled={isLoading}
                  className={`mt-5 h-[52px] w-full rounded-full text-white cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]"
                      : "bg-[#429EFF]"
                  }`}
                >
                  Continue to Deposit
                </button>
              </>
            )}

            {walletActionModal === "withdraw" && (
              <>
                <div
                  className={`mt-5 flex w-full flex-col gap-2 rounded-[20px] border p-4 ${
                    theme === "dark"
                      ? "border-[#123A70] bg-[#071329]"
                      : "border-[#DFE1E7]"
                  }`}
                >
                  <p
                    className={
                      theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
                    }
                  >
                    Available Balance
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${
                        theme === "dark"
                          ? "bg-[#1597FF] shadow-[0_0_12px_rgba(21,151,255,0.25)]"
                          : "bg-[#429EFF]"
                      }`}
                    >
                      <FiDollarSign size={24} className="text-white" />
                    </div>

                    <h4 className="text-2xl font-medium sm:text-[28px]">
                      {formatNumber(balance)}
                    </h4>

                    <span
                      className={
                        theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
                      }
                    >
                      USDT
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <p>Amount</p>

                  {error && (
                    <div
                      className={`flex items-center gap-2 rounded-md p-3 ${
                        theme === "dark"
                          ? "bg-[#2A0D18] border border-[#6B1830]"
                          : "bg-[#FFF0F3]"
                      }`}
                    >
                      <BiErrorCircle size={16} className="text-[#DF1C41]" />

                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div
                    className={`relative h-[60px] w-full rounded-[20px] border ${
                      theme === "dark"
                        ? "border-[#164B86] bg-[#071329]"
                        : "border-[#DFE1E7]"
                    }`}
                  >
                    <input
                      value={amountWithdraw}
                      type="text"
                      placeholder="Enter Amount"
                      onChange={(e) => {
                        setAmountWithdraw(e.target.value);
                        setError(null);
                      }}
                      className={`h-full w-full rounded-[20px] px-4 pr-24 outline-none ${
                        theme === "dark"
                          ? "bg-transparent text-white placeholder:text-[#60718D]"
                          : ""
                      }`}
                    />

                    <span
                      className={`absolute right-14 top-1/2 -translate-y-1/2 ${theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"} `}
                    >
                      USDT
                    </span>

                    <div
                      className={`absolute right-12 top-1/2 h-5 w-px -translate-y-1/2 ${
                        theme === "dark" ? "bg-[#164B86]" : "bg-[#DFE1E7]"
                      }`}
                    />

                    <button
                      onClick={() => {
                        setAmountWithdraw(maxWithdraw);
                        setError(null);
                      }}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer ${
                        theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"
                      }`}
                    >
                      Max
                    </button>
                  </div>

                  <div
                    className={`space-y-1 text-sm ${
                      theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
                    }`}
                  >
                    <p>
                      Available to withdraw: {formatNumber(maxWithdraw)} USDT
                    </p>

                    <p>
                      You will receive {formatNumber(amountWithdraw)} USDT. A 1%
                      withdrawal fee applies.
                    </p>

                    <p>Minimum withdrawal: 10 USDT</p>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className={`mt-5 h-[52px] w-full rounded-full text-white cursor-pointer ${
                    theme === "dark"
                      ? "bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]"
                      : "bg-[#429EFF]"
                  }`}
                >
                  Confirm Withdrawal
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletActionModal;
