<!-- Navbar.vue -->

<template>
  <nav :class="['navbar', { 'navbar-solid': showSolidNavbar, 'navbar-transparent': !showSolidNavbar }]" ref="navbarRef">
    <div class="navbar-inner">
      <router-link to="/" class="logo">
        <img src="@/assets/logo2.png" alt="서재의 온도 로고" :class="{'logo-white': !showSolidNavbar}"/>
        <span :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}"></span>
      </router-link>
      <nav class="nav-links">
        <router-link to="/recommend" :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}">도서 추천</router-link>
        <router-link to="/theme/1" :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}">테마별 도서</router-link>
        <router-link to="/reviews" :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}">모두의 감상평</router-link>
        <router-link to="/endings" :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}">열린 결말</router-link>
      </nav>
      <div class="auth-links">
        <template v-if="!isLoggedIn">
          <router-link to="/signup" :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}">회원가입</router-link>
          <router-link to="/login" :class="['btn-auth', !showSolidNavbar ? 'btn-auth-transparent' : 'btn-auth-solid']">로그인</router-link>
        </template>
        <template v-else>
          <router-link to="/profile" :class="{'text-white': !showSolidNavbar, 'text-black': showSolidNavbar}">마이페이지</router-link>
          <button @click="logout" :class="['btn-auth', !showSolidNavbar ? 'btn-auth-transparent' : 'btn-auth-solid']">로그아웃</button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue' // onUnmounted 제거, nextTick 추가
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  // App.vue에서 계산된 Navbar의 solid 상태 여부를 prop으로 받음
  isSolidView: { type: Boolean, default: false }
})

const emit = defineEmits(['update-navbar-height'])

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)
const navbarRef = ref(null)

// 현재 페이지가 홈페이지인지 확인
const isHomePage = computed(() => route.path === '/')

// Navbar의 최종 스타일 결정 (solid 또는 transparent)
// 홈페이지가 아니면 항상 solid, 홈페이지면 App.vue에서 전달된 isSolidView 상태를 따름
const showSolidNavbar = computed(() => {
  if (!isHomePage.value) {
    return true; // 홈페이지가 아니면 항상 solid
  }
  return props.isSolidView; // 홈페이지면 App.vue의 판단을 따름
})

function logout() {
  userStore.logout()
  router.push('/')
}

// Navbar 높이를 App.vue로 전달하는 로직은 유지
// showSolidNavbar 상태나 isHomePage 상태가 변경될 때 높이를 다시 emit 할 수 있도록 watch 설정
watch([showSolidNavbar, isHomePage, () => navbarRef.value], () => {
  if (navbarRef.value) {
    nextTick(() => { // DOM 업데이트 후 높이 측정
      if (navbarRef.value) {
        emit('update-navbar-height', navbarRef.value.offsetHeight);
      }
    });
  }
}, { immediate: true, deep: true }); // navbarRef.value의 변경도 감지하기 위해 deep 추가 (필요시)

onMounted(() => {
    // 초기 마운트 시 높이 전달
    if (navbarRef.value) {
        emit('update-navbar-height', navbarRef.value.offsetHeight);
    }
});

</script>

<style scoped>
.navbar {
  width: 100%;
  position: absolute; /* 기본적으로 absolute로 설정하여 오버레이 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
  padding: 0; /* 내부 .navbar-inner에서 패딩 관리 */
}

.navbar-transparent {
  background-color: transparent;
  box-shadow: none;
}
.navbar-transparent .logo-white {
  filter: brightness(0) invert(1); /* 로고 이미지를 흰색으로 만듭니다. */
}
.navbar-transparent .text-white {
  color: #fff !important;
}
.navbar-transparent .btn-auth-transparent {
  background-color: transparent;
  border: 1.5px solid #fff;
  color: #fff;
}
.navbar-transparent .btn-auth-transparent:hover {
  background-color: rgba(255, 255, 255, 0.1);
}


.navbar-solid {
  position: sticky; /* 스크롤 시 sticky로 변경하여 공간 차지 */
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-bottom: 1px solid #f0f0f0; /* 연한 회색 선 */
}
.navbar-solid .logo-white {
  filter: none; /* 원래 로고 색상으로 돌아옴 */
}
.navbar-solid .text-black {
  color: #333 !important;
}
.navbar-solid .btn-auth-solid {
  background-color: #fff;
  border: 1.5px solid #FF8C00;
  color: #FF8C00;
}

.navbar-solid .btn-auth-solid:hover,
.navbar-transparent .btn-auth-transparent:hover {
  background-color: #FF8C00 !important; /* 주황색 배경 */
  border-color: #FF8C00 !important;     /* 테두리도 주황색 */
  color: #fff;               /* 흰 글씨 */
  transition: background-color 0.3s, color 0.3s, border-color 0.3s;
}


.navbar-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem; /* Navbar 높이 결정 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px; /* Navbar 높이 고정 (App.vue의 padding-top과 일치시키기 위함) */
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1.1rem; /* 로고 텍스트 크기 조정 */
  font-weight: 600;
}
.logo img {
  height: 28px; /* 로고 아이콘 크기 조정 */
  margin-right: 0.6rem;
  transition: filter 0.3s ease-in-out;
}
.logo span { /* 로고 텍스트 스타일 */
  transition: color 0.3s ease-in-out;
}

.nav-links {
  display: flex;
  gap: 1.5rem; /* 링크 간 간격 */
}
.nav-links a {
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out;
}
.nav-links a:hover {
  /* color: #FF8C00 !important; */ /* 호버 시 색상 변경 제거 */
  background-color: transparent !important; /* 호버 시 배경 투명 강제 */
  /* 필요하다면 다른 호버 효과 추가 (예: text-decoration: underline;) */
}


.auth-links {
  display: flex;
  align-items: center;
  gap: 1rem; /* 인증 링크/버튼 사이 간격 */
}
.auth-links a { /* 회원가입, 마이페이지 링크 */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease-in-out, background-color 0.3s ease-in-out;
}
.auth-links a:hover {
  /* color: #FF8C00 !important; */ /* 호버 시 색상 변경 제거 */
  background-color: transparent !important; /* 호버 시 배경 투명 강제 */
  /* 필요하다면 다른 호버 효과 추가 */
}

.btn-auth {
  padding: 0.5rem 1rem; /* 버튼 패딩 */
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out, border-color 0.3s ease-in-out;
  font-size: 0.9rem;
}

/* 공통 텍스트 색상 클래스 */
.text-white { color: #fff !important; }
.text-black { color: #333 !important; }

</style>
