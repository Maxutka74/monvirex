import background from "../../assets/Background.png";
import logo from "../../assets/Monvirex.png";
import {SiGoogleanalytics} from "react-icons/si";
import {FaExchangeAlt} from "react-icons/fa";
import {MdSecurity} from "react-icons/md";
import {useTranslation} from "react-i18next";

const AuthHero = () => {
    const { t } = useTranslation();

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
                    {t('auth.hero_title')},
                    <br />
                    <span className="text-[#4775FF]">
                    {t('auth.hero_title_blue')}
            </span>
                </h2>

                <p className="text-[18px] leading-8 text-[#4B5563]">
                    {t('auth.hero_description')}
                </p>
            </div>

            <div className="flex gap-25">
                <div className="w-[199px]">
                    <SiGoogleanalytics
                        size={32}
                        className="mb-4 text-[#4775FF]"
                    />

                    <h3 className="font-semibold text-[18px] mb-2">
                        {t('auth.analytics_title')}
                    </h3>

                    <p className="text-[#4B5563] leading-7">
                        {t('auth.analytics_description')}
                    </p>
                </div>

                <div className="w-[199px]">
                    <FaExchangeAlt
                        size={32}
                        className="mb-4 text-[#4775FF]"
                    />

                    <h3 className="font-semibold text-[18px] mb-2">
                        {t('auth.exchange_title')}
                    </h3>

                    <p className="text-[#4B5563] leading-7">
                        {t('auth.exchange_description')}
                    </p>
                </div>

                <div className="w-[199px]">
                    <MdSecurity
                        size={32}
                        className="mb-4 text-[#4775FF]"
                    />

                    <h3 className="font-semibold text-[18px] mb-2">
                        {t('auth.security_title')}
                    </h3>

                    <p className="text-[#4B5563] leading-7">
                        {t('auth.security_description')}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthHero;