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

async function handleLogin() { // async 추가
  console.log('로그인 시도', userId.value, password.value);
  const credentials = {
    username: userId.value, // 백엔드 LoginSerializer가 기대하는 필드명 (username 또는 email)
    password: password.value
  };
  const success = await userStore.login(credentials); // await 추가 및 결과 받기

  if (success) {
    router.push('/'); // 로그인 성공 시 홈으로 이동
  } else {
    // 로그인 실패 시 사용자에게 알림 (userStore.login에서 이미 console.error 처리)
    alert('아이디 또는 비밀번호가 일치하지 않습니다.');
  }
}

function socialLogin(provider) {
  // Django allauth가 제공하는 소셜 로그인 URL로 리다이렉트
  // 백엔드 서버 주소는 환경에 맞게 설정해야 합니다. (예: http://localhost:8000)
  // const backendUrl = 'http://localhost:8000'; // 실제 백엔드 주소로 변경

  console.log(`소셜 로그인 시도: ${provider}`);
  alert(`${provider} 소셜 로그인은 현재 준비 중입니다.`);

  // if (provider === 'naver') {
  //   window.location.href = `${backendUrl}/accounts/naver/login/`;
  // } else if (provider === 'kakao') {
  //   window.location.href = `${backendUrl}/accounts/kakao/login/`;
  // } else if (provider === 'google') {
  //   window.location.href = `${backendUrl}/accounts/google/login/`;
  // }
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
