import Select from "react-select";
import { PiLightningBold } from "react-icons/pi";
import { IoIosTrendingDown, IoIosTrendingUp } from "react-icons/io";
import { TbArrowsExchange2 } from "react-icons/tb";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineDollar } from "react-icons/ai";
import { LuArrowRightLeft } from "react-icons/lu";
import { GoArrowRight } from "react-icons/go";
import assetsApi, {
  type Asset,
} from "../../../features/assets/api/assetsApi.ts";
import walletApi, {
  type UserPortfolio,
} from "../../../features/wallet/api/walletApi.ts";
import api from "../../../shared/api/instance.ts";
import { BiErrorCircle } from "react-icons/bi";
import TradeConfirmationModal from "./TradeConfirmationModal.tsx";
import { useStore } from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  amount?: string;
  currentPrice?: string;
};

const FastActionCard = () => {
  const theme = useStore(themeStore, (state) => state.theme);

  const [actions, setAction] = useState<"Buy" | "Sell" | "Exchange">("Buy");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [nextPage, setNextPage] = useState<string | null>("");
  const [walletAssets, setWalletAssets] = useState<UserPortfolio[]>([]);
  const [clearWalletAssets, setClearWalletAssets] = useState<Asset[]>([]);
  const [balance, setBalance] = useState<string>("0.00");

  const [buyAsset, setBuyAsset] = useState<SelectOption | null>(null);
  const [sellAsset, setSellAsset] = useState<SelectOption | null>(null);
  const [exchangeFromAsset, setExchangeFromAsset] =
    useState<SelectOption | null>(null);
  const [exchangeToAsset, setExchangeToAsset] = useState<SelectOption | null>(
    null,
  );
  const [amount, setAmount] = useState<string>();

  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const actionData = async () => {
      try {
        const [assets, walletAssets, balanceUser] = await Promise.all([
          await assetsApi.getAssets(undefined, undefined, "-current_price"),
          await walletApi.getPortfolio(),
          await walletApi.getBalance(),
        ]);

        setAssets(assets.results);
        setNextPage(assets.next);
        setWalletAssets(walletAssets.portfolio);
        setBalance(balanceUser.balance);
      } catch (e) {
        console.error(e);
      }
    };

    actionData();
  }, []);

  useEffect(() => {
    if (walletAssets.length > 0) {
      const userAssets = async () => {
        const listAssets: string[] = [];

        walletAssets.forEach((item) => {
          listAssets.push(item.asset);
        });

        try {
          const dataAssets = await assetsApi.getAssets(undefined, listAssets);

          setClearWalletAssets(dataAssets.results);
        } catch (error) {
          console.error(error);
        }
      };

      userAssets();
    }
  }, [walletAssets]);

  const optionAssets = useMemo(
    () =>
      assets.map((item) => ({
        value: item.name,
        label: (
          <div className="flex items-center gap-2">
            <img
              className="w-[24px] h-[24px]"
              src={item.icon_url}
              alt="Crypto Icon"
            />
            <span>{item.name}</span>
          </div>
        ),
        currentPrice: item.current_price,
      })),
    [assets],
  );

  const userOpinionAssets = useMemo(
    () =>
      clearWalletAssets.map((item) => {
        const dataAmount = walletAssets.find(
          (walletItems) => item.symbol === walletItems.asset,
        );

        return {
          value: item.name,
          label: (
            <div className="flex items-center gap-2">
              <img
                className="w-[24px] h-[24px]"
                src={item.icon_url}
                alt="Crypto Icon"
              />
              <span>{item.name}</span>
            </div>
          ),
          amount: dataAmount?.amount,
          currentPrice: item.current_price,
        };
      }),
    [clearWalletAssets, walletAssets],
  );

  useEffect(() => {
    if (optionAssets.length > 0 && (!buyAsset || !exchangeFromAsset)) {
      setBuyAsset(optionAssets[0]);
      setExchangeFromAsset(optionAssets[0]);
    }
  }, [optionAssets]);

  useEffect(() => {
    if (optionAssets.length > 0 && (!sellAsset || !exchangeToAsset)) {
      setSellAsset(userOpinionAssets[0]);
      setExchangeToAsset(userOpinionAssets[0]);
    }
  }, [userOpinionAssets]);

  const scrollMoreOptions = async () => {
    if (!nextPage) return;

    try {
      const next = nextPage.indexOf("api/");

      const nextAssets = await api.get(nextPage.slice(next + 3));

      setAssets((assets) => [...assets, ...nextAssets.data.results]);

      setNextPage(nextAssets.data.next);
    } catch (e) {
      console.error(e);
    }
  };

  const openConfirmationModal = () => {
    const currentAmount = Number(amount);

    if (Number.isNaN(currentAmount)) {
      setIsError(true);
      setErrorMessage("Only numbers are allowed");
      return;
    }

    if (currentAmount <= 0) {
      setIsError(true);
      setErrorMessage("Amount must be greater than 0");
      return;
    }

    if (actions === "Buy" && currentAmount > Number(balance)) {
      setIsError(true);
      setErrorMessage("Insufficient USDT balance");
      return;
    }

    if (actions === "Sell" && currentAmount > Number(sellAsset?.amount)) {
      setIsError(true);
      setErrorMessage("Insufficient crypto balance");
      return;
    }

    if (
      actions === "Exchange" &&
      currentAmount > Number(exchangeToAsset?.amount)
    ) {
      setIsError(true);
      setErrorMessage("Insufficient crypto balance");
      return;
    }

    setIsModalOpen(true);
  };

  const hasCrypto = walletAssets.find(
    (asset) => asset.asset.slice(0, -4) === exchangeFromAsset?.value,
  );

  const selectClassNames = {
    control: () =>
      `!min-h-[40px] !bg-transparent border-none outline-none shadow-none ${
        theme === "dark" ? "!bg-[#071329] !text-white" : ""
      }`,

    menu: () =>
      theme === "dark"
        ? "!bg-[#071329] !border !border-[#164B86] !rounded-[10px] overflow-hidden"
        : "",

    menuList: () => (theme === "dark" ? "!bg-[#071329] !p-1" : ""),

    option: (state: any) =>
      theme === "dark"
        ? `!bg-[#071329] !text-[#A8B8D0] cursor-pointer ${
            state.isFocused ? "!bg-[#0B2A52] !text-white" : ""
          } ${state.isSelected ? "!bg-[#1597FF] !text-white" : ""}`
        : "",

    singleValue: () => (theme === "dark" ? "!text-[#A8B8D0]" : ""),

    input: () => (theme === "dark" ? "!text-white" : ""),

    placeholder: () => (theme === "dark" ? "!text-[#60718D]" : ""),
  };

  return (
    <div
      className={`w-full rounded-[20px] p-5 ${
        theme === "dark"
          ? "bg-black/60 border border-[#123A70] text-white shadow-[0_0_20px_rgba(0,102,255,0.08)]"
          : "bg-[#FFFFFF]/60"
      }`}
    >
      <div className="flex flex-row items-center gap-3 mb-3">
        <PiLightningBold
          size={26}
          className={theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"}
        />
        <h3 className="text-[24px] font-medium">Fast Action</h3>
      </div>
      <div
        className={`w-full h-full max-h-[40px] flex flex-row rounded-[10px] ${
          theme === "dark"
            ? "border border-[#164B86] text-[#1597FF] bg-[#071329]"
            : "border border-gray-100 text-[#429EFF]"
        } ${actions === "Exchange" ? "mb-3" : "mb-5"}`}
      >
        <button
          className={`flex-1 flex flex-row items-center justify-center gap-3 border-r border-gray-100 cursor-pointer ${
            actions === "Buy" &&
            (theme === "dark"
              ? "text-white bg-[#1597FF] rounded-l-[10px] shadow-[0_0_12px_rgba(21,151,255,0.25)]"
              : "text-white bg-[#429EFF] rounded-l-[10px]")
          }`}
          onClick={() => {
            setAction("Buy");
            setAmount("");
            setIsError(false);
            setErrorMessage("");
          }}
        >
          <IoIosTrendingUp size={20} />
          <span>Buy</span>
        </button>
        <button
          className={`flex-1 flex flex-row items-center justify-center gap-3 border-r border-gray-100 cursor-pointer ${
            actions === "Sell" &&
            (theme === "dark"
              ? "text-white bg-[#1597FF] rounded-none shadow-[0_0_12px_rgba(21,151,255,0.25)]"
              : "text-white bg-[#429EFF] rounded-none")
          }`}
          onClick={() => {
            setAction("Sell");
            setAmount("");
            setIsError(false);
            setErrorMessage("");
          }}
        >
          <IoIosTrendingDown size={20} />
          <span>Sell</span>
        </button>
        <button
          className={`flex-1 flex flex-row items-center justify-center gap-1 sm:gap-3 cursor-pointer ${
            actions === "Exchange" &&
            (theme === "dark"
              ? "text-white bg-[#1597FF] rounded-r-[10px] shadow-[0_0_12px_rgba(21,151,255,0.25)]"
              : "text-white bg-[#429EFF] rounded-r-[10px]")
          }`}
          onClick={() => {
            setAction("Exchange");
            setAmount("");
            setIsError(false);
            setErrorMessage("");
          }}
        >
          <TbArrowsExchange2 size={20} />
          <span>Exchange</span>
        </button>
      </div>
      <div
        className={`flex flex-col gap-1 ${actions === "Exchange" ? "mb-2" : "mb-5"}`}
      >
        <p className="font-medium">Select asset</p>
        {actions === "Buy" && (
          <div
            className={`flex flex-row items-center rounded-[10px] ${
              theme === "dark"
                ? "border border-[#164B86] bg-[#071329]"
                : "border border-gray-100"
            }`}
          >
            <Select
              className="w-full"
              classNames={selectClassNames}
              isSearchable={false}
              options={optionAssets}
              onMenuScrollToBottom={scrollMoreOptions}
              maxMenuHeight={200}
              value={buyAsset}
              onChange={(option) => setBuyAsset(option)}
            />
          </div>
        )}
        {actions === "Sell" && (
          <div
            className={`flex flex-row items-center rounded-[10px] ${
              theme === "dark"
                ? "border border-[#164B86] bg-[#071329]"
                : "border border-gray-100"
            }`}
          >
            <Select
              className="w-full"
              classNames={selectClassNames}
              isSearchable={false}
              options={userOpinionAssets}
              maxMenuHeight={200}
              value={sellAsset}
              onChange={(option) => setSellAsset(option)}
            />
          </div>
        )}
        {actions === "Exchange" && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full">
              <p>From (you have)</p>
              <div className="w-full flex flex-row items-center border border-gray-100 rounded-[10px]">
                <Select
                  className="w-full"
                  classNames={selectClassNames}
                  isSearchable={false}
                  options={userOpinionAssets}
                  maxMenuHeight={200}
                  value={exchangeToAsset}
                  onChange={(option) => setExchangeToAsset(option)}
                />
              </div>
              <p className="text-sm">
                Available:{" "}
                {exchangeToAsset ? (
                  <span
                    className={
                      theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"
                    }
                  >
                    {String(exchangeToAsset?.amount)} {exchangeToAsset?.value}
                  </span>
                ) : (
                  "No crypto available"
                )}
              </p>
            </div>
            <div
              className={`w-[44px] h-[44px] flex items-center justify-center rounded-full shrink-0 ${
                theme === "dark"
                  ? "bg-[#0B1D38] border border-[#164B86] text-[#1597FF]"
                  : "bg-gray-100"
              }`}
            >
              <LuArrowRightLeft size={24} />
            </div>
            <div className="w-full">
              <p>To (you will receive)</p>
              <div className="relative flex flex-row items-center border border-gray-100 rounded-[10px]">
                <Select
                  className="w-full"
                  classNames={selectClassNames}
                  isSearchable={false}
                  options={optionAssets}
                  onMenuScrollToBottom={scrollMoreOptions}
                  maxMenuHeight={200}
                  value={exchangeFromAsset}
                  onChange={(option) => setExchangeFromAsset(option)}
                />
              </div>
              <p className="text-sm">
                {" "}
                {hasCrypto
                  ? `You have ${exchangeFromAsset?.value}`
                  : `You don't have ${exchangeFromAsset?.value}`}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 mb-3">
        <p className="font-medium">
          Amount to {(actions === "Sell" || actions === "Exchange") && "send"}{" "}
          <span
            className={theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"}
          >
            {actions === "Buy" && "(USDT)"}
          </span>
        </p>
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
        <div
          className={`relative flex flex-row items-center rounded-[10px] ${
            theme === "dark"
              ? "border border-[#164B86] bg-[#071329]"
              : "border border-gray-200"
          }`}
        >
          {actions === "Buy" && (
            <div
              className={`max-w-[120px] w-full border-r flex flex-row items-center justify-center gap-3 p-3 ${
                theme === "dark" ? "border-[#164B86]" : "border-gray-200"
              }`}
            >
              <AiOutlineDollar size={24} />
              <span>USDT</span>
            </div>
          )}
          <input
            value={amount}
            type="text"
            className={`w-full outline-none p-3 ${
              theme === "dark"
                ? "bg-transparent text-white placeholder:text-[#60718D]"
                : ""
            }`}
            onChange={(e) => setAmount(e.target.value)}
            onClick={() => setIsError(false)}
          />
          {actions === "Buy" && (
            <button
              className={`w-[80px] text-sm cursor-pointer p-3 ${
                theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"
              }`}
              onClick={() => setAmount(balance)}
            >
              MAX
            </button>
          )}
          {((actions === "Sell" && sellAsset) ||
            (actions === "Exchange" && exchangeToAsset)) && (
            <span
              className={`text-sm font-medium rounded-[5px] px-4 py-1 mr-4 ${
                theme === "dark"
                  ? "bg-[#0B1D38] text-[#A8B8D0] border border-[#164B86]"
                  : "bg-gray-200"
              }`}
            >
              {actions === "Sell" ? sellAsset?.value : exchangeToAsset?.value}
            </span>
          )}
        </div>
      </div>
      <div className="mb-5">
        {actions === "Buy" && (
          <p
            className={`text-sm ${
              theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
            }`}
          >
            Enter the amount of USDT you want to spend.{" "}
            <span
              className={theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"}
            >
              Available: {balance} USDT
            </span>
          </p>
        )}
        {(actions === "Sell" || actions === "Exchange") && (
          <p
            className={`text-sm ${
              theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
            }`}
          >
            Enter the amount of{" "}
            {actions === "Sell"
              ? sellAsset?.value
              : actions === "Exchange" && exchangeToAsset?.value}{" "}
            you want to {actions === "Sell" ? "sell" : "exchange"}.{" "}
            <span
              className={theme === "dark" ? "text-[#1597FF]" : "text-[#429EFF]"}
            >
              Available:{" "}
              {sellAsset || exchangeToAsset
                ? actions === "Sell"
                  ? String(sellAsset?.amount)
                  : actions === "Exchange" && String(exchangeToAsset?.amount)
                : "No crypto available"}
            </span>
          </p>
        )}
      </div>
      <button
        className={`w-full h-[45px] flex flex-row items-center justify-center gap-3 text-white rounded-[10px] cursor-pointer ${
          theme === "dark"
            ? "bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)] hover:bg-[#269FFF]"
            : "bg-[#429EFF]"
        }`}
        onClick={() => openConfirmationModal()}
      >
        Continue to {actions} <GoArrowRight size={20} className=" text-white" />
      </button>
      {isModalOpen && (
        <TradeConfirmationModal
          setIsModalOpen={setIsModalOpen}
          type={actions}
          buyAsset={buyAsset}
          sellAsset={sellAsset}
          exchangeFromAsset={exchangeToAsset}
          exchangeToAsset={exchangeFromAsset}
          amountCurrent={amount}
        />
      )}
    </div>
  );
};

export default FastActionCard;
