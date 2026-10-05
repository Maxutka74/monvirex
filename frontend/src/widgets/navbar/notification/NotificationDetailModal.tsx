import * as React from "react";
import { IoMdClose, IoMdNotificationsOutline } from "react-icons/io";
import { RiMessage2Line } from "react-icons/ri";
import { LuCalendar } from "react-icons/lu";
import { FiTag } from "react-icons/fi";

import type { Notification } from "../../../features/notifications/api/notificationsApi.ts";
import { useStore } from "zustand/react";
import themeStore from "../../../entities/theme/themeStore.tsx";

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
  const theme = useStore(themeStore, (state) => state.theme);

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
    <div
      className={`fixed inset-0 z-10 flex items-center justify-center backdrop-blur-sm p-4 ${
        theme === "dark" ? "bg-black/70" : "bg-black/20"
      }`}
    >
      <div
        className={`
          w-[95%] max-w-[600px]
          rounded-[24px]
          p-6 xl:p-8
          ${
            theme === "dark"
              ? "bg-[#020817] border border-[#123A70] text-white shadow-[0_0_35px_rgba(21,151,255,0.15)]"
              : "bg-white"
          }
      `}
      >
        <div className="flex flex-col gap-5 xl:gap-6">
          <div className="flex flex-row justify-between">
            <div className="flex items-center gap-3 xl:gap-5">
              <div
                className={`
                    flex h-[52px] w-[52px] items-center justify-center
                    rounded-full
                    xl:h-[60px] xl:w-[60px]
                    ${
                      theme === "dark"
                        ? "bg-[#0B2A52] border border-[#164B86] text-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.25)]"
                        : "bg-[#E8F4FF] text-blue-600"
                    }
                `}
              >
                <IoMdNotificationsOutline size={32} />
              </div>

              <div
                className={`
                    flex h-[34px] items-center justify-center
                    rounded-[6px]
                    ${
                      theme === "dark"
                        ? "bg-[#0B2A52] border border-[#164B86]"
                        : "bg-[#E8F4FF]"
                    }
                `}
              >
                <p
                  className={`
                      px-3 text-[15px] font-medium xl:text-[16px]
                      ${theme === "dark" ? "text-[#1597FF]" : "text-blue-600"}
                  `}
                >
                  {word}
                </p>
              </div>
            </div>

            <button
              className={`
                  flex h-[44px] w-[44px]
                  cursor-pointer items-center justify-center
                  rounded-full
                  ${
                    theme === "dark"
                      ? "text-[#7184A3] border border-[#164B86] hover:bg-[#0B1D38] hover:text-white"
                      : "hover:bg-gray-100"
                  }
              `}
              onClick={onClose}
            >
              <IoMdClose size={20} />
            </button>
          </div>

          <div>
            <p className="break-words text-[20px] font-medium xl:text-[22px]">
              {notification.title}
            </p>

            <p
              className={`text-[14px] font-medium ${
                theme === "dark" ? "text-[#7184A3]" : "text-[#666D80]"
              }`}
            >
              {formatDate} • {date.toTimeString().slice(0, 5)}
            </p>
          </div>

          <span
            className={`border-b ${
              theme === "dark" ? "border-[#164B86]" : "border-[#E8F4FF]"
            }`}
          ></span>

          <div className="grid grid-cols-[48px_1fr] gap-5 xl:gap-6">
            <div
              className={`
                  flex h-[48px] w-[48px]
                  items-center justify-center
                  rounded-[8px]
                  ${
                    theme === "dark"
                      ? "bg-[#0B1D38] border border-[#164B86] text-[#8BB8F5]"
                      : "bg-blue-100"
                  }
              `}
            >
              <RiMessage2Line size={22} />
            </div>

            <div>
              <p
                className={`text-[16px] font-medium ${
                  theme === "dark" ? "text-[#8BB8F5]" : "text-[#666D80]"
                }`}
              >
                Message
              </p>

              <p className="break-words text-[15px] xl:text-[16px]">
                {notification.message}
              </p>
            </div>
          </div>

          <span
            className={`border-b ${
              theme === "dark" ? "border-[#164B86]" : "border-[#E8F4FF]"
            }`}
          ></span>

          <div className="flex flex-row gap-5 xl:gap-6">
            <div
              className={`
                  flex h-[48px] w-[48px]
                  shrink-0 items-center justify-center
                  rounded-[8px]
                  ${
                    theme === "dark"
                      ? "bg-[#0B1D38] border border-[#164B86] text-[#8BB8F5]"
                      : "bg-blue-100"
                  }
              `}
            >
              <FiTag size={22} />
            </div>

            <div>
              <p
                className={`text-[16px] font-medium ${
                  theme === "dark" ? "text-[#8BB8F5]" : "text-[#666D80]"
                }`}
              >
                Type
              </p>
              <p className="text-[15px] xl:text-[16px]">{word}</p>{" "}
            </div>
          </div>

          <span
            className={`border-b ${
              theme === "dark" ? "border-[#164B86]" : "border-[#E8F4FF]"
            }`}
          ></span>

          <div className="flex flex-row gap-6">
            <div
              className={`
                  flex h-[48px] w-[48px]
                  shrink-0 items-center justify-center
                  rounded-[8px]
                  ${
                    theme === "dark"
                      ? "bg-[#0B1D38] border border-[#164B86] text-[#8BB8F5]"
                      : "bg-blue-100"
                  }
              `}
            >
              <LuCalendar size={22} />
            </div>

            <div>
              <p
                className={`text-[16px] font-medium ${
                  theme === "dark" ? "text-[#8BB8F5]" : "text-[#666D80]"
                }`}
              >
                {" "}
                Date
              </p>

              <p className="break-words text-[15px] xl:text-[16px]">
                {`${formatDate} • ${date.toTimeString().slice(0, 5)}`}
              </p>
            </div>
          </div>

          <span
            className={`border-b ${
              theme === "dark" ? "border-[#164B86]" : "border-[#E8F4FF]"
            }`}
          ></span>

          <div className="flex flex-row gap-6">
            <div
              className={`
                  flex h-[48px] w-[48px]
                  shrink-0 items-center justify-center
                  rounded-[8px]
                  ${
                    theme === "dark"
                      ? "bg-[#0B1D38] border border-[#164B86]"
                      : "bg-blue-100"
                  }
              `}
            >
              <span className="h-[18px] w-[18px] rounded-full bg-[#40C4AA] shadow-[0_0_10px_rgba(64,196,170,0.35)]"></span>
            </div>

            <div>
              <p
                className={`text-[16px] font-medium ${
                  theme === "dark" ? "text-[#8BB8F5]" : "text-[#666D80]"
                }`}
              >
                Status
              </p>

              <div
                className={`
                    flex h-[28px] w-[52px]
                    items-center justify-center
                    rounded-[6px]
                    ${
                      theme === "dark"
                        ? "bg-[#0B2E28] border border-[#176B59]"
                        : "bg-green-100"
                    }
                `}
              >
                <p
                  className={`text-[13px] font-medium ${
                    theme === "dark" ? "text-[#40C4AA]" : "text-green-700"
                  }`}
                >
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
