import background from "../../../assets/images/Background.png";
import logo from "../../../assets/logos/Monvirex.png";

import {SiGoogleanalytics} from "react-icons/si";
import {FaExchangeAlt} from "react-icons/fa";
import {MdSecurity} from "react-icons/md";

const AuthHero = () => {

    return (
        <div
            className="hidden xl:flex w-[58%] h-screen flex-col justify-center pl-24 pr-16 overflow-hidden"
            style={{
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="mb-14">
                <img
                    src={logo}
                    alt="Monvirex Logo"
                    className="w-[260px] h-auto -ml-11"
                    loading="lazy"
                />

                <h2 className="text-[48px] leading-[58px] font-semibold mb-5">
                    Smart Crypto Analytics,
                    <br />
                    <span className="text-[#4775FF]">
                    Trading & Exchange
            </span>
                </h2>

                <p className="text-[18px] leading-8 text-[#4B5563]">
                    Track the market, analyze live charts and trade crypto securely on one platform.
                </p>
            </div>

            <div className="flex gap-25">
                <div className="w-[199px]">
                    <SiGoogleanalytics
                        size={32}
                        className="mb-4 text-[#4775FF]"
                    />

                    <h3 className="font-semibold text-[18px] mb-2">
                        Real-time Analytics
                    </h3>

                    <p className="text-[#4B5563] leading-7">
                        Live crypto charts and market insights updated instantly.
                    </p>
                </div>

                <div className="w-[199px]">
                    <FaExchangeAlt
                        size={32}
                        className="mb-4 text-[#4775FF]"
                    />

                    <h3 className="font-semibold text-[18px] mb-2">
                        Trade & Exchange
                    </h3>

                    <p className="text-[#4B5563] leading-7">
                        Buy, sell and exchange digital assets with ease.
                    </p>
                </div>

                <div className="w-[199px]">
                    <MdSecurity
                        size={32}
                        className="mb-4 text-[#4775FF]"
                    />

                    <h3 className="font-semibold text-[18px] mb-2">
                        Secure & Reliable
                    </h3>

                    <p className="text-[#4B5563] leading-7">
                        Advanced protection for your crypto assets and account.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthHero;