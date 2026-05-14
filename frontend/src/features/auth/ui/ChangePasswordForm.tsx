import {useState} from "react";

import {FiEye, FiEyeOff, FiLock} from "react-icons/fi";

import authHooks from '../model/useAuth.ts'
import {BiErrorCircle} from "react-icons/bi";
import {GoArrowLeft} from "react-icons/go";
import {Link} from "react-router-dom";
import SuccessModal from "../../../shared/ui/SuccessModal.tsx";

const ChangePasswordForm = () => {
    const [ password, setPassword ] = useState<string>('')
    const [ passwordConfirm, setConfirmPassword ] = useState<string>('')
    const [ incorrectPassword, setIncorrectPassword ] = useState<boolean>(false)

    const [ visiblePassword, setVisiblePassword ] = useState<boolean>(false)
    const [ visibleConfirmPassword, setVisibleConfirmPassword ] = useState<boolean>(false)

    const [ showModal , setShowModal ] = useState<boolean>(false)

    const { mutate: changePassword, isSuccess, isError, reset } = authHooks.useChangePassword()

    function sendChangePasswordForm(event: React.FormEvent) {
        event.preventDefault()
        if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)){
            setIncorrectPassword(true)
            return;
        }

        setShowModal(false)
        const resetVerifyData = JSON.parse(localStorage.getItem("reset_verify_token") || '{}')
        changePassword({
                'reset_verify_id': resetVerifyData.reset_verify_id,
                'password': password,
                'password_confirm': passwordConfirm,
        })
        }


    return (
        <>
            <form onSubmit={(event) => sendChangePasswordForm(event)} className='flex flex-col items-start justify-center'>
                {(incorrectPassword || isError) &&
                    <div className="w-[435px] h-[50px] flex justify-start items-center  text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] p-1 mb-[24px]">
                        <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41] shrink-0"/>
                        <p className="text-[14px] font-medium ml-2">Your password must be at least 8 characters long and include a capital letter and a number</p>
                    </div>
                }

                <label htmlFor="password" className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Password</label>
                <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${(incorrectPassword || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]':password.length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]':   'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                    <FiLock size={24} className="text-gray-400 mr-2" />
                    <input
                        type={visiblePassword ? 'text' : 'password'}
                        id='password'
                        value={password}
                        onChange={(e) => {setPassword(e.target.value); setIncorrectPassword(false); reset()}}
                        placeholder='Input new password'
                        className='w-[380px] outline-none'
                        autoComplete="new-password"
                    />
                     {visiblePassword?
                        <FiEye size={24} className="text-gray-400 ml-2" onClick={() => setVisiblePassword(!visiblePassword)}/>:
                        <FiEyeOff size={24} className="text-gray-400 ml-2" onClick={() => setVisiblePassword(!visiblePassword)}/>
                    }
                </div>
                <label htmlFor='confirm_password' className="mb-1.5 font-medium text-[14px] text-[#0D0D12]">Confirm Password</label>
                <div className={`w-[435px] h-12 flex items-center bg-gray-100 border ${(incorrectPassword || isError) ? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]':passwordConfirm.length > 0? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]':   'border-gray-400'} rounded-full px-4 py-2 mb-6`}>
                    <FiLock size={24} className="text-gray-400 mr-2" />
                    <input
                        type={visibleConfirmPassword ? 'text' : 'password'}
                        id='confirm_password'
                        value={passwordConfirm}
                        onChange={(e) => {setConfirmPassword(e.target.value); setIncorrectPassword(false); reset()}}
                        placeholder='Input to confirm password'
                        className='w-[380px] outline-none'
                        autoComplete="new-password"
                    />
                    {visibleConfirmPassword?
                        <FiEye size={24} className="text-gray-400 ml-2" onClick={() => setVisibleConfirmPassword(!visibleConfirmPassword)}/>:
                        <FiEyeOff size={24} className="text-gray-400 ml-2" onClick={() => setVisibleConfirmPassword(!visibleConfirmPassword)}/>
                    }
                </div>
                <div className="flex flex-col items-center justify-center gap-6 mb-6">
                    <button className={`w-[435px] h-[44px] rounded-[50px] text-white text-[16px] font-medium  ${!(password.length === 0 || passwordConfirm.length === 0 || password !== passwordConfirm) ? 'bg-[#429EFF] cursor-pointer': 'bg-[#ECEFF3] cursor-not-allowed'}`} disabled={(password.length === 0 || passwordConfirm.length === 0 || password !== passwordConfirm)}>Confirm</button>
                    <Link to="/verify-reset-password" onClick={() => localStorage.removeItem('reset_verify_token')} className="w-[85px] h-[40px] flex items-center justify-center gap-3"><GoArrowLeft />Back</Link>
                </div>
            </form>
            {(isSuccess && showModal === false) && <SuccessModal title={'Password updated successfully'} message={'Your password has been successfully updated, please log in first'} link={'/'} buttonName={'Login Now'} onClose={() => {setShowModal(!showModal)}}/>}
        </>
    )
}

export default ChangePasswordForm