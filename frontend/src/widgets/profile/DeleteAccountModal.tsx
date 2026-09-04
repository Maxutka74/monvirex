import {CgClose} from "react-icons/cg";
import {GoLock, GoTrash} from "react-icons/go";
import {type SetStateAction, useState} from "react";
import {FiEye, FiEyeOff} from "react-icons/fi";
import profileApi from "../../features/profile/api/profileApi.ts";
import {useNavigate} from "react-router-dom";
import {BiErrorCircle} from "react-icons/bi";


type DeleteAccountModalProps = {
    setDeleteModalOpen: React.Dispatch<SetStateAction<boolean>>
}

const DeleteAccountModal = ({setDeleteModalOpen}: DeleteAccountModalProps) => {
    const navigate = useNavigate();
    const [password, setPassword] = useState<string>('')
    const [visiblePassword, setVisiblePassword] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const deleteAccount = async (password) => {
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-5'>
            <div className='w-[450px] bg-white rounded-[20px] p-5'>
                <div className='w-full'>
                    <div className='w-full flex items-center justify-end'>
                        <button className='h-[20px] w-[20px] flex items-center justify-center rounded-full sm:h-[28px] sm:w-[28px] text-gray-500 cursor-pointer' onClick={() => setDeleteModalOpen(false)}><CgClose size={24}/></button>
                    </div>
                    <div className='w-full flex flex-col items-center justify-center gap-3 mb-5'>
                        <div className='w-[76px] h-[76px] flex items-center justify-center bg-red-200 rounded-full'>
                            <div className='w-[58px] h-[58px] flex items-center justify-center text-white bg-red-500 rounded-full'>
                                <GoTrash size={28}/>
                            </div>
                        </div>
                        <h3 className='text-[28px] font-medium'>Delete Account ?</h3>
                        <p className='w-[320px] text-center text-[#6F6F6F]'>This action cannot be undone. All your data will be permanently deleted</p>
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
                            <input value={password} type={`${visiblePassword ? 'text': 'password'}`} className='w-full h-12 outline-none border border-gray-100 rounded-full px-12' placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} onClick={() => setError(null)} />
                            {visiblePassword ?
                                <FiEye size={24}
                                       className="absolute top-3 right-5 text-gray-400 cursor-pointer"
                                       onClick={() => setVisiblePassword(!visiblePassword)}
                                />
                                :
                                <FiEyeOff size={24}
                                          className="absolute top-3 right-5 text-gray-400 cursor-pointer"
                                          onClick={() => setVisiblePassword(!visiblePassword)}
                                />
                            }
                        </div>
                    </div>
                    <div className='flex flex-row justify-center items-center gap-3'>
                        <button className='flex-1 h-13 border border-gray-300 text-[#6F6F6F] rounded-full cursor-pointer' onClick={() => setDeleteModalOpen(false)}>Cancel</button>
                        <button className='flex-1 h-13 border border-gray-300 text-white bg-gradient-to-b from-[#ED8296] to-[#DF1C41] rounded-full cursor-pointer' onClick={() => deleteAccount(password)}>Yes, Delete My Account</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteAccountModal