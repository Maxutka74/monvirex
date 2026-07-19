import {useEffect, useRef, useState} from "react";
import authHooks from "../../model/useAuth.ts";
import {BiErrorCircle} from "react-icons/bi";
import {Link} from "react-router-dom";
import {GoArrowLeft} from "react-icons/go";
import SuccessModal from "../../../../shared/ui/SuccessModal.tsx";
import type {AxiosError} from "axios";

const VerifyEmailForm = () => {
    const [resetData] = useState(() =>
        JSON.parse(sessionStorage.getItem("verify_token") || '{}')
    )

    const [ code, setCode ] = useState(['', '', '', '', '', ''])
    const [ timer, setTimer ] = useState<number>(() => {
        const remainingTime = resetData.expires_at - Date.now()

        return remainingTime > 0 ? Math.floor(remainingTime / 1000) : 0
    })

    const inputs = useRef<(HTMLInputElement | null)[]>([])

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
                    <div className="w-full h-[38px] flex justify-start items-center gap-2 rounded-[6px] bg-[#FFF0F3] mb-[24px]">
                        <BiErrorCircle size={16}
                                       className="ml-[10px] text-[#DF1C41]"
                        />
                        <p className="text-[14px] font-medium">
                            {backendError}
                        </p>
                    </div>
                }

                <p className="text-[18px] font-medium mb-4">
                    Enter your OTP
                </p>
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
                            className={`w-full h-[48px] rounded-[50px] text-center placeholder-[16px] placeholder-[#0D0D12] border 
                            ${isError? 'border-[#EC778D] shadow-[0px_0px_3px_#F2D7DF]'
                                : code[index]? 'border-[#429EFF] shadow-[0px_0px_3px_#285DF2]'
                                    : 'border-[#DFE1E7]'} outline-none`}
                        />
                    ))}
                </div>
                <div className="mt-6 mb-6">
                    <div className="flex flex-row items-center justify-start gap-2 mb-4">
                        <p className="font-medium text-[#666D80] text-[14px] ">
                            Didn't receive the email?
                        </p>
                        {timer > 0? <div> <span>{Math.floor(timer / 60)}</span><span>:</span><span>{(timer % 60).toString().padStart(2, '0')}</span> </div>
                            : <button
                                type='button'
                                onClick={() => blockResendCode()}
                                className="cursor-pointer">
                                Click to resend code
                            </button>}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-6 mb-6">
                        <button
                            className={`w-full h-[44px] rounded-[50px] text-white text-[16px] font-medium 
                            ${code.every(item=> item !== '')? 'text-white bg-[#429EFF] cursor-pointer'
                                : 'bg-[#ECEFF3] cursor-not-allowed'} `}
                            disabled={!(code.every(item => item !== ''))}>
                            Create Account
                        </button>
                        <Link to="/"
                            onClick={() => sessionStorage.removeItem('verify_token')}
                              className="w-[85px] h-[40px] flex flex-row items-center justify-center gap-3">
                            <GoArrowLeft />
                            Back
                        </Link>
                    </div>
                </div>
            </form>
            {isSuccess && <SuccessModal title={'Congratulations, You\'re In'} message={'Let\'s get started and take your customer support dashboard to the next level!'} link={'#'} buttonName={'Get Started'} />}
        </>
    )
}

export default VerifyEmailForm