<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="logo">
        <img src="@/assets/logo2.png" alt="서재의 온도 로고"/>
      </router-link>
      <nav class="nav-links">
        <router-link to="/recommend">도서 추천</router-link>
        <router-link to="/theme/1">테마별 도서</router-link>
        <router-link to="/reviews">모두의 감상평</router-link>
        <router-link to="/endings">열린 결말</router-link>
      </nav>
      <div class="auth-links">
        <template v-if="!isLoggedIn">
          <router-link to="/signup">회원가입</router-link>
          <router-link to="/login" class="btn-primary">로그인</router-link>
        </template>
        <template v-else>
          <router-link to="/profile">마이페이지</router-link>
          <button @click="logout" class="btn-primary">로그아웃</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1.25rem;
  color: #333;
}
.logo img {
  width: auto;
  height: 32px;
  margin-right: 0.5rem;
}
.nav-links a {
  margin: 0 1rem;
  color: #333;
  text-decoration: none;
}
.auth-links {
  display: flex;
  align-items: center;
}
.auth-links a {
  margin-right: 1rem;
  color: #333;
  text-decoration: none;
}
.auth-links .btn-primary {
  padding: 0.5rem 1rem;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
