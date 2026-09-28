import { BsClockHistory } from "react-icons/bs"
import {useEffect, useState} from "react";
import aiApi, {type Message, type UserChats} from "../../features/ai-assistant/api/aiApi.ts";
import {LuArrowUpRight, LuChartNoAxesCombined, LuFileText, LuMessageSquareText} from "react-icons/lu";
import {FaRegTrashAlt} from "react-icons/fa";
import logoMonvirex from "../../assets/logos/MonvirexLogo.png"
import {FiSend} from "react-icons/fi";
import AiChatsCard from "./AiChatsCard.tsx";
import {useStore} from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";
import {IoAlertCircleOutline} from "react-icons/io5";
import {useLocation} from "react-router-dom";


const AIAssistantWidget = () => {
    const location = useLocation();
    const initialMessage = location.state?.initialMessage
    const marketAnalysis = location.state?.marketAnalysis
    const portfolioAnalysis = location.state?.portfolioAnalysis

    const theme = useStore(themeStore, (state) => state.theme);

    const [chats, setChats] = useState<UserChats[]>([]);
    const [activeChatsID, setActiveChatsID] = useState<number | null>(null);
    const [userMessages, setUsersMessages] = useState<Message[] | null>(null);
    const [inputText, setInputText] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorChat, setErrorChat] = useState<string | null>(null);


    useEffect(() => {
        const data = async () => {
            try {
                setErrorChat(null);

                const chatsData = await aiApi.getChats();

                setChats(chatsData);
            } catch (e) {
                setErrorChat('Failed to load chat history');
            }
        }

        data()
    }, [])

    useEffect(() => {
        if (marketAnalysis) handleMarketAnalysis()

        if (portfolioAnalysis) handlePortfolioAnalysis()

        if (!initialMessage) return;

        handleSendMessage(null, initialMessage)
    }, [])

    const formattingChats = () => {
        return chats.map(chat => ({
            ...chat,
            updated_at: Intl.DateTimeFormat(
                'uk-UA',
                {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }
            ).format(new Date(chat.updated_at))
        }))
    }

    const createNewChat = async () => {
        setErrorMessage(null)

        try {
            const newChat = await aiApi.createChat()
            setChats(chats => [
                newChat,
                ...(chats ?? [])
            ])
            setActiveChatsID(newChat.id)
            setUsersMessages([])

            return newChat.id
        } catch (e) {
            console.error('Failed to create chat:', e)
            throw e;
        }
    }

    const handleDeleteChat = async (chatId: number) => {
        try {
            await aiApi.deleteChat(chatId)
            setChats((chats) => chats.filter(item => chatId !== item.id))
            setUsersMessages(null)
            setActiveChatsID(null)
        } catch (e) {
            console.error('Failed to delete chat:', e)
        }
    }

    const handleMarketAnalysis = async () => {
        setErrorMessage(null)
        setIsLoading(true);

        const tempMessage: Message = {
            id: -Date.now(),
            role: 'user',
            content: 'Analyze Market',
            created_at: new Date().toISOString(),
            chat: -Date.now(),
        }

        setUsersMessages(userMessages => [
            ...(userMessages ?? []),
            tempMessage
        ])

        try {
            const marketAnalysisData = await aiApi.getMarketAnalysis();

            const responseMessage: Message = {
                id: -Date.now(),
                role: 'assistant',
                content: marketAnalysisData,
                created_at: new Date().toISOString(),
                chat: -Date.now(),
            }

            setUsersMessages(userMessages => [
                ...(userMessages ?? []),
                responseMessage
            ])

        } catch (e) {
            setErrorMessage('Something went wrong')
        } finally {
            setIsLoading(false);
        }
    }

    const handlePortfolioAnalysis = async () => {
        setErrorMessage(null)
        setIsLoading(true);

        const tempMessage: Message = {
            id: -Date.now(),
            role: 'user',
            content: 'Analyze my portfolio',
            created_at: new Date().toISOString(),
            chat: -Date.now(),
        }

        setUsersMessages(userMessages => [
            ...(userMessages ?? []),
            tempMessage
        ])

        try {
            const portfolioAnalysisData = await aiApi.getPortfolioAnalysis();

            const responseMessage: Message = {
                id: -Date.now(),
                role: 'assistant',
                content: portfolioAnalysisData,
                created_at: new Date().toISOString(),
                chat: -Date.now(),
            }

            setUsersMessages(userMessages => [
                ...(userMessages ?? []),
                responseMessage
            ])
        } catch (e) {
            setErrorMessage('Something went wrong')
        } finally {
            setIsLoading(false);
        }
    }

    const handleSendMessage = async (chat_id: number | null, message?: string) => {
        const content = (message ?? inputText).trim()

        if(!content) return

        setErrorMessage(null)
        setErrorChat(null);
        setIsLoading(true);

        try {
            if (chat_id === null) {
                try {
                    chat_id = await createNewChat()

                    setActiveChatsID(chat_id)
                } catch (e) {
                    setErrorMessage('Something went wrong')
                    return;
                }
            }

            if (chat_id) {

                const tempMessage: Message = {
                    id: -Date.now(),
                    role: 'user',
                    content: content,
                    created_at: new Date().toISOString(),
                    chat: chat_id,
                }

                setUsersMessages(userMessages => [
                    ...(userMessages ?? []),
                    tempMessage
                ])

                setInputText('')

                const messageData = await aiApi.sendMessage(content, chat_id)

                const chatsData = await aiApi.getChats()

                const responseMessage: Message = {
                    id: -Date.now(),
                    role: 'assistant',
                    content: messageData.response,
                    created_at: new Date().toISOString(),
                    chat: chat_id,
                }

                setUsersMessages(userMessages => [
                    ...(userMessages ?? []),
                    responseMessage
                ])

                setChats(chatsData)
            }
        } catch (e) {
            setErrorMessage('Something went wrong')
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='w-full 2xl:min-w-[1700px] flex flex-col 2xl:flex-row gap-4 2xl:gap-6'>
            <div className={`w-full min-h-[650px] sm:min-h-[700px] lg:min-h-[740px] 2xl:min-h-0 2xl:flex-1 2xl:h-191 flex flex-col rounded-[20px] p-3 sm:p-4 2xl:p-5 ${
                theme === 'dark'
                    ? 'bg-[#020B1E]/90 border border-[#164A7D] text-white'
                    : 'bg-[#FFFFFF]/60'
            }`}>
                <div className='flex-1 min-h-0'>
                    {!userMessages ? (
                        <div className='flex flex-col items-center gap-5 sm:gap-6 2xl:gap-8'>
                            <div className='flex flex-row items-center'>
                                <img
                                    src={logoMonvirex}
                                    alt="Monvirex Logo"
                                    className='w-12 h-12 sm:w-14 sm:h-14 2xl:w-18 2xl:h-18'
                                />

                                <h3 className='text-[28px] sm:text-[32px] 2xl:text-[36px] font-medium bg-gradient-to-r from-[#9F87FF] to-[#429EFF] bg-clip-text text-transparent'>
                                    Monvirex
                                </h3>
                            </div>

                            <div className='w-full flex flex-col items-center gap-5 sm:gap-7 2xl:gap-9'>
                                <div className='flex flex-col items-center text-center text-[28px] sm:text-[36px] lg:text-[42px] 2xl:text-[48px] font-medium'>
                                    <h4>Hello Maxx,</h4>

                                    <p className='bg-gradient-to-r from-[#9F87FF] to-[#429EFF] bg-clip-text text-transparent'>
                                        How can I help you today?
                                    </p>
                                </div>

                                <div className='max-w-[990px] w-full flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-4 mb-4'>
                                    <button
                                        className={`w-full lg:flex-1 flex flex-row justify-between text-start gap-3 sm:gap-4 border rounded-[20px] p-3 sm:p-4 cursor-pointer transition-colors ${
                                            theme === 'dark'
                                                ? 'bg-[#06142B] border-[#164A7D] hover:bg-[#0B203D]'
                                                : 'bg-white border-gray-100'
                                        }`}
                                        onClick={() => handleMarketAnalysis()}
                                    >
                                        <div className='flex flex-row gap-3 sm:gap-5'>
                                            <div className='w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] 2xl:w-[54px] 2xl:h-[54px] flex items-center justify-center text-white bg-[#429EFF] rounded-full shrink-0'>
                                                <LuChartNoAxesCombined size={24} />
                                            </div>

                                            <div>
                                                <h5 className='text-[19px] sm:text-[21px] 2xl:text-[24px] font-medium'>
                                                    AI Market Analysis
                                                </h5>

                                                <p className={`max-w-[300px] text-[14px] sm:text-[15px] 2xl:text-[16px] ${
                                                    theme === 'dark'
                                                        ? 'text-[#8EA6C9]'
                                                        : 'text-[#6F6F6F]'
                                                }`}>
                                                    Analyze current market data, price movements,
                                                    and trading volume with AI-powered insights
                                                </p>
                                            </div>
                                        </div>

                                        <LuArrowUpRight
                                            size={28}
                                            className='shrink-0'
                                        />
                                    </button>

                                    <button
                                        className={`w-full lg:flex-1 flex flex-row justify-between text-start gap-3 sm:gap-4 border rounded-[20px] p-3 sm:p-4 cursor-pointer transition-colors ${
                                            theme === 'dark'
                                                ? 'bg-[#06142B] border-[#164A7D] hover:bg-[#0B203D]'
                                                : 'bg-white border-gray-100'
                                        }`}
                                        onClick={() => handlePortfolioAnalysis()}
                                    >
                                        <div className='flex flex-row gap-3 sm:gap-5'>
                                            <div className='w-[46px] h-[46px] sm:w-[50px] sm:h-[50px] 2xl:w-[54px] 2xl:h-[54px] flex items-center justify-center text-white bg-[#9F87FF] rounded-full shrink-0'>
                                                <LuFileText size={24} />
                                            </div>

                                            <div>
                                                <h5 className='text-[19px] sm:text-[21px] 2xl:text-[24px] font-medium'>
                                                    AI Portfolio Analysis
                                                </h5>

                                                <p className={`max-w-[300px] text-[14px] sm:text-[15px] 2xl:text-[16px] ${
                                                    theme === 'dark'
                                                        ? 'text-[#8EA6C9]'
                                                        : 'text-[#6F6F6F]'
                                                }`}>
                                                    Analyze your portfolio, asset allocation,
                                                    and performance with AI-powered insights
                                                </p>
                                            </div>
                                        </div>

                                        <LuArrowUpRight
                                            size={28}
                                            className='shrink-0'
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <AiChatsCard
                            messages={userMessages}
                            loading={isLoading}
                            error={errorMessage}
                        />
                    )}
                </div>

                <div className={`w-full h-[190px] sm:h-[220px] 2xl:h-[250px] shrink-0 p-[10px] rounded-[24px] mt-4 sm:mt-5 2xl:mt-6 border ${
                    theme === 'dark'
                        ? 'bg-[#06142B] border-[#164A7D]'
                        : 'bg-white border-transparent'
                }`}>
                <textarea
                    value={inputText}
                    className={`w-full h-[120px] sm:h-[150px] 2xl:h-[180px] align-top resize-none outline-none bg-transparent ${
                        theme === 'dark'
                            ? 'text-white placeholder:text-[#7186A7]'
                            : 'text-black placeholder:text-[#6F6F6F]'
                    }`}
                    placeholder='Ask Monvirex AI anything...'
                    maxLength={1000}
                    onChange={(e) => {
                        setInputText(e.currentTarget.value)
                    }}
                />

                    <div className={`h-12 flex flex-row items-center justify-between border-t ${
                        theme === 'dark'
                            ? 'border-[#164A7D]'
                            : 'border-gray-100'
                    }`}>
                        <p className={
                               theme === 'dark'
                                   ? 'text-[#7890B5]'
                                   : 'text-[#6F6F6F]'
                           }>
                            {inputText.length} / 1000
                        </p>

                        <button
                            className='w-10 h-10 flex items-center justify-center text-white bg-gradient-to-br from-[#20B8F5] via-[#429EFF] to-[#8B5CF6] rounded-[10px] cursor-pointer'
                            onClick={() => {
                                handleSendMessage(
                                    activeChatsID ? activeChatsID : null
                                )
                            }}
                        >
                            <FiSend size={22} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`w-full 2xl:w-[400px] 2xl:shrink-0 rounded-[20px] p-3 sm:p-4 2xl:p-5 border ${
                theme === 'dark'
                    ? 'bg-[#020B1E]/90 border border-[#164A7D] text-white'
                    : 'bg-[#FFFFFF]/60 border-transparent'
            }`}>
                <div className='flex flex-col gap-3'>
                    <div className='flex flex-row items-center gap-3'>
                        <div className='w-10 h-10 2xl:w-11 2xl:h-11 flex items-center justify-center text-white bg-[#429EFF] rounded-full shrink-0'>
                            <BsClockHistory size={24} />
                        </div>

                        <h3 className='text-[21px] sm:text-[22px] 2xl:text-[24px] font-medium'>
                            History
                        </h3>
                    </div>

                    <div className='h-[350px] sm:h-[450px] lg:h-[500px] 2xl:h-[600px] overflow-y-auto pr-2'>
                        {errorChat ? (
                            <div className='w-full h-full flex flex-col items-center justify-center text-center px-5'>
                                <IoAlertCircleOutline
                                    size={36}
                                    className={
                                        theme === 'dark'
                                            ? 'text-[#FF5577]'
                                            : 'text-[#E11D48]'
                                    }
                                />

                                <h4 className={`text-[17px] font-medium mt-3 ${
                                    theme === 'dark'
                                        ? 'text-white'
                                        : 'text-[#202124]'
                                }`}>
                                    {errorChat}
                                </h4>

                                <p className={`text-[14px] mt-1 ${
                                    theme === 'dark'
                                        ? 'text-[#8EA6C9]'
                                        : 'text-[#6F6F6F]'
                                }`}>
                                    Please try again later.
                                </p>
                            </div>
                        ) : (
                            <ul>
                                {formattingChats().map((chat) => (
                                    <li
                                        key={chat.id}
                                        className={`w-full h-16 flex items-center border rounded-[12px] px-3 sm:px-4 py-3 mb-3 cursor-pointer transition-colors duration-200 ${
                                            theme === 'dark'
                                                ? activeChatsID === chat.id
                                                    ? 'bg-[#0D2A50] border-[#429EFF]'
                                                    : 'bg-[#06142B] border-[#164A7D] hover:bg-[#0B203D]'
                                                : activeChatsID === chat.id
                                                    ? 'bg-[#E5EEFF] border-[#429EFF]'
                                                    : 'border-[#DFE1E7] hover:bg-[#E5EEFF]'
                                        }`}
                                        onClick={() => {
                                            setActiveChatsID(chat.id)
                                            setUsersMessages(chat.messages)
                                            setErrorMessage(null)
                                        }}
                                    >
                                        <div className='w-full min-w-0 flex flex-row justify-between items-center gap-3'>
                                            <div className='min-w-0 flex flex-row items-center gap-3'>
                                                <div className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 ${
                                                    theme === 'dark'
                                                        ? 'text-[#429EFF] bg-[#0D2A50]'
                                                        : 'text-[#3157D5] bg-[#EEF2FF]'
                                                }`}>
                                                    <LuMessageSquareText size={18} />
                                                </div>

                                                <div className='min-w-0'>
                                                    <h4 className='max-w-[197px] truncate'>
                                                        {chat.title}
                                                    </h4>

                                                    <p className={`text-[12px] sm:text-[14px] ${
                                                        theme === 'dark'
                                                            ? 'text-[#8EA6C9]'
                                                            : ''
                                                    }`}>
                                                        Updated {chat.updated_at}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                className={`w-8 h-8 flex items-center justify-center rounded-xl shrink-0 cursor-pointer ${
                                                    theme === 'dark'
                                                        ? 'text-[#FF5577] bg-[#351427] hover:bg-[#4A1830]'
                                                        : 'text-[#E11D48] bg-[#FFF0F5]'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteChat(chat.id)
                                                }}
                                            >
                                                <FaRegTrashAlt size={18} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button
                        className='w-full h-14 text-center text-white bg-[#2196F3] hover:bg-[#35A5FF] rounded-full cursor-pointer transition-colors'
                        onClick={() => createNewChat()}
                    >
                        New Chat
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AIAssistantWidget