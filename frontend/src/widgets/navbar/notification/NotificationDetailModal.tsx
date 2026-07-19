import * as React from "react";
import { IoMdClose, IoMdNotificationsOutline } from "react-icons/io";
import { RiMessage2Line } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { FiTag } from "react-icons/fi";

import type { Notification } from "../../../features/notifications/api/notificationsApi.ts";

type NotificationDetailModalProps = {
    notification: Notification;
    isDetailModalOpen: boolean;
    setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const NotificationDetailModal = ({
                                     notification,
                                     isDetailModalOpen,
                                     setIsDetailModalOpen,
                                 }: NotificationDetailModalProps) => {
    const word =
        notification.notification_type.charAt(0).toUpperCase() +
        notification.notification_type.slice(1);

    const date = new Date(notification.created_at);

    const formatDate = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date);

    const onClose = () => {
        setIsDetailModalOpen(!isDetailModalOpen);
    };

    return (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="w-[95%] max-w-[400px] rounded-[20px] bg-white p-4 xl:p-5">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-row justify-between">
                        <div className="flex items-center gap-3 xl:gap-5">
                            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#E8F4FF] text-blue-600 xl:h-[45px] xl:w-[45px]">
                                <IoMdNotificationsOutline size={28} />
                            </div>

                            <div className="flex h-[26px] items-center justify-center rounded-[3px] bg-[#E8F4FF]">
                                <p className="p-2 text-[14px] font-medium text-blue-600 xl:text-[16px]">
                                    {word}
                                </p>
                            </div>
                        </div>

                        <button
                            className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-full"
                            onClick={onClose}
                        >
                            <IoMdClose size={18} />
                        </button>
                    </div>

                    <div>
                        <p className="break-words text-[16px] font-medium xl:text-[18px]">
                            {notification.title}
                        </p>

                        <p className="text-[12px] font-medium text-[#666D80]">
                            {formatDate} • {date.toTimeString().slice(0, 5)}
                        </p>
                    </div>

                    <span className="border-b border-[#E8F4FF]"></span>

                    <div className="grid grid-cols-[30px_1fr] gap-4 xl:gap-6">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] bg-blue-100">
                            <RiMessage2Line />
                        </div>

                        <div>
                            <p className="text-[14px] font-medium text-[#666D80]">
                                Message
                            </p>

                            <p className="break-words text-[13px]">
                                {notification.message}
                            </p>
                        </div>
                    </div>

                    <span className="border-b border-[#E8F4FF]"></span>

                    <div className="flex flex-row gap-6">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] bg-blue-100">
                            <FiTag />
                        </div>

                        <div>
                            <p className="text-[14px] font-medium text-[#666D80]">
                                Type
                            </p>

                            <p className="text-[13px]">{word}</p>
                        </div>
                    </div>

                    <span className="border-b border-[#E8F4FF]"></span>

                    <div className="flex flex-row gap-6">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] bg-blue-100">
                            <LuCalendar />
                        </div>

                        <div>
                            <p className="text-[14px] font-medium text-[#666D80]">
                                Date
                            </p>

                            <p className="break-words text-[13px]">
                                {`${formatDate} • ${date
                                    .toTimeString()
                                    .slice(0, 5)}`}
                            </p>
                        </div>
                    </div>

                    <span className="border-b border-[#E8F4FF]"></span>

                    <div className="flex flex-row gap-6">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] bg-blue-100">
                            <span className="h-[14px] w-[14px] rounded-full bg-green-600"></span>
                        </div>

                        <div>
                            <p className="text-[14px] font-medium text-[#666D80]">
                                Status
                            </p>

                            <div className="flex h-[18px] w-[36px] items-center justify-center rounded-[3px] bg-green-100">
                                <p className="text-[12px] text-green-700">
                                    Read
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationDetailModal;