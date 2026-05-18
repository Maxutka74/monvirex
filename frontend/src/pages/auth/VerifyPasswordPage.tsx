import  logo  from '../../assets/Monvirex.png'
import VerifyPasswordForm from "../../features/auth/ui/VerifyPasswordForm.tsx";


const VerifyPasswordPage = () => {

    return (
        <div className="flex flex-row items-center justify-center h-screen font-['DM_Sans'] gap-70">
            <img src={logo} alt="Logo" className="w-[500px] h-[500px]" loading="lazy" />
            <div className='w-[500px] h-[650px] flex flex-col justify-center items-center gap-[24px]' >
                <div className='flex flex-col justify-center items-center gap-[12px]'>
                    <h1 className='font-medium text-[40px] text-black'>Verify Reset Code</h1>
                    <p className='font-medium text-[16px] text-[#666D80]'>Enter the verification code sent to your email</p>
                </div>
                <div>
                    <VerifyPasswordForm />
                </div>
            </div>
        </div>
    )
}

export default VerifyPasswordPage