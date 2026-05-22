import {BiErrorCircle} from "react-icons/bi";
import {FiMail} from "react-icons/fi";
import {useState} from "react";
import authHooks from  '../model/useAuth.ts'
import {GoArrowLeft} from "react-icons/go";
import {Link, useNavigate} from "react-router-dom";
import type {AxiosError} from "axios";
import {useTranslation} from "react-i18next";

const ForgotPasswordForm = () => {
    const { t } = useTranslation();

    const [ email , setEmail ] = useState<string>('');
    const [ incorrectEmail, setIncorrectEmail] = useState<boolean>(false);

    const navigate = useNavigate();

    const { mutate: resetPassword, isError, error, reset } = authHooks.useResetPassword()
    const backendError = (error as AxiosError< {detail: string} >)?.response?.data.detail

    function sendResetPasswordForm(event: React.FormEvent){
        event.preventDefault()

        setIncorrectEmail(false)

        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)){
            setIncorrectEmail(true);
            return;
        }

        const check_email = JSON.parse(sessionStorage.getItem('reset_token') || '{}')
        if (check_email.email === normalizedEmail && check_email.expires_at > Date.now()) {
            navigate('/verify-reset-password')
            return;
        } else {
            resetPassword(normalizedEmail)
        }
    }

    return (
        <>
            <form onSubmit={(event) => sendResetPasswordForm(event)}
                  className='flex flex-col items-start justify-center'>
                {(incorrectEmail || isError) &&
                    <div className="w-[435px] h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
                        <BiErrorCircle size={16}
                                       className="ml-[10px] text-[#DF1C41]"
                        />
                        <p className="text-[14px] font-medium">
                            {incorrectEmail
                                ? t('auth.errors.invalid_email')
                                : backendError || t('auth.errors.something_went_wrong')}
                        </p>
                    </div>
                }

                <label htmlFor="email"
                       className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">
                    {t('auth.email')}
                </label>
                <div className={`w-[435px] h-12 flex items-center bg-gray-100 border 
                ${(incorrectEmail || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]'
                    : email.trim().length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]'
                        :'border-gray-400'} rounded-full px-4 py-2 mb-6`}
                >
                    <FiMail size={24}
                            className="text-gray-400 mr-2"
                    />
                    <input
                        type="text"
                        id='email'
                        value={email}
                        onChange={(e) => {setEmail(e.target.value); setIncorrectEmail(false); if (isError) reset()}}
                        placeholder={t('auth.placeholders.email')}
                        className='w-[380px] outline-none'
                        autoComplete='email'
                    />
                </div>
                <div className="flex flex-col items-center justify-center  mb-6">
                    <button className={`w-[435px] h-[44px] rounded-[50px] text-[#818898] text-[16px] font-medium 
                        ${email.trim().length > 0? 'text-white bg-[#429EFF] cursor-pointer' 
                        : 'bg-[#ECEFF3] cursor-not-allowed'} mb-6`}
                        disabled={!(email.trim().length > 0)}
                    >
                        {t('auth.continue')}
                    </button>
                    <Link to="/"
                          className="w-[85px] h-[40px] flex flex-row items-center justify-center gap-3"
                    >
                        <GoArrowLeft />
                        {t('auth.back')}
                    </Link>
                </div>
            </form>
        </>
    )
}

export default ForgotPasswordForm