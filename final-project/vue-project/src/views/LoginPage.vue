<template>
  <div class="login-page">

    <!-- CONTENT -->
    <main class="content">
      <div class="form-wrapper">
        <h2>로그인</h2>
        <div class="find-links">
          <router-link to="/find-id">아이디 찾기</router-link>
          <span>/</span>
          <router-link to="/find-pw">비밀번호 찾기</router-link>
        </div>
        <form @submit.prevent="handleLogin">
          <div class="field">
            <label for="userId">아이디</label>
            <input id="userId" v-model="userId" type="text" required />
          </div>
          <div class="field">
            <label for="password">비밀번호</label>
            <input id="password" v-model="password" type="password" required />
          </div>
          <button type="submit" class="btn-login">로그인</button>
        </form>

        <div class="divider">
          <span>소셜 로그인</span>
        </div>
        <div class="social-buttons">
          <button class="btn-social btn-naver" @click="socialLogin('naver')">
            <!-- 네이버 N 로고 대신 텍스트로 대체 -->
            <span class="icon">N</span> 네이버 로그인
          </button>
          <button class="btn-social btn-kakao" @click="socialLogin('kakao')">
            <span class="icon">🗨️</span> 카카오 로그인
          </button>
          <button class="btn-social btn-google" @click="socialLogin('google')">
            <span class="icon">G</span> 구글 로그인
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userId = ref('')
const password = ref('')
const userStore = useUserStore()

function handleLogin() {
  // TODO: API 호출 후 로그인 성공 시
  console.log('로그인 시도', userId.value, password.value)
  userStore.login(userId.value)
  router.push('/')  // 로그인 후 홈으로 이동
}

function socialLogin(provider) {
  // TODO: 소셜 로그인 로직
  console.log(provider, '로그인')
}
</script>

<style scoped>
/* ── 레이아웃 ────────────────────────────────────────── */
.login-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f9f9f9;
}
.header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.header-inner {
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

/* 메인 콘텐츠 */
.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 4rem 1rem;
}
.form-wrapper {
  background: #fff;
  padding: 3rem 2rem;
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
.form-wrapper h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: #333;
}
.find-links {
  text-align: right;
  margin-bottom: 2rem;
}
.find-links a {
  color: #999;
  text-decoration: none;
  margin: 0 0.25rem;
  font-size: 0.875rem;
}
.find-links span {
  color: #ccc;
}

/* 입력 필드 */
.field {
  margin-bottom: 1.5rem;
}
.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}
.field input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}
.field input:focus {
  border-color: #ffc93c;
}

/* 로그인 버튼 */
.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: #ffc93c;
  color: #fff;
  font-size: 1rem;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-login:hover {
  background: #e0b032;
}

/* 소셜 로그인 구분선 */
.divider {
  display: flex;
  align-items: center;
  margin: 2.5rem 0 1rem;
}
.divider::before,
.divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #ddd;
}
.divider span {
  margin: 0 1rem;
  color: #777;
  font-size: 0.875rem;
}

/* 소셜 버튼 */
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 24px;
  cursor: pointer;
}
.btn-social .icon {
  margin-right: 0.5rem;
  font-weight: bold;
}

/* 네이버 */
.btn-naver {
  background: #03c75a;
  color: #fff;
}
/* 카카오 */
.btn-kakao {
  background: #fee500;
  color: #3c1e1e;
}
/* 구글 */
.btn-google {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}
</style>
