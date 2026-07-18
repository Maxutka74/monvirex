import { BiCheckDouble } from "react-icons/bi"
import {useEffect, useState} from "react";
import notificationsApi, {type Notification} from "../../features/notifications/api/notificationsApi.ts";
import {MdAddCard, MdOutlineNotificationsActive} from "react-icons/md";
import {LiaMoneyBillWaveSolid} from "react-icons/lia";
import {LuBadgeDollarSign, LuShoppingCart} from "react-icons/lu";
import {RiExchangeDollarLine} from "react-icons/ri";
import * as React from "react";
import NotificationDetailModal from "./NotificationDetailModal.tsx";
import api from "../../shared/api/instance.ts";

type NotificationProps = {
    unreadNotifications: number,
    setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>,
}

const NotificationDropdown = ({
                                  unreadNotifications,
                                  setUnreadNotifications,
                              }: NotificationProps) => {
    const [isActiveButton, setIsActiveButton] =
        useState<"all" | "unread">("all");

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] =
        useState<Notification | null>(null);
    const [nextPage, setNextPage] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        const notificationsData = async () => {
            try {
                const data = await notificationsApi.getNotifications();

                setNotifications(data.notifications);
                setNextPage(data.next);
            } catch (error) {
                console.error(error);
            }
        };

        notificationsData();
    }, []);

    const notificationRead = async (notification: Notification) => {
        try {
            setSelectedNotification({
                ...notification,
                is_read: true,
            });

            if (notification.is_read) {
                return;
            }

            await notificationsApi.markNotificationAsRead(notification.id);

            setNotifications((notifications) =>
                notifications.map((item) =>
                    item.id === notification.id
                        ? {
                            ...item,
                            is_read: true,
                        }
                        : item
                )
            );

            setUnreadNotifications(
                (unreadNotifications) => unreadNotifications - 1
            );
        } catch (error) {
            console.error(error);
        }
    };

    const notificationsReadAll = async () => {
        try {
            await notificationsApi.markAllNotificationsAsRead();

            setNotifications((notifications) =>
                notifications.map((item) =>
                    item.id
                        ? {
                            ...item,
                            is_read: true,
                        }
                        : item
                )
            );

            setUnreadNotifications(0);
        } catch (error) {
            console.error(error);
        }
    };

    const filterNotifications = notifications.filter((notification) => {
        if (isActiveButton === "all") {
            return true;
        }

        if (isActiveButton === "unread") {
            return !notification.is_read;
        }

        return true;
    });

    const groupedNotifications = () => {
        const groupedFormatedNotifications: Record<
            string,
            Notification[]
        > = {};

        filterNotifications.forEach((notification) => {
            const date = new Date(notification.created_at);

            const formattedDate = new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            }).format(date);

            if (!groupedFormatedNotifications[formattedDate]) {
                groupedFormatedNotifications[formattedDate] = [];
            }

            groupedFormatedNotifications[formattedDate].push(notification);
        });

        return groupedFormatedNotifications;
    };

    const scrollNotifications = async () => {
        if (!nextPage) return;
        if (isLoadingMore) return;

        setIsLoadingMore(true);

        try {
            const url = new URL(nextPage);
            const endpoint =
                url.pathname.replace("/api", "") + url.search;

            const data = await api.get(endpoint);

            setNotifications((notifications) => [
                ...notifications,
                ...data.data.notifications,
            ]);

            setNextPage(data.data.next);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <div
            className="
                flex flex-col gap-5
                w-[95vw] max-w-[500px] h-[80vh] xl:h-[600px]
                rounded-[20px] bg-white
                p-4
            "
        >
            <h4 className="text-[22px] xl:text-[24px] font-medium">
                Notification
            </h4>

            <div
                className="
                    flex flex-col gap-3
                    border-b border-[#E5E7EB]
                    pb-3 text-[#6F6F6F]
                    md:flex-row md:items-center md:justify-between
                "
            >
                <div className="flex items-center gap-4">
                    <button
                        className={`cursor-pointer ${
                            isActiveButton === "all" &&
                            "text-[#429EFF] border-b border-[#000000]/20"
                        }`}
                        onClick={() => setIsActiveButton("all")}
                    >
                        All
                    </button>

                    <button
                        className={`cursor-pointer ${
                            isActiveButton === "unread" &&
                            "text-[#429EFF] border-b border-[#000000]/20"
                        }`}
                        onClick={() => setIsActiveButton("unread")}
                    >
                        Unread ({unreadNotifications})
                    </button>
                </div>

                <button
                    className="flex items-center gap-2 self-start cursor-pointer md:self-auto"
                    onClick={notificationsReadAll}
                >
                    <BiCheckDouble
                        size={22}
                        className="text-[#429EFF]"
                    />

                    <p className="text-[#429EFF]">
                        Mark all as read
                    </p>
                </button>
            </div>

            <div
                className="flex-1 overflow-y-auto pr-2"
                onScroll={(e) => {
                    const target = e.currentTarget;

                    const isBottom =
                        target.scrollTop + target.clientHeight >=
                        target.scrollHeight - 20;

                    if (isBottom) {
                        scrollNotifications();
                    }
                }}
            >
                <div className="flex flex-col gap-4">
                    {notifications.length === 0 ? (
                        <p>You don’t have any notifications yet.</p>
                    ) : (
                        Object.entries(groupedNotifications()).map(
                            ([date, notifications]) => (
                                <div
                                    key={date}
                                    className="flex flex-col gap-4"
                                >
                                    <p className="font-medium text-black">
                                        {date}
                                    </p>

                                    <ul>
                                        {notifications.map((notification) => (
                                            <li key={notification.id}>
                                                <div
                                                    className={`flex items-start gap-3 rounded-[10px] p-3 ${
                                                        !notification.is_read &&
                                                        "bg-[#429EFF]/20"
                                                    }`}
                                                >
                                                    <div className="flex justify-center items-center w-[42px] h-[42px] xl:w-[48px] xl:h-[48px] rounded-full bg-[#E8F4FF]">
                                                        {notification.notification_type === "deposit" ? (
                                                            <MdAddCard />
                                                        ) : notification.notification_type ===
                                                        "withdraw" ? (
                                                            <LiaMoneyBillWaveSolid />
                                                        ) : notification.notification_type ===
                                                        "buy" ? (
                                                            <LuShoppingCart />
                                                        ) : notification.notification_type ===
                                                        "sell" ? (
                                                            <LuBadgeDollarSign />
                                                        ) : notification.notification_type ===
                                                        "exchange" ? (
                                                            <RiExchangeDollarLine />
                                                        ) : (
                                                            <MdOutlineNotificationsActive />
                                                        )}
                                                    </div>

                                                    <div
                                                        className="relative flex-1 min-w-0 cursor-pointer"
                                                        onClick={() => {
                                                            notificationRead(
                                                                notification
                                                            );
                                                            setIsDetailModalOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-[16px] xl:text-[18px] font-medium break-words">
                                                                {
                                                                    notification.title
                                                                }
                                                            </p>

                                                            <span
                                                                className={`w-[8px] h-[8px] xl:w-[10px] xl:h-[10px] rounded-full ${
                                                                    !notification.is_read &&
                                                                    "bg-[#DF1C41]"
                                                                }`}
                                                            />
                                                        </div>

                                                        <p className="w-full truncate text-[14px] text-[#6F6F6F]">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        )
                    )}
                </div>
            </div>

            {isDetailModalOpen && selectedNotification && (
                <NotificationDetailModal
                    notification={selectedNotification}
                    isDetailModalOpen={isDetailModalOpen}
                    setIsDetailModalOpen={setIsDetailModalOpen}
                />
            )}
        </div>
    );
}

export default NotificationDropdown