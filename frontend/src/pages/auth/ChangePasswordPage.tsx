import  logo  from '../../assets/Monvirex.png'
import ChangePasswordForm from "../../features/auth/ui/ChangePasswordForm.tsx";



const ChangePasswordPage = () => {

    return (
        <div className="flex flex-row items-center justify-center h-screen font-['DM_Sans'] gap-70">
            <img src={logo} alt="Logo" className="w-[500px] h-[500px]" loading="lazy" />
            <div className='w-[500px] h-[650px] flex flex-col justify-center items-center gap-[24px]' >
                <div className='flex flex-col justify-center items-center gap-[12px]'>
                    <h1 className='font-medium text-[40px] text-black'>Forgot Password ?</h1>
                    <p className='font-medium text-[16px] text-[#666D80]'>No worries, we’ll send you reset instructions</p>
                </div>
                <div>
                    <ChangePasswordForm />
                </div>
            </div>
        </div>
    )
}

export default ChangePasswordPage