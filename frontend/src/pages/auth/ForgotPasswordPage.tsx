import ForgotPasswordForm from "../../features/auth/ui/ForgotPasswordForm.tsx";
import {useTranslation} from "react-i18next";
import AuthHero from "../../shared/ui/AuthHero.tsx";
import MobileLogo from "../../shared/ui/MobileLogo.tsx";

const ForgotPasswordPage = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-[100dvh] flex items-center font-['DM_Sans']">
            <AuthHero />
            <div className="w-full xl:w-[42%] flex justify-center items-center overflow-y-auto">
                <div className='w-full max-w-[350px] xl:max-w-[440px] flex flex-col justify-center gap-[24px]' >
                    <div className="flex xl:hidden justify-center">
                        <MobileLogo />
                    </div>
                    <div className='flex flex-col justify-center items-center gap-[12px] -mt-12 xl:mt-0'>
                        <h1
                            className='font-medium text-[40px] text-black'>
                            {t('auth.forgot_title')}
                        </h1>
                        <p
                            className='font-medium text-[16px] text-[#666D80]'>
                            {t('auth.forgot_subtitle')}
                        </p>
                    </div>
                    <div>
                        <ForgotPasswordForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage