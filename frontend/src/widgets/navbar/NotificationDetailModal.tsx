import * as React from "react";
import {IoMdClose, IoMdNotificationsOutline} from "react-icons/io";
import type {Notification} from "../../features/notifications/api/notificationsApi.ts";
import { RiMessage2Line } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { FiTag } from "react-icons/fi";


type NotificationDetailModalProps = {
    notification: Notification;
    isDetailModalOpen: boolean
    setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const NotificationDetailModal = ({notification, isDetailModalOpen, setIsDetailModalOpen}: NotificationDetailModalProps) => {
    const word = notification.notification_type.charAt(0).toUpperCase() + notification.notification_type.slice(1);

    const date = new Date(notification.created_at)
    const formatDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    }).format(date)

    const onClose = () => {
        setIsDetailModalOpen(!isDetailModalOpen);
    }

    return (
        <div className='fixed inset-0 z-10 flex justify-center items-center bg-black/20 backdrop-blur-sm'>
            <div className='w-[400px] bg-white rounded-[20px] p-5 '>
                <div className='flex flex-col gap-3'>
                    <div className='flex flex-row justify-between'>
                        <div className='flex items-center gap-5'>
                            <div className='w-[45px] h-[45px] flex justify-center items-center text-blue-600 bg-[#E8F4FF] rounded-full'>
                                <IoMdNotificationsOutline size={28} />
                            </div>
                            <div className='h-[26px] flex justify-center items-center bg-[#E8F4FF] rounded-[3px]'>
                                <p className='text-blue-600 font-medium text-[16px] p-2'>{word}</p>
                            </div>
                        </div>
                        <button className={'w-[44px] h-[44px] flex justify-center items-center rounded-full cursor-pointer'} onClick={onClose}>
                            <IoMdClose size={18} />
                        </button>
                    </div>
                    <div>
                        <p className='font-medium text-[18px]'>{notification.title}</p>
                        <p className='text-[#666D80] text-[12px] font-medium'>
                            {formatDate} • {date.toTimeString().slice(0,5)}
                        </p>
                    </div>
                    <span className='border-b border-[#E8F4FF]'></span>
                    <div className='grid grid-cols-[30px_1fr] gap-6'>
                        <div className='w-[30px] h-[30px] flex items-center justify-center rounded-[3px] bg-blue-100'>
                            <RiMessage2Line />
                        </div>
                        <div>
                            <p className='text-[14px] font-medium text-[#666D80]'>Message</p>
                            <p className='text-[13px]'>{notification.message}</p>
                        </div>
                    </div>
                    <span className='border-b border-[#E8F4FF]'></span>
                    <div className='flex flex-row gap-6'>
                        <div className='w-[30px] h-[30px] flex items-center justify-center rounded-[3px] bg-blue-100'>
                            <FiTag />
                        </div>
                        <div>
                            <p className='text-[14px] font-medium text-[#666D80]'>Type</p>
                            <p className='text-[13px]'>{word}</p>
                        </div>
                    </div>
                    <span className='border-b border-[#E8F4FF]'></span>
                    <div className='flex flex-row gap-6'>
                        <div className='w-[30px] h-[30px] flex items-center justify-center rounded-[3px] bg-blue-100'>
                            <LuCalendar />
                        </div>
                        <div>
                            <p className='text-[14px] font-medium text-[#666D80]'>Date</p>
                            <p className='text-[13px]'>{`${formatDate} • ${date.toTimeString().slice(0,5)}`}</p>
                        </div>
                    </div>
                    <span className='border-b border-[#E8F4FF]'></span>
                    <div className='flex flex-row gap-6'>
                        <div className='w-[30px] h-[30px] flex items-center justify-center rounded-[3px] bg-blue-100'>
                            <span className='w-[14px] h-[14px] bg-green-600 rounded-full'></span>
                        </div>
                        <div>
                            <p className='text-[14px] font-medium text-[#666D80]'>Status</p>
                            <div className='w-[36px] h-[18px] flex justify-center items-center bg-green-100 rounded-[3px]'>
                                <p className={'text-green-700 text-[12px]'}>Read</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationDetailModal