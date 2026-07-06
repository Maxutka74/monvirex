import { create } from 'zustand'
import type {User} from '../types/user'
import api from "../../../shared/api/instance"

type UserStore = {
    user: User | null
    isAuth: boolean
    isLoading: boolean
    setUser: (user: User) => void
    clearUser: () => void
    checkAuth: () => Promise<void>
}

const useUserStore = create<UserStore>((set) => (
    {
        user: null,
        isAuth: false,
        isLoading: true,

        setUser: (user) => set({ user,
                                            isAuth: true,
                                            isLoading: false
        }),

        clearUser: () => set({ user: null,
                                     isAuth: false,
                                     isLoading: false}),

        checkAuth: async () => {
            try {
                const response = await api.get('/auth/me/')
                set({
                    user: response.data,
                    isAuth: true,
                    isLoading: false,
                })
            } catch (e) {
                set({ user: null,
                      isAuth: false,
                      isLoading: false
                    })

            }

        }
    }
    )
)

export default useUserStore