import {useEffect, useRef, useState} from "react";
import authHooks from "../model/useAuth.ts";
import {BiErrorCircle} from "react-icons/bi";
import {Link} from "react-router-dom";
import {GoArrowLeft} from "react-icons/go";
import SuccessModal from "../../../shared/ui/SuccessModal.tsx";
import type {AxiosError} from "axios";
import {useTranslation} from "react-i18next";

const VerifyEmailForm = () => {
    const { t } = useTranslation();

    const resetData = JSON.parse(sessionStorage.getItem("verify_token") || '{}');

    const [ code, setCode ] = useState(['', '', '', '', '', ''])
    const [ timer, setTimer ] = useState<number>(0)

    const inputs = useRef<(HTMLInputElement | null)[]>([])
    const remainingTime = resetData.expires_at - Date.now()

    const { mutate: resendRegister } = authHooks.useResendRegister()
    const { mutate: verifyRegisterUser, isSuccess, isError, error, reset } = authHooks.useVerifyEmail()
    const backendError = (error as AxiosError< {detail: string} >)?.response?.data.detail

    function handleChange(num: string, index: number) {
        reset()

        if (!/^\d?$/.test(num)) return

        const newCode = [...code]
        newCode[index] = num
        setCode(newCode)

        if (num && index < code.length - 1){
            inputs.current[index+1]?.focus()
        }
    }

    function handleKeyDown(e: React.KeyboardEvent, index: number) {
        if (e.key === "Backspace" && index > 0) {
            const newCode = [...code];

            if (!code[index]) {
                newCode[index - 1] = "";
                setCode(newCode);

                inputs.current[index - 1]?.focus();
            }
        }
    }

    function blockResendCode() {
        if (resetData.reg_id) {
            resendRegister(resetData.reg_id, {
                onSuccess: () => setTimer(120)
            })
        }

    }

    function sendVerifyEmailForm(e: React.FormEvent) {
        e.preventDefault();

        const verify_code = [...code].join('')

        if (resetData.reg_id && verify_code.length === 6) {
            verifyRegisterUser({reg_id: resetData.reg_id, code: verify_code})
        }
    }

    useEffect(() => {
        if (remainingTime > 0) setTimer(Math.floor(remainingTime / 1000))
    }, []);

    useEffect(() => {
        if (timer <= 0) return

        const interval = setInterval(() => {
            setTimer(timer => timer-1)
        }, 1000)

        return () => clearInterval(interval)

    }, [timer])


    return (
        <>
            <form onSubmit={(event) => sendVerifyEmailForm(event)}>
                {isError &&
                    <div className="w-[435px] h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
                        <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41]"/>
                        <p className="text-[14px] font-medium">{backendError}</p>
                    </div>
                }

                <p className="text-[18px] font-medium mb-4">{t('auth.enter_otp')}</p>
                <div className="flex flex-row items-center justify-center gap-3">
                    {code.map((num, index) => (
                        <input
                            type='tel'
                            key={index}
                            ref={(el) => {inputs.current[index] = el}}
                            value={num}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            maxLength={1}
                            inputMode='numeric'
                            className={`w-[62px] h-[48px] rounded-[50px] text-center placeholder-[16px] placeholder-[#0D0D12] border ${isError? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]': code[index]? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]': 'border-[#DFE1E7]'} outline-none`}
                        />
                    ))}
                </div>
                <div className="mt-6 mb-6">
                    <div className="flex flex-row items-center justify-start gap-2 mb-4">
                        <p className="font-medium text-[#666D80] text-[14px] ">{t('auth.didnt_receive')}</p>
                        {timer > 0? <div> <span>{Math.floor(timer / 60)}</span><span>:</span><span>{(timer % 60).toString().padStart(2, '0')}</span> </div>: <button type='button' onClick={() => blockResendCode()} className="cursor-pointer">{t('auth.resend_code')}</button>}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-6 mb-6">
                        <button className={`w-[435px] h-[44px] rounded-[50px] text-white text-[16px] font-medium ${code.every(item=> item !== '')? 'text-white bg-[#429EFF] cursor-pointer': 'bg-[#ECEFF3] cursor-not-allowed'} `} disabled={!(code.every(item => item !== ''))}>{t('auth.create_account_button')}</button>
                        <Link onClick={() => sessionStorage.removeItem('verify_token')} to="/" className="w-[85px] h-[40px] flex flex-row items-center justify-center gap-3"><GoArrowLeft />{t('auth.back')}</Link>
                    </div>
                </div>
            </form>
            {isSuccess && <SuccessModal title={t('auth.modals.register_success_title')} message={t('auth.modals.register_success_message')} link={'#'} buttonName={t('auth.modals.get_started')} />}
        </>
    )
}

export default VerifyEmailForm