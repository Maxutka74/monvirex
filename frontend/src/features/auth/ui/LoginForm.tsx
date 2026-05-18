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

const LoginForm = () => {
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
        <form onSubmit={(event) => sendLoginForm(event)} className='flex flex-col items-start justify-center'>
            {(incorrectEmail || isError) &&
                <div className="w-[435px] h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
                    <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41]"/>
                    <p className="text-[14px] font-medium">
                        {incorrectEmail
                            ? 'Please enter a valid email address'
                            : backendError || 'Something went wrong'}
                    </p>
                </div>
            }

            <label htmlFor="email" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Email</label>
            <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${(incorrectEmail || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]': email.trim().length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]':   'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                <FiMail size={24} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    id='email'
                    value={email}
                    onChange={(e) => {setEmail(e.target.value); setIncorrectEmail(false); if (isError) reset()}}
                    placeholder='Input your email'
                    className='w-[380px] outline-none'
                    autoComplete="email"
                />
            </div>
            <label htmlFor="password" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Password</label>
            <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${(incorrectEmail || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]':password.length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]':   'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                <FiLock size={24} className="text-gray-400 mr-2" />
                <input
                    type={visiblePassword? 'text' : 'password'}
                    id='password'
                    value={password}
                    onChange={(e) => {setPassword(e.target.value); setIncorrectEmail(false); if (isError) reset()}}
                    placeholder='Input your password'
                    className='w-[380px] outline-none'
                    autoComplete="current-password"
                />
                {visiblePassword?
                    <FiEye size={24} className="text-gray-400 ml-2" onClick={() => setVisiblePassword(!visiblePassword)}/>:
                    <FiEyeOff size={24} className="text-gray-400 ml-2" onClick={() => setVisiblePassword(!visiblePassword)}/>
                }
            </div>
            <div className='flex flex-col justify-center gap-4 mb-6'>
                <button className={`w-[435px] h-[54px] rounded-[50px] text-[#818898] text-[16px] font-medium ${email.trim().length > 0 && password.length > 0? 'text-white bg-[#429EFF] cursor-pointer': 'bg-[#ECEFF3] cursor-not-allowed'}`} disabled={!(email.trim().length > 0 && password.length > 0)}>Login</button>
                <div className='flex flex-row items-center justify-between'>
                    <div className='flex items-center justify-center gap-2'>
                        <div onClick={() => setRememberMe(!rememberMe)}>
                            {rememberMe === false?
                                <MdOutlineCheckBoxOutlineBlank size={25} className="text-[#DFE1E7]"/>:
                                <GoCheckbox size={25}/>
                            }
                        </div>
                        <span className="text-[14px] text-[#666D80] font-medium">Remember me</span>
                    </div>
                    <Link to={'/reset-password'} className="text-[14px] text-[#6F6F6F] font-medium">Forgot Password ?</Link>
                </div>
            </div>
                <div className="flex flex-row items-center justify-between gap-4 mb-6">
                    <hr className="w-[161px] text-[#C1C7D0]" />
                    <span className="text-[12px] text-[#818898] font-medium ">Or Sign in with</span>
                    <hr className="w-[161px] text-[#C1C7D0]" />
                </div>
                <div className="flex flex-row items-center justify-center gap-3">
                    <div className="relative w-[212px] h-[48px] cursor-pointer">
                        <div className="pointer-events-none w-full h-full flex flex-row items-center justify-center gap-[12px] pl-4 pt-3 pr-4 pb-3 border border-[#DFE1E7] rounded-[50px] bg-[#F8FAFB]">
                            <FcGoogle size={24} />
                            <span className="text-[14px]">
                                Sign in with Google
                            </span>
                        </div>

                        <div
                            className="absolute inset-0 opacity-0 overflow-hidden">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    if (credentialResponse.credential) {
                                        google_login(credentialResponse.credential)
                                    }
                                }}
                            />
                        </div>

                    </div>
                    <div className="relative w-[212px] h-[48px] cursor-pointer">
                        <div className="pointer-events-none w-full h-full flex flex-row items-center justify-center gap-[12px] pl-4 pt-3 pr-4 pb-3 border border-[#DFE1E7] rounded-[50px] bg-[#F8FAFB]">
                            <FaTelegram  size={24} className="text-[#229ED9]"/>
                            <span className="text-[14px]">
                                Sign in with Telegram
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
        {isSuccess && <SuccessModal title={'Login Successful'} message={'Let\'s get started and take your customer support dashboard to the next level!'} link={'#'} buttonName={'Get Started'} />}
        </>
    )
}

export default LoginForm