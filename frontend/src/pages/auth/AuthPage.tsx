import {useState} from "react";
import LoginForm from "../../features/auth/ui/form/LoginForm.tsx";
import RegisterForm from "../../features/auth/ui/form/RegisterForm.tsx";
import AuthHero from "../../features/auth/ui/AuthHero.tsx";
import MobileLogo from "../../features/auth/ui/MobileLogo.tsx";

const AuthPage = () => {
    const [ activeTab, setActiveTab ] = useState<'login' | 'register'>('login');

    return (
        <div className="min-h-[100dvh] flex items-center font-['DM_Sans']">
            <AuthHero />
            <div className="w-full xl:w-[42%] flex justify-center items-center overflow-y-auto">
                <div className='w-full max-w-[350px] xl:max-w-[440px] flex flex-col justify-center gap-[24px]' >
                    <div className="flex xl:hidden justify-center">
                        <MobileLogo />
                    </div>
                    <div className='flex flex-col justify-center items-center gap-[12px] -mt-12 xl:mt-0'>
                        <h1
                            className='font-medium text-[40px] text-black'>
                            {activeTab === 'login'? "Welcome": "Create Account"}
                        </h1>
                        <p
                            className='font-medium text-[16px] text-[#666D80]'>
                            {activeTab === 'register'? "Please input to your account": "Please login to entry MONVIREX"}
                        </p>
                        <div className='w-full h-[55px] flex items-center justify-between p-1 rounded-[50px] bg-[#ECEFF3]'>
                            <button
                                type='button'
                                className={activeTab === 'login'? 'w-1/2 h-[44px] text-white bg-black rounded-[50px]':'w-1/2 h-[44px]'}
                                onClick={() => setActiveTab('login')}>
                                Login
                            </button>
                            <button type='button'
                                    className={activeTab === 'register'? 'w-1/2 h-[44px] text-white bg-black rounded-[50px]':'w-1/2 h-[44px]'}
                                    onClick={() => setActiveTab('register')}>
                                Sign Up
                            </button>
                        </div>
                    </div>
                    <div>
                        {activeTab === 'login'? <LoginForm />: <RegisterForm />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthPage