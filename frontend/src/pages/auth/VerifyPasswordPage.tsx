import VerifyPasswordForm from "../../features/auth/ui/VerifyPasswordForm.tsx";
import {useTranslation} from "react-i18next";
import AuthHero from "../../shared/ui/AuthHero.tsx";


const VerifyPasswordPage = () => {
    const { t } = useTranslation();

    return (
        <div className="flex overflow-hidden items-center h-screen font-['DM_Sans']">
            <AuthHero />
            <div className="w-[42%] flex justify-center">
                <div className='w-[500px] flex flex-col justify-center items-center gap-[24px]' >
                    <div className='flex flex-col justify-center items-center gap-[12px]'>
                        <h1
                            className='font-medium text-[40px] text-black'>
                            {t('auth.forgot_password')}
                        </h1>
                        <p className='font-medium text-[16px] text-[#666D80]'>
                            {t('auth.verify_reset_subtitle')}
                        </p>
                    </div>
                    <div>
                        <VerifyPasswordForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyPasswordPage