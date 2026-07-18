import { FiDollarSign } from "react-icons/fi"
import { LuWallet } from "react-icons/lu"
import {IoMdClose} from "react-icons/io";
import {useState} from "react";
import walletApi from "../../features/wallet/api/walletApi.ts";
import {RiLoaderLine} from "react-icons/ri";
import {BiErrorCircle} from "react-icons/bi";

type WalletActionModalProps = {
    balance: string
    walletActionModal: 'deposit' | 'withdraw'
    setWalletActionModal: React.Dispatch<React.SetStateAction<'deposit' | 'withdraw'>>
    onClose: () => void
}

const WalletActionModal = ({
                               balance,
                               walletActionModal,
                               setWalletActionModal,
                               onClose,
                           }: WalletActionModalProps) => {
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

            let idempotencyKey = sessionStorage.getItem(
                "deposit_idempotency"
            );

            if (!idempotencyKey) {
                idempotencyKey = crypto.randomUUID();

                sessionStorage.setItem(
                    "deposit_idempotency",
                    idempotencyKey
                );
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

            let idempotencyKey = sessionStorage.getItem(
                "withdraw_idempotency"
            );

            if (!idempotencyKey) {
                idempotencyKey = crypto.randomUUID();

                sessionStorage.setItem(
                    "withdraw_idempotency",
                    idempotencyKey
                );
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">
            <div className="max-h-[95vh] w-full max-w-[500px] overflow-y-auto rounded-[24px] bg-white p-4 sm:p-5">
                {isLoading ? (
                    <div className="flex h-[350px] items-center justify-center">
                        <RiLoaderLine
                            size={52}
                            className="animate-spin text-[#666D80]"
                        />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#429EFF] sm:h-[54px] sm:w-[54px]">
                                    <LuWallet
                                        size={24}
                                        className="text-white"
                                    />
                                </div>

                                <div>
                                    <h4 className="text-xl font-medium sm:text-2xl">
                                        USDT Wallet
                                    </h4>

                                    <p className="text-sm text-[#666D80]">
                                        Manage your balance
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[#DFE1E7] sm:h-[44px] sm:w-[44px]"
                            >
                                <IoMdClose size={18} />
                            </button>
                        </div>

                        <div className="mt-5 flex w-full gap-2">
                            <button
                                onClick={() => {
                                    setWalletActionModal("deposit");
                                    setAmountDeposit("0");
                                    setError(null);
                                }}
                                className={`h-[46px] flex-1 rounded-full ${
                                    walletActionModal === "deposit"
                                        ? "bg-[#429EFF] text-white"
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
                                className={`h-[46px] flex-1 rounded-full ${
                                    walletActionModal === "withdraw"
                                        ? "bg-[#429EFF] text-white"
                                        : ""
                                }`}
                            >
                                Withdraw
                            </button>
                        </div>

                        {walletActionModal === "deposit" && (
                            <>
                                <div className="mt-5 flex w-full flex-col gap-2 rounded-[20px] border border-[#DFE1E7] p-4">
                                    <p className="text-[#666D80]">
                                        Current Balance
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#429EFF]">
                                            <FiDollarSign
                                                size={24}
                                                className="text-white"
                                            />
                                        </div>

                                        <h4 className="text-2xl font-medium sm:text-[28px]">
                                            {balance}
                                        </h4>

                                        <span className="text-[#666D80]">
                                        USDT
                                    </span>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-2">
                                    <p>Amount</p>

                                    {error && (
                                        <div className="flex items-center gap-2 rounded-md bg-[#FFF0F3] p-3">
                                            <BiErrorCircle
                                                size={16}
                                                className="text-[#DF1C41]"
                                            />

                                            <p className="text-sm font-medium">
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    <div className="relative h-[60px] w-full rounded-[20px] border border-[#DFE1E7]">
                                        <input
                                            value={amountDeposit}
                                            type="text"
                                            placeholder="Enter Amount"
                                            onChange={(e) => {
                                                setAmountDeposit(e.target.value);
                                                setError(null);
                                            }}
                                            className="h-full w-full rounded-[20px] px-4 pr-16 outline-none"
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
                                    className="mt-5 h-[52px] w-full rounded-full bg-[#429EFF] text-white"
                                >
                                    Continue to Deposit
                                </button>
                            </>
                        )}

                        {walletActionModal === "withdraw" && (
                            <>
                                <div className="mt-5 flex w-full flex-col gap-2 rounded-[20px] border border-[#DFE1E7] p-4">
                                    <p className="text-[#666D80]">
                                        Available Balance
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#429EFF]">
                                            <FiDollarSign
                                                size={24}
                                                className="text-white"
                                            />
                                        </div>

                                        <h4 className="text-2xl font-medium sm:text-[28px]">
                                            {balance}
                                        </h4>

                                        <span className="text-[#666D80]">
                                        USDT
                                    </span>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-col gap-2">
                                    <p>Amount</p>

                                    {error && (
                                        <div className="flex items-center gap-2 rounded-md bg-[#FFF0F3] p-3">
                                            <BiErrorCircle
                                                size={16}
                                                className="text-[#DF1C41]"
                                            />

                                            <p className="text-sm font-medium">
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    <div className="relative h-[60px] w-full rounded-[20px] border border-[#DFE1E7]">
                                        <input
                                            value={amountWithdraw}
                                            type="text"
                                            placeholder="Enter Amount"
                                            onChange={(e) => {
                                                setAmountWithdraw(e.target.value);
                                                setError(null);
                                            }}
                                            className="h-full w-full rounded-[20px] px-4 pr-24 outline-none"
                                        />

                                        <span className="absolute right-16 top-1/2 -translate-y-1/2 text-[#666D80]">
                                        USDT
                                    </span>

                                        <div className="absolute right-12 top-1/2 h-5 w-px -translate-y-1/2 bg-[#DFE1E7]" />

                                        <button
                                            onClick={() => {
                                                setAmountWithdraw(maxWithdraw);
                                                setError(null);
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#429EFF]"
                                        >
                                            Max
                                        </button>
                                    </div>

                                    <div className="space-y-1 text-sm text-[#666D80]">
                                        <p>
                                            Available to withdraw: {maxWithdraw} USDT
                                        </p>

                                        <p>
                                            You will receive{" "}
                                            {Number(amountWithdraw).toFixed(2)} USDT.
                                            A 1% withdrawal fee applies.
                                        </p>

                                        <p>Minimum withdrawal: 10 USDT</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleWithdraw}
                                    disabled={isLoading}
                                    className="mt-5 h-[52px] w-full rounded-full bg-[#429EFF] text-white"
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
}

export default WalletActionModal