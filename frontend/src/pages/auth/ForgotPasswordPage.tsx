import  logo  from '../../assets/Monvirex.png'
import ForgotPasswordForm from "../../features/auth/ui/ForgotPasswordForm.tsx";
import {useTranslation} from "react-i18next";

const ForgotPasswordPage = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-row items-center justify-center h-screen font-['DM_Sans'] gap-70">
            <img src={logo} alt="Logo" className="w-[500px] h-[500px]" loading="lazy" />
            <div className='w-[500px] h-[650px] flex flex-col justify-center items-center gap-[24px]' >
                <div className='flex flex-col justify-center items-center gap-[12px]'>
                    <h1 className='font-medium text-[40px] text-black'>{t('auth.forgot_title')}</h1>
                    <p className='font-medium text-[16px] text-[#666D80]'>{t('auth.forgot_subtitle')}</p>
                </div>
                <div>
                    <ForgotPasswordForm />
                </div>
            </div>
        </div>
    )
}

export default ForgotPasswordPage