import api from "../../../shared/api/instance.ts";

export type Profile = {
    'first_name': string,
    'last_name': string,
    'avatar': string,
}

export type UpdateProfile = {
    'first_name': string,
    'last_name': string,
}

export type UpdateAvatar = {
    'avatar': File
}

const getProfile = async (): Promise<Profile> => {
    const response = await api.get('/auth/profile/')

    return response.data
}

const updateProfile = async (data: UpdateProfile): Promise<{first_name: string, last_name: string}> => {
    const response = await api.patch('/auth/profile/', data)

    return response.data
}

const updateAvatar = async (data: UpdateAvatar): Promise<{avatar: string}> => {
    const formData = new FormData()
    formData.append('avatar', data.avatar)

    const response = await api.patch('/auth/profile/avatar/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    })

    return response.data
}

const deleteAvatar = async (): Promise<void> => {
    await api.delete('/auth/profile/avatar/')
}

const deleteProfile = async (): Promise<void> => {
    await api.post('/auth/profile/delete/')
}

export default {
    getProfile,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    deleteProfile,
}