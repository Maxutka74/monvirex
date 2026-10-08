import type { Message } from "../../features/ai-assistant/api/aiApi.ts";
import profileStore from "../../entities/profile/profileStore.tsx";
import type { Profile } from "../../features/profile/api/profileApi.ts";
import logo from "../../assets/logos/AssistantLogo.webp";
import ReactMarkdown from "react-markdown";
import { useStore } from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";
import { IoAlertCircleOutline } from "react-icons/io5";
import { memo, useMemo } from "react";

type AiChatsCardProps = {
  messages?: Message[];
  loading: boolean;
  error: string | null;
};

const AiChatsCard = ({ messages, loading, error }: AiChatsCardProps) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const theme = useStore(themeStore, (state) => state.theme);
  const avatarUser: Profile | null = profileStore((state) => state.profile);

  const avatar = avatarUser?.avatar;

  const avatarSrc = avatar
    ? avatar.startsWith("http")
      ? avatar
      : `${API_URL}${avatar}`
    : undefined;

  const formattingMessages = useMemo(
    () =>
      messages?.map((message) => ({
        ...message,
        created_at:
          Intl.DateTimeFormat("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
            .format(new Date(message.created_at))
            .replaceAll("/", ".") +
          ", " +
          Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(message.created_at)),
      })),
    [messages],
  );

  return (
    <div className="max-h-[440px] h-full overflow-y-auto pr-1 sm:pr-2 2xl:pr-4">
      <ul className="flex flex-col gap-4 2xl:gap-5">
        {formattingMessages?.map((message) =>
          message.role === "user" ? (
            <li key={message.id} className="w-full">
              <div className="flex flex-row justify-end gap-2 sm:gap-3 2xl:gap-4">
                <div className="max-w-[calc(100%-48px)] sm:max-w-[80%] 2xl:max-w-none flex flex-col items-end rounded-xl min-w-0">
                  <div
                    className={`min-w-[80px] sm:min-w-[100px] 2xl:min-w-[120px] max-w-full w-fit 2xl:w-full rounded-xl p-2.5 sm:p-3 break-words overflow-wrap-anywhere ${
                      theme === "dark"
                        ? "bg-[#0D2A50] border border-[#1E5794] text-white"
                        : "bg-[#EAF3FF] text-black"
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  <p
                    className={`text-[11px] 2xl:text-[12px] text-end pr-2 ${
                      theme === "dark" ? "text-[#7890B5]" : "text-[#6F6F6F]"
                    }`}
                  >
                    {message.created_at}
                  </p>
                </div>

                <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full shrink-0 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src={avatarSrc}
                    alt="User Avatar"
                  />
                </div>
              </div>
            </li>
          ) : (
            <li
              key={message.id}
              className="max-w-full 2xl:max-w-[635px] w-full"
            >
              <div className="flex flex-row justify-start gap-2 sm:gap-3 2xl:gap-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full shrink-0">
                  <img
                    className="w-full h-full object-contain"
                    src={logo}
                    alt="Monvirex Logo"
                  />
                </div>

                <div className="max-w-[calc(100%-40px)] sm:max-w-[85%] 2xl:max-w-none flex flex-col items-end rounded-xl min-w-0">
                  <div
                    className={`min-w-[80px] sm:min-w-[100px] 2xl:min-w-[120px] max-w-full w-fit 2xl:w-full rounded-xl p-2.5 sm:p-3 break-words overflow-wrap-anywhere ${
                      theme === "dark"
                        ? "bg-[#06142B] border border-[#164A7D] text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>

                  <p
                    className={`text-[11px] 2xl:text-[12px] text-end pr-2 ${
                      theme === "dark" ? "text-[#7890B5]" : "text-[#6F6F6F]"
                    }`}
                  >
                    {message.created_at}
                  </p>
                </div>
              </div>
            </li>
          ),
        )}

        {loading && (
          <li className="max-w-full 2xl:max-w-[635px] w-full">
            <div className="flex flex-row justify-start gap-2 sm:gap-3 2xl:gap-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full shrink-0">
                <img
                  className="w-full h-full object-contain"
                  src={logo}
                  alt="Monvirex Logo"
                />
              </div>

              <div
                className={`rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                  theme === "dark"
                    ? "bg-[#06142B] border border-[#164A7D]"
                    : "bg-white"
                }`}
              >
                <p
                  className={`text-[14px] sm:text-[16px] ${
                    theme === "dark" ? "text-[#8BA4CA]" : "text-[#6F6F6F]"
                  }`}
                >
                  Monvirex AI thinking...
                </p>
              </div>
            </div>
          </li>
        )}

        {error && (
          <li className="max-w-full 2xl:max-w-[635px] w-full">
            <div className="flex flex-row justify-start gap-2 sm:gap-3 2xl:gap-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-full shrink-0">
                <img
                  className="w-full h-full object-contain"
                  src={logo}
                  alt="Monvirex Logo"
                />
              </div>

              <div
                className={`
                    min-w-0 max-w-[calc(100%-40px)] sm:max-w-[85%] 2xl:max-w-none
                    rounded-xl px-3 sm:px-4 py-2.5 sm:py-3
                    border
                    ${
                      theme === "dark"
                        ? "bg-[#2A1020]/60 border-[#E43D68]/60"
                        : "bg-[#FFF5F7] border-[#FFB8C7]"
                    }
                `}
              >
                <div className="flex items-start gap-2">
                  <IoAlertCircleOutline
                    className={`
                        shrink-0
                        text-[19px] 2xl:text-[21px]
                        mt-[1px]
                        ${
                          theme === "dark" ? "text-[#FF4D73]" : "text-[#E6395B]"
                        }
                    `}
                  />

                  <div className="min-w-0">
                    <p
                      className={`
                        text-[14px] 2xl:text-[15px] font-medium
                        break-words
                        ${
                          theme === "dark" ? "text-[#FF8BA4]" : "text-[#D92D4F]"
                        }
                    `}
                    >
                      {error}
                    </p>

                    <p
                      className={`
                        text-[13px] 2xl:text-[14px] mt-1
                        break-words
                        ${
                          theme === "dark" ? "text-[#AEBBD0]" : "text-[#6F6F6F]"
                        }
                    `}
                    >
                      I couldn't generate a response. Please try again later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
};

export default memo(AiChatsCard);
