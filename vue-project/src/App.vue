<!-- App.vue -->
<template>
  <div class="app">
    <Navbar :isSolidView="isSolidView" @update-navbar-height="setNavbarHeight" />
    <div class="app-container"> <!-- 전체 콘텐츠를 감싸는 컨테이너 -->
      <div class="sections-wrapper" ref="sectionsWrapperRef" :style="{ paddingTop: dynamicPaddingTop }">
        <router-view :key="$route.fullPath"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'

const sectionsWrapperRef = ref(null) // ref 이름 변경
const userStore = useUserStore()
const route = useRoute()
const navbarHeight = ref(0)
const scrollTop = ref(0)

// Navbar.vue의 SCROLL_THRESHOLD와 동일한 로직 및 값 사용
const SCROLL_THRESHOLD = ref(300); // 기본값, onMounted에서 업데이트

// 현재 페이지가 홈페이지인지 확인
const isHomePage = computed(() => route.path === '/')

// Navbar가 solid 스타일이어야 하는지 여부 (App.vue에서 계산)
const isSolidView = computed(() => {
  if (!isHomePage.value) {
    return true; // 홈페이지가 아니면 항상 solid
  }
  // 홈페이지인 경우, 스크롤 위치에 따라 결정
  return scrollTop.value > SCROLL_THRESHOLD.value;
})

const dynamicPaddingTop = computed(() => {
  // BookTheme, ReviewDetail, EndingDetail 페이지에서는 Navbar 높이만큼의 패딩을 적용하지 않음
  if (route.name === 'BookTheme' || route.name === 'ReviewDetail' || route.name === 'EndingDetail') {
    return '0px';
  }
  // 홈페이지가 아니거나, 홈페이지이면서 Navbar가 solid 상태일 때 패딩 적용
  if (!isHomePage.value || isSolidView.value) {
    return `${navbarHeight.value}px`;
  }
  return '0px'; // 홈페이지 최상단 (Navbar transparent)에서는 패딩 없음
})

function setNavbarHeight(height) {
  navbarHeight.value = height
}

function handleScroll() {
  if (sectionsWrapperRef.value) {
    scrollTop.value = sectionsWrapperRef.value.scrollTop;
  }
}

onMounted(() => {
  userStore.initializeAuth();
  SCROLL_THRESHOLD.value = window.innerHeight * 0.5; // Navbar.vue와 동일한 로직

  if (sectionsWrapperRef.value) {
    sectionsWrapperRef.value.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 초기 스크롤 위치에 따른 상태 계산
  }
})

onUnmounted(() => {
  if (sectionsWrapperRef.value) {
    sectionsWrapperRef.value.removeEventListener('scroll', handleScroll);
  }
})

// 라우트 변경 시 스크롤 상태 및 패딩 재계산
watch(() => route.path, () => {
  // 페이지 이동 시 스크롤을 맨 위로
  if (sectionsWrapperRef.value) {
    sectionsWrapperRef.value.scrollTop = 0;
  }
  handleScroll(); // 스크롤 위치에 따른 상태 즉시 업데이트
});

</script>
<!-- 중복된 스크립트 닫는 태그 및 주석 제거 -->
<style>
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* App 전체에서 스크롤바가 중복되지 않도록 */
}

.app-container {
  flex-grow: 1;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 내부 sections-wrapper에서 스크롤 관리 */
}

.sections-wrapper {
  flex-grow: 1;
  overflow-y: auto; /* 이 요소에서 스크롤 발생 */
  overflow-x: hidden;
  transition: padding-top 0.3s ease-in-out; /* 부드러운 패딩 변화 */
  scroll-snap-type: y mandatory; /* Y축으로 스크롤 스냅 활성화 */
  scroll-behavior: smooth; /* CSS를 통한 부드러운 스크롤 효과 */
}

/* 이전 CSS 규칙 제거: .navbar.solid + .app-container .sections-wrapper */
</style>
