import {useState} from "react";
import authHooks from "../model/useAuth.ts";
import {BiErrorCircle, BiUser} from "react-icons/bi";
import {FiEye, FiEyeOff, FiLock, FiMail} from "react-icons/fi";
import {FcGoogle} from "react-icons/fc";
import {GoogleLogin} from "@react-oauth/google";
import {FaTelegram} from "react-icons/fa";
import {LoginButton} from "@telegram-auth/react";
import type {AxiosError} from "axios";

const RegisterForm = () => {
    const [ firstName, setFirstName ] = useState<string>('');
    const [ lastName, setLastName ] = useState<string>('');
    const [ email, setEmail ] = useState<string>('')
    const [ password, setPassword ] = useState<string>('')
    const [ passwordConfirm, setConfirmPassword ] = useState<string>('')

    const [ incorrectEmail, setIncorrectEmail ] = useState<boolean>(false)
    const [ incorrectPassword, setIncorrectPassword ] = useState<boolean>(false)

    const [ visiblePassword, setVisiblePassword ] = useState<boolean>(false)
    const [ visibleConfirmPassword, setVisibleConfirmPassword ] = useState<boolean>(false)



    const {mutate: register, isError, error, reset} = authHooks.useRegister()
    const backendError = (error as AxiosError< {detail: string} >)?.response?.data.detail

    const {mutate: google_login} = authHooks.useGoogleLogin()

    const {mutate: telegram_login} = authHooks.useTelegramLogin()

    function sendRegisterForm(event: React.FormEvent) {
        event.preventDefault()

        setIncorrectEmail(false)
        setIncorrectPassword(false)

        const normalizedEmail = email.trim().toLowerCase()

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)){
            setIncorrectEmail(true);
            return;
        }

        if (password !== passwordConfirm) {
            setIncorrectPassword(true)
            return;
        }

        if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)){
            setIncorrectPassword(true)
            return;
        }

        register( {first_name: firstName.trim(), last_name: lastName.trim(), email: normalizedEmail, password: password, password_confirm:passwordConfirm} )

    }


    return (
        <>
            <form onSubmit={(event) => sendRegisterForm(event)} className='flex flex-col items-start justify-center'>
                {(incorrectEmail || isError) &&
                    <div className="w-[435px] h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
                        <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41]"/>
                        <p className="text-[14px] font-medium">
                            {incorrectEmail
                                ? 'Please enter a valid email address'
                                : backendError || 'Email already exists'}
                        </p>
                    </div>
                }
                {incorrectPassword && (
                    <div className="w-[435px] h-[50px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
                        <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41] shrink-0"/>
                        <p className="text-[14px] font-medium">
                            Password must contain uppercase letter, lowercase letter and number
                        </p>
                    </div>
                )}

                <div className='flex flex-row items-center justify-center gap-3'>
                    <div className="flex flex-col">
                    <label htmlFor="firstName" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">First Name</label>
                        <div className={`w-[212px] h-12 flex items-center bg-gray-100 border ${firstName.trim().length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]': 'border-gray-400'} rounded-full px-3 py-2 mb-6`}>
                            <BiUser size={24} className="text-gray-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                id='firstName'
                                value={firstName}
                                onChange={(e) => {setFirstName(e.target.value);}}
                                placeholder='Input your first name'
                                className='w-[168px] outline-none'
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="lastName" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Last Name</label>
                        <div className={`w-[212px] h-12 flex items-center bg-gray-100 border ${lastName.trim().length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]': 'border-gray-400'} rounded-full px-3 py-2 mb-6`}>
                            <BiUser size={24} className="text-gray-400 mr-2 shrink-0" />
                            <input
                                type="text"
                                id='lastName'
                                value={lastName}
                                onChange={(e) => {setLastName(e.target.value);}}
                                placeholder='Input your last name'
                                className='w-[168px] outline-none'
                            />
                        </div>
                    </div>
                </div>

                <label htmlFor="email" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Email</label>
                <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${(incorrectEmail || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]': email.trim().length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]':   'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                    <FiMail size={24} className="text-gray-400 mr-2" />
                    <input
                        type="text"
                        id='email'
                        value={email}
                        onChange={(e) => {setEmail(e.target.value); setIncorrectEmail(false); if (isError) reset()}}
                        placeholder='user@gmail.com'
                        className='w-[380px] outline-none'
                        autoComplete="email"
                    />
                </div>
                <label htmlFor="password" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Password</label>
                <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${password.length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]': 'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                    <FiLock size={24} className="text-gray-400 mr-2" />
                    <input
                        type={visiblePassword? 'text' : 'password'}
                        id='password'
                        value={password}
                        onChange={(e) => {setPassword(e.target.value); setIncorrectPassword(false);}}
                        placeholder='Your password'
                        className='w-[380px] outline-none'
                        autoComplete="new-password"
                    />
                    {visiblePassword?
                        <FiEye size={24} className="text-gray-400 ml-2" onClick={() => setVisiblePassword(!visiblePassword)}/>:
                        <FiEyeOff size={24} className="text-gray-400 ml-2" onClick={() => setVisiblePassword(!visiblePassword)}/>
                    }
                </div>
                <label htmlFor='confirm_password' className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Confirm Password</label>
                <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${passwordConfirm.length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]': 'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                    <FiLock size={24} className="text-gray-400 mr-2" />
                    <input
                        type={visibleConfirmPassword ? 'text' : 'password'}
                        id='confirm_password'
                        value={passwordConfirm}
                        onChange={(e) => {setConfirmPassword(e.target.value); setIncorrectPassword(false);}}
                        placeholder='Input to confirm password'
                        className='w-[380px] outline-none'
                        autoComplete="new-password"
                    />
                    {visibleConfirmPassword?
                        <FiEye size={24} className="text-gray-400 ml-2" onClick={() => setVisibleConfirmPassword(!visibleConfirmPassword)}/>:
                        <FiEyeOff size={24} className="text-gray-400 ml-2" onClick={() => setVisibleConfirmPassword(!visibleConfirmPassword)}/>
                    }
                </div>
                <div className='flex flex-col justify-center gap-4 mb-6'>
                    <button className={`w-[435px] h-[54px] rounded-[50px] text-[#818898] text-[16px] font-medium ${firstName.trim().length > 1 && lastName.trim().length > 1 && email.trim().length > 7 && password.length > 7 && passwordConfirm.length > 7 && password === passwordConfirm? 'text-white bg-[#429EFF] cursor-pointer': 'bg-[#ECEFF3] cursor-not-allowed'}`} disabled={!(firstName.trim().length > 1 && lastName.trim().length > 1 && email.trim().length > 7 && password.length > 7 && passwordConfirm.length > 7 && password === passwordConfirm)}>Continue</button>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 mb-6">
                    <hr className="w-[161px] text-[#C1C7D0]" />
                    <span className="text-[12px] text-[#818898] font-medium ">Or Sign up with</span>
                    <hr className="w-[161px] text-[#C1C7D0]" />
                </div>
                <div className="flex flex-row items-center justify-center gap-3">
                    <div className="relative w-[212px] h-[48px] cursor-pointer">
                        <div className="pointer-events-none w-full h-full flex flex-row items-center justify-center gap-[12px] pl-4 pt-3 pr-4 pb-3 border border-[#DFE1E7] rounded-[50px] bg-[#F8FAFB]">
                            <FcGoogle size={24} />
                            <span className="text-[14px]">
                                Sign up with Google
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
                                Sign up with Telegram
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
        </>
    )
}

export default RegisterForm