import {CgClose} from "react-icons/cg";
import {GoLock, GoTrash} from "react-icons/go";
import {type SetStateAction, useState} from "react";
import {FiEye, FiEyeOff} from "react-icons/fi";
import profileApi from "../../features/profile/api/profileApi.ts";
import {useNavigate} from "react-router-dom";
import {BiErrorCircle} from "react-icons/bi";
import {useStore} from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";


type DeleteAccountModalProps = {
    setDeleteModalOpen: React.Dispatch<SetStateAction<boolean>>
}

const DeleteAccountModal = ({setDeleteModalOpen}: DeleteAccountModalProps) => {
    const theme = useStore(themeStore, (state) => state.theme);

    const navigate = useNavigate();
    const [password, setPassword] = useState<string>('')
    const [visiblePassword, setVisiblePassword] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const deleteAccount = async (password: string) => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return;
        }

        try {
            await profileApi.deleteProfile({password})
        } catch (e) {
            setError('Invalid credentials');
        }

        navigate("/");
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-5 ${
            theme === 'dark'
                ? 'bg-black/80'
                : 'bg-black/40'
        }`}>
            <div className={`w-[450px] rounded-[20px] p-5 ${
                theme === 'dark'
                    ? 'bg-[#020817] border border-[#123A70] text-white shadow-[0_0_35px_rgba(21,151,255,0.15)]'
                    : 'bg-white'
            }`}>
                <div className='w-full'>
                    <div className='w-full flex items-center justify-end'>
                        <button className={`h-[20px] w-[20px] flex items-center justify-center rounded-full sm:h-[28px] sm:w-[28px] cursor-pointer ${
                            theme === 'dark'
                                ? 'text-[#7184A3] hover:text-white hover:bg-[#0B1D38]'
                                : 'text-gray-500'
                        }`} onClick={() => setDeleteModalOpen(false)}><CgClose size={24}/></button>
                    </div>
                    <div className='w-full flex flex-col items-center justify-center gap-3 mb-5'>
                        <div className={`w-[76px] h-[76px] flex items-center justify-center rounded-full ${
                            theme === 'dark' ? 'bg-[#3A1020]' : 'bg-red-200'
                        }`}>
                            <div className='w-[58px] h-[58px] flex items-center justify-center text-white bg-red-500 rounded-full'>
                                <GoTrash size={28}/>
                            </div>
                        </div>
                        <h3 className='text-[28px] font-medium'>Delete Account ?</h3>
                        <p className={`w-[320px] text-center ${
                            theme === 'dark' ? 'text-[#7184A3]' : 'text-[#6F6F6F]'
                        }`}>This action cannot be undone. All your data will be permanently deleted</p>
                    </div>
                    <div className='w-full flex flex-col items-center justify-center gap-3 mb-5'>
                        <p className='w-full text-center font-medium'>Please enter your password to continue</p>
                        {(error) &&
                            <div
                                className={`w-full h-[38px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3]`}>
                                <BiErrorCircle size={16} className="ml-[10px] text-[#DF1C41] shrink-0"/>
                                <p className="text-[14px] font-medium">
                                    {error}
                                </p>
                            </div>
                        }
                        <div className='w-full relative'>
                            <GoLock  className='absolute top-3 left-3 text-2xl' />
                            <input value={password} type={`${visiblePassword ? 'text': 'password'}`} className={`w-full h-12 outline-none rounded-full px-12 ${
                                theme === 'dark'
                                    ? 'bg-[#071329] border border-[#164B86] text-white placeholder:text-[#60718D] focus:border-[#1597FF]'
                                    : 'border border-gray-100'
                            }`} placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} onClick={() => setError(null)} />
                            {visiblePassword ?
                                <FiEye size={24}
                                       className={`absolute top-3 right-5 cursor-pointer ${
                                           theme === 'dark' ? 'text-[#7184A3]' : 'text-gray-400'
                                       }`}
                                       onClick={() => setVisiblePassword(!visiblePassword)}
                                />
                                :
                                <FiEyeOff size={24}
                                          className={`absolute top-3 right-5 cursor-pointer ${
                                              theme === 'dark' ? 'text-[#7184A3]' : 'text-gray-400'
                                          }`}
                                          onClick={() => setVisiblePassword(!visiblePassword)}
                                />
                            }
                        </div>
                    </div>
                    <div className='flex flex-row justify-center items-center gap-3'>
                        <button className={`flex-1 h-13 rounded-full cursor-pointer ${
                            theme === 'dark'
                                ? 'border border-[#164B86] bg-[#071329] text-[#A8B8D0] hover:bg-[#0B2A52]'
                                : 'border border-gray-300 text-[#6F6F6F]'
                        }`} onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                        <button className={`flex-1 h-13 border text-white bg-gradient-to-b from-[#ED8296] to-[#DF1C41] rounded-full cursor-pointer ${
                            theme === 'dark'
                                ? 'border-[#7A1F35] shadow-[0_0_15px_rgba(223,28,65,0.2)]'
                                : 'border-gray-300'
                        }`} onClick={() => deleteAccount(password)}>Yes, Delete My Account</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteAccountModal