import { TbHomeCog } from "react-icons/tb";
import { CgFileDocument } from "react-icons/cg";
import { PiLightningLight, PiShootingStarLight } from "react-icons/pi";

import logo from "../../../assets/logos/MonvirexWhiteLogo.png";
import {useStore} from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";
import {useNavigate} from "react-router-dom";
import {useState} from "react";

const MonvirexAICard = () => {
    const navigate = useNavigate();
    const theme = useStore(themeStore, (state) => state.theme);
    const [messages, setMessages] = useState("");

    const handleMarketAnalysis = () => {navigate('/ai-assistant', {
        state: {marketAnalysis: true}
    })}

    const handlePortfolioAnalysis = () => {navigate('/ai-assistant', {
        state: {portfolioAnalysis: true}
    })}

    const handleSendMessage = () => {
        const message = messages.trim()

        if (!message) return;

        navigate('/ai-assistant', {
            state: {initialMessage: message},
        })
    }

    return (
        <div className="
            w-full min-h-[400px]
            flex flex-col gap-5
            rounded-[20px]
            bg-gradient-to-tr from-[#429EFF] via-[#6D8CFF] to-[#9B7CFF]
            p-5
        ">
            <div>
                <div className="flex flex-row items-center gap-2">
                    <img
                        className="
                            w-[48px] h-[48px]
                            sm:w-[60px] sm:h-[60px]
                        "
                        src={logo}
                        alt="Monvirex Logo"
                    />

                    <h4 className="
                        text-[22px]
                        sm:text-[28px]
                        font-medium text-white
                    ">
                        Monvirex AI
                    </h4>
                </div>
            </div>

            <div className="
                flex flex-col sm:flex-row flex-1
                items-stretch justify-center
                gap-3
            ">
                <button className="flex-1 min-w-0 text-start"
                     onClick={() => handleMarketAnalysis()}   >
                    <div className={`
                            h-full
                            flex flex-col
                            justify-center items-center
                            gap-5
                            rounded-[20px]
                            cursor-pointer
                            ${theme === "dark" ? "bg-black/80 text-white" : "bg-white"}
                        `}>
                        <div className="
                            flex flex-row
                            items-center gap-3
                            pt-5
                        ">
                            <div className="
                                w-[38px] h-[38px]
                                sm:w-[44px] sm:h-[44px]
                                flex items-center justify-center
                                rounded-full
                                bg-[#429EFF]
                            ">
                                <TbHomeCog
                                    size={20}
                                    className="text-white sm:text-[22px]"
                                />
                            </div>

                            <h5 className="
                                w-[80px]
                                sm:w-[106px]
                                text-[15px]
                                sm:text-[20px]
                                font-medium
                                leading-tight
                            ">
                                AI Market <br />
                                Analysis
                            </h5>
                        </div>

                        <p className={`
                            px-4 pb-5
                            text-[12px]
                            sm:text-base
                            text-center
                            ${theme === "dark" ? "text-[#A7B0C3]" : "text-[#6F6F6F]"}
                        `}>
                            Analyze current market data,
                            price movements, and trading
                            volume with AI-powered insights
                        </p>
                    </div>
                </button>

                <button className="flex-1 min-w-0 text-start"
                        onClick={() => handlePortfolioAnalysis()}>
                    <div className={`
                            h-full
                            flex flex-col
                            justify-center items-center
                            gap-5
                            sm:pt-0
                            pt-5
                            rounded-[20px]
                            cursor-pointer
                            ${theme === "dark" ? "bg-black/80 text-white" : "bg-white"}
                        `}>
                        <div className="
                            flex flex-row
                            items-center gap-3
                        ">
                            <div className="
                                w-[38px] h-[38px]
                                sm:w-[44px] sm:h-[44px]
                                flex items-center justify-center
                                rounded-full
                                bg-[#9F87FF]
                            ">
                                <CgFileDocument
                                    size={20}
                                    className="text-white sm:text-[22px]"
                                />
                            </div>

                            <h5 className="
                                w-[80px]
                                sm:w-[106px]
                                text-[15px]
                                sm:text-[20px]
                                font-medium
                                leading-tight
                            ">
                                AI Portfolio <br />
                                Analysis
                            </h5>
                        </div>

                        <p className={`
                            px-4 pb-5
                            text-[12px] sm:text-base text-center
                            ${theme === "dark" ? "text-[#A7B0C3]" : "text-[#6F6F6F]"}
                        `}>
                            Analyze your portfolio,
                            asset allocation, and performance
                            with AI-powered insights
                        </p>
                    </div>
                </button>
            </div>

            <div className="
                flex flex-row
                items-center justify-center
                gap-2
            ">
                <div className={`
                    relative flex-1
                    h-[42px] sm:h-[48px]
                    flex items-center
                    rounded-full
                    ${theme === "dark"
                                ? "bg-black/80 text-white"
                                : "bg-white text-[#666D80]"
                            }
                `}>
                    <PiLightningLight
                        className="
                            absolute
                            left-3
                            text-[19px] sm:text-[22px]
                        "
                    />

                    <input
                        value={messages}
                        className={`
                            w-full
                            h-[42px] sm:h-[48px]
                            rounded-full
                            pl-[38px] sm:pl-[44px]
                            text-[13px] sm:text-base
                            outline-none
                            ${theme === "dark"
                                        ? "bg-transparent text-white placeholder:text-[#818898]"
                                        : "bg-transparent text-black"
                                    }
                        `}
                        type="text"
                        placeholder="Search with AI"
                        onChange={(e) => setMessages(e.target.value)}
                    />
                </div>

                <button
                    className={`
                        w-[78px] h-[42px]
                        sm:w-[92px] sm:h-[48px]
                        flex flex-row
                        items-center
                        gap-1 sm:gap-2
                        rounded-full
                        p-1
                        cursor-pointer
                        shrink-0
                        ${theme === "dark"
                                ? "bg-black/80"
                                : "bg-white"
                            }
                    `}
                    onClick={() => handleSendMessage()}
                >
                    <div className="
                        w-[34px] h-[34px]
                        sm:w-[40px] sm:h-[40px]
                        flex items-center justify-center
                        rounded-full
                        bg-gradient-to-tr
                        from-[#429EFF]
                        via-[#33CFFF]
                        to-[#9F87FF]
                        text-white
                    ">
                        <span className="text-[13px] sm:text-base">
                            AI
                        </span>
                    </div>

                    <PiShootingStarLight
                        className="
                            text-[22px] sm:text-[26px]
                            text-[#429EFF]
                        "
                    />
                </button>
            </div>
        </div>
    );
};

export default MonvirexAICard;