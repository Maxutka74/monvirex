import ChangePasswordForm from "../../features/auth/ui/ChangePasswordForm.tsx";
import {useTranslation} from "react-i18next";
import AuthHero from "../../shared/ui/AuthHero.tsx";



const ChangePasswordPage = () => {
    const { t } = useTranslation();

    return (
        <div className="flex overflow-hidden items-center h-screen font-['DM_Sans']">
            <AuthHero />
            <div className="w-[42%] flex justify-center">
                <div className='w-[500px] flex flex-col justify-center items-center gap-[24px]' >
                    <div className='flex flex-col justify-center items-center gap-[12px]'>
                        <h1
                            className='font-medium text-[40px] text-black'>
                            {t('auth.change_password_title')}
                        </h1>
                        <p
                            className='font-medium text-[16px] text-[#666D80]'>
                            {t('auth.change_password_subtitle')}
                        </p>
                    </div>
                    <div>
                        <ChangePasswordForm />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePasswordPage