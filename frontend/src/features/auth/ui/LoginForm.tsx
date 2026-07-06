import {useState} from "react";

import {FiEye, FiEyeOff, FiLock, FiMail} from "react-icons/fi";
import {Link} from "react-router-dom";
import {MdOutlineCheckBoxOutlineBlank} from "react-icons/md";
import {GoCheckbox} from "react-icons/go";
import authHooks from "../model/useAuth.ts"
import SuccessModal from "../../../shared/ui/SuccessModal.tsx";
import {BiErrorCircle} from "react-icons/bi";
import {FcGoogle} from "react-icons/fc";
import { FaTelegram } from "react-icons/fa";
import {GoogleLogin} from "@react-oauth/google";
import { LoginButton } from '@telegram-auth/react'
import type {AxiosError} from "axios";
import {useTranslation} from "react-i18next";

const LoginForm = () => {
    const { t } = useTranslation();

    const [ email, setEmail ] = useState<string>('')
    const [ password, setPassword ] = useState<string>('')

    const [ incorrectEmail, setIncorrectEmail ] = useState<boolean>(false)

    const [ visiblePassword, setVisiblePassword ] = useState<boolean>(false)
    const [ rememberMe, setRememberMe ] = useState<boolean>(false)

    const {mutate: login, isSuccess, isError, error, reset} = authHooks.useLogin()
    const backendError = (error as AxiosError< {detail: string} >)?.response?.data.detail

    const {mutate: google_login} = authHooks.useGoogleLogin()

    const {mutate: telegram_login} = authHooks.useTelegramLogin()

    function sendLoginForm(event: React.FormEvent) {
        event.preventDefault()
        setIncorrectEmail(false)

        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)){
            setIncorrectEmail(true);
            return;
        }

        login( {email: normalizedEmail, password, remember_me: rememberMe} )

    }


    return (
        <>
        <form onSubmit={(event) => sendLoginForm(event)}
              className='flex flex-col items-start justify-center'
        >
            {(incorrectEmail || isError) &&
                <div className="w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
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
            <div className={`w-full h-12 flex items-center bg-gray-100 border 
            ${(incorrectEmail || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]'
                : email.trim().length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]'
                    :   'border-gray-400'} rounded-full px-4 py-2 mb-6`}
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
                    className='w-full outline-none'
                    autoComplete="email"
                />
            </div>
            <label htmlFor="password"
                   className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">
                {t('auth.password')}
            </label>
            <div className={`w-full h-12 flex items-center bg-gray-100 border 
            ${(incorrectEmail || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]'
                :password.length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]'
                    :'border-gray-400'} rounded-full px-4 py-2 mb-6`}
            >
                <FiLock size={24}
                        className="text-gray-400 mr-2"
                />
                <input
                    type={visiblePassword? 'text' : 'password'}
                    id='password'
                    value={password}
                    onChange={(e) => {setPassword(e.target.value); setIncorrectEmail(false); if (isError) reset()}}
                    placeholder={t('auth.placeholders.password')}
                    className='w-full outline-none'
                    autoComplete="current-password"
                />
                {visiblePassword?
                    <FiEye size={24}
                           className="text-gray-400 ml-2"
                           onClick={() => setVisiblePassword(!visiblePassword)}
                    />:
                    <FiEyeOff size={24}
                              className="text-gray-400 ml-2"
                              onClick={() => setVisiblePassword(!visiblePassword)}
                    />
                }
            </div>
            <div className='w-full flex flex-col justify-center gap-4 mb-6'>
                <button className={`w-full h-[54px] rounded-[50px] text-[#818898] text-[16px] font-medium 
                ${email.trim().length > 0 && password.length > 0? 'text-white bg-[#429EFF] cursor-pointer'
                    : 'bg-[#ECEFF3] cursor-not-allowed'}`}
                disabled={!(email.trim().length > 0 && password.length > 0)}
                >
                    {t('auth.login')}
                </button>
                <div className='flex flex-row items-center justify-between'>
                    <div className='flex items-center justify-center gap-2'>
                        <div onClick={() => setRememberMe(!rememberMe)}>
                            {rememberMe === false?
                                <MdOutlineCheckBoxOutlineBlank size={25}
                                                               className="text-[#DFE1E7]"
                                />:
                                <GoCheckbox size={25}/>
                            }
                        </div>
                        <span className="text-[14px] text-[#666D80] font-medium">
                            {t('auth.remember_me')}
                        </span>
                    </div>
                    <Link to={'/reset-password'}
                          className="text-[14px] text-[#6F6F6F] font-medium">
                        {t('auth.forgot_password')}
                    </Link>
                </div>
            </div>
                <div className="w-full flex flex-row items-center justify-between gap-4 mb-6">
                    <hr className="w-full h-[2px] text-[#C1C7D0]" />
                    <span className="text-[12px] text-[#818898] font-medium ">
                        {t('auth.or_sign_in')}
                    </span>
                    <hr className="w-full h-[2px] text-[#C1C7D0]" />
                </div>
                <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-3">
                    <div className="relative w-full xl:w-[212px] h-[48px] cursor-pointer">
                        <div className="pointer-events-none w-full h-full flex flex-row items-center justify-center gap-[12px] pl-4 pt-3 pr-4 pb-3 border border-[#DFE1E7] rounded-[50px] bg-[#F8FAFB]">
                            <FcGoogle size={24} />
                            <span className="text-[14px]">
                                {t('auth.sign_in_google')}
                            </span>
                        </div>

                        <div className="absolute inset-0 opacity-0 overflow-hidden">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    if (credentialResponse.credential) {
                                        google_login(credentialResponse.credential)
                                    }
                                }}
                            />
                        </div>

                    </div>
                    <div className="relative w-full xl:w-[212px] h-[48px] cursor-pointer">
                        <div className="pointer-events-none w-full h-full flex flex-row items-center justify-center gap-[12px] pl-4 pt-3 pr-4 pb-3 border border-[#DFE1E7] rounded-[50px] bg-[#F8FAFB]">
                            <FaTelegram  size={24}
                                         className="text-[#229ED9]"
                            />
                            <span className="text-[14px]">
                                {t('auth.sign_in_telegram')}
                            </span>
                        </div>
                        <div className="absolute inset-0 opacity-0 z-50 overflow-hidden">
                            <LoginButton
                                botUsername="MonvirexBot"
                                onAuthCallback={(data) => {
                                    telegram_login(data)
                                }}
                            />
                        </div>
                    </div>
                </div>
        </form>
        {isSuccess && <SuccessModal title={t('auth.modals.login_success_title')} message={t('auth.modals.login_success_message')} link={'/dashboard'} buttonName={t('auth.modals.get_started')} />}
        </>
    )
}

export default LoginForm