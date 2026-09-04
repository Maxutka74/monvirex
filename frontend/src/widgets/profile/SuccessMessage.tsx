import {CgClose} from "react-icons/cg";
import { MdCheck } from "react-icons/md";
import {useEffect, useState} from "react";

type Toast = {
    show: boolean;
    type: 'avatar' | 'name' | 'password'
    title: string;
    message: string;
    closeToast: () => void
}

type SuccessMessageProps = {
    notificationInfo: Toast
}

const SuccessMessage = ({notificationInfo}: SuccessMessageProps) => {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setOpacity(opacity => opacity - 0.2)
        }, 1000)

        return () => clearInterval(interval)
    }, []);

    useEffect(() => {
        if (opacity <= 0) {
            notificationInfo.closeToast();
        }
    }, [opacity]);

    return (
        <div className='max-w-[320px] sm:max-w-none absolute top-1 sm:top-4 right-5 bg-white rounded-[20px] p-4 shadow-sm transition-opacity duration-1500' style={{opacity}}>
            <div className='flex flex-row justify-center items-center gap-4 sm:gap-5'>
                <div className={`w-[32px] h-[32px] flex items-center justify-center text-white rounded-full shrink-0 ${notificationInfo.type === 'avatar' ? 'bg-green-500'
                    : notificationInfo.type === 'name' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                    <MdCheck size={22} />
                </div>
                <div className='flex flex-col justify-center '>
                    <h3 className='font-medium'>{notificationInfo.title}</h3>
                    <p className='text-sm text-gray-500'>{notificationInfo.message}</p>
                </div>
                <div>
                    <div className='w-full flex items-center justify-end'>
                        <button className='h-[20px] w-[20px] flex items-center justify-center rounded-full sm:h-[28px] sm:w-[28px] text-gray-500 cursor-pointer' onClick={() => notificationInfo.closeToast()}><CgClose size={24}/></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SuccessMessage