// src/stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    username: null,
  }),
  actions: {
    login(username) {
      this.username = username
      this.isLoggedIn = true
    },
    logout() {
      this.username = null
      this.isLoggedIn = false
    }
  }
})
