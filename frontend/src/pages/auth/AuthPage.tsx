import {useState} from "react";
import LoginForm from "../../features/auth/ui/LoginForm.tsx";
import RegisterForm from "../../features/auth/ui/RegisterForm.tsx";
import {useTranslation} from "react-i18next";
import AuthHero from "../../shared/ui/AuthHero.tsx";

const AuthPage = () => {
    const [ activeTab, setActiveTab ] = useState<'login' | 'register'>('login');
    const { t } = useTranslation();

    return (
        <div className="h-screen overflow-hidden flex items-center font-['DM_Sans']">
            <AuthHero />
            <div className="w-[42%] flex justify-center">
                <div className='w-[500px] flex flex-col justify-center items-center gap-[24px]' >
                    <div className='flex flex-col justify-center items-center gap-[12px]'>
                        <h1
                            className='font-medium text-[40px] text-black'>
                            {activeTab === 'login'? t('auth.welcome'): t('auth.create_account')}
                        </h1>
                        <p
                            className='font-medium text-[16px] text-[#666D80]'>
                            {activeTab === 'register'? t('auth.create_subtitle'): t('auth.login_subtitle')}
                        </p>
                        <div className='w-[440px] h-[55px] flex items-center justify-between p-1 rounded-[50px] bg-[#ECEFF3]'>
                            <button
                                type='button'
                                className={activeTab === 'login'? 'w-[208px] h-[44px] text-white bg-black rounded-[50px]':'w-[208px] h-[44px]'}
                                onClick={() => setActiveTab('login')}>
                                {t('auth.login')}
                            </button>
                            <button type='button'
                                    className={activeTab === 'register'? 'w-[208px] h-[44px] text-white bg-black rounded-[50px]':'w-[208px] h-[44px]'}
                                    onClick={() => setActiveTab('register')}>
                                {t('auth.sign_up')}
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