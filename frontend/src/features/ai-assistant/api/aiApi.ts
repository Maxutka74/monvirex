import api from "../../../shared/api/instance.ts";

export interface Message {
    id: number;
    role: string;
    content: string;
    created_at: string;
    chat: number
}

export type UserChats = {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    messages: Message[]
}

const getChats = async(): Promise<UserChats[]> => {
    const response = await api.get("/ai/chat/")

    return response.data
}

const createChat = async (): Promise<UserChats> => {
    const response = await api.post("/ai/chat/create/")

    return response.data
}

const sendMessage = async (message: string, chat_id: number | null): Promise<{response: string}> => {
    const response = await api.post("/ai/chat/sendmessage/", {message, chat_id});

    return response.data
}

const getChat = async (chat_id: number): Promise<UserChats> => {
    const response = await api.get(`/ai/chat/${chat_id}/`)

    return response.data
}

const deleteChat = async (chat_id: number): Promise<void> => {
    await api.delete(`/ai/chat/${chat_id}/`)
}

const getMarketAnalysis = async (): Promise<string> => {
    const response = await api.get('/ai/market-analysis/')

    return response.data

}

const getPortfolioAnalysis = async (): Promise<string> => {
    const response = await api.get('/ai/portfolio-analysis/')

    return response.data
}

export default {
    getChats,
    createChat,
    sendMessage,
    getChat,
    deleteChat,
    getMarketAnalysis,
    getPortfolioAnalysis
}