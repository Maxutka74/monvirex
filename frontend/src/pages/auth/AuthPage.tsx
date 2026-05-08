import {useState} from "react";
import  logo  from '../../assets/Monvirex.png'
import LoginForm from "../../features/auth/ui/LoginForm.tsx";
import RegisterForm from "../../features/auth/ui/RegisterForm.tsx";

const AuthPage = () => {
    const [ activeTab, setActiveTab ] = useState<'login' | 'register'>('login');

    return (
        <div className="flex flex-row items-center justify-center h-screen font-['DM_Sans'] gap-70">
            <img src={logo} alt="Logo" className="w-[500px] h-[500px]" loading="lazy" />
            <div className='w-[500px] h-[650px] flex flex-col justify-center items-center gap-[24px]' >
                <div className='flex flex-col justify-center items-center gap-[12px]'>
                    <h1 className='font-medium text-[40px] text-black'>Hi, Welcome</h1>
                    <p className='font-medium text-[16px] text-[#666D80]'>Please login to entry MONVIREX</p>
                    <div className='w-[440px] h-[55px] flex items-center justify-between p-1 rounded-[50px] bg-[#ECEFF3]'>
                        <button className={activeTab === 'login'? 'w-[208px] h-[44px] text-white bg-black rounded-[50px]':'w-[208px] h-[44px]'} onClick={() => setActiveTab('login')}>Login</button>
                        <button className={activeTab === 'register'? 'w-[208px] h-[44px] text-white bg-black rounded-[50px]':'w-[208px] h-[44px]'} onClick={() => setActiveTab('register')}>Sign Up</button>
                    </div>
                </div>
                <div>
                    {activeTab === 'login'? <LoginForm />: <RegisterForm />}
                </div>
            </div>
        </div>
    )
}

export default AuthPage