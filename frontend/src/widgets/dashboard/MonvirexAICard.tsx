import { TbHomeCog } from "react-icons/tb";
import { CgFileDocument } from "react-icons/cg";
import { PiLightningLight, PiShootingStarLight } from "react-icons/pi";

import logo from "../../assets/MonvirexWhiteLogo.png";

const MonvirexAICard = () => {
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
                flex flex-row flex-1
                items-stretch justify-center
                gap-3
            ">
                <div className="flex-1 min-w-0">
                    <div className="
                        h-full
                        flex flex-col
                        justify-center items-center
                        gap-5
                        rounded-[20px]
                        bg-white
                    ">
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
                                Predictor
                            </h5>
                        </div>

                        <p className="
                            px-4 pb-5
                            text-[12px]
                            sm:text-base
                            text-[#6F6F6F]
                        ">
                            Analyze live market trends,
                            price changes, and volume
                            to spot trading signals.
                        </p>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="
                        h-full
                        flex flex-col
                        justify-center items-center
                        gap-5
                        rounded-[20px]
                        bg-white
                    ">
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
                                Optimizer
                            </h5>
                        </div>

                        <p className="
                            px-4 pb-5
                            text-[12px]
                            sm:text-base
                            text-[#6F6F6F]
                        ">
                            Review your assets and
                            suggest smarter allocation
                            based on risk and trends.
                        </p>
                    </div>
                </div>
            </div>

            <div className="
                flex flex-row
                items-center justify-center
                gap-2
            ">
                <div className="
                    relative flex-1
                    h-[48px]
                    flex items-center
                    rounded-full
                    bg-white
                    text-[#666D80]
                ">
                    <PiLightningLight
                        size={22}
                        className="absolute left-3"
                    />

                    <input
                        className="
                            w-full h-[48px]
                            rounded-full
                            pl-[44px]
                            outline-none
                        "
                        type="text"
                        placeholder="Search with AI"
                    />
                </div>

                <button className="
                    w-[92px] h-[48px]
                    flex flex-row
                    items-center gap-2
                    rounded-full
                    bg-white
                    p-1
                    cursor-pointer
                ">
                    <div className="
                        w-[40px] h-[40px]
                        flex items-center justify-center
                        rounded-full
                        bg-gradient-to-tr from-[#429EFF] via-[#33CFFF] to-[#9F87FF]
                        text-white
                    ">
                        <span>AI</span>
                    </div>

                    <PiShootingStarLight
                        size={26}
                        className="text-[#429EFF]"
                    />
                </button>
            </div>
        </div>
    );
};

export default MonvirexAICard;