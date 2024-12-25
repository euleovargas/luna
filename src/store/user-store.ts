import { create } from "zustand"
import { User } from "@prisma/client"

interface UserState {
  user: Partial<User> | null
  setUser: (user: Partial<User> | null) => void
  updateUser: (data: Partial<User>) => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (data) => 
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}))
