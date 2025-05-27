import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import apiClient from './api' // apiClient import 추가

const app = createApp(App)

app.config.globalProperties.$api = apiClient // 전역 속성으로 apiClient 등록

const pinia = createPinia(); // Pinia 인스턴스 생성
app.use(pinia); // 앱에 Pinia 적용

// User 스토어 가져오기 및 인증 초기화
// 이 import는 app.use(pinia) 이후에 와야 함
import { useUserStore } from '@/stores/user';
const userStore = useUserStore();
userStore.initializeAuth().then(() => {
  // initializeAuth 완료 후 앱 마운트 (선택적, 라우터 가드 등에서 초기 상태가 필요할 경우 유용)
  // 여기서는 initializeAuth가 비동기이지만, 앱 마운트는 동기적으로 진행해도 무방할 수 있음
  // 다만, 라우터 가드 등에서 로그인 상태를 즉시 확인해야 한다면 .then() 내부에서 마운트하는 것이 안전.
  // 현재는 initializeAuth가 백그라운드에서 실행되고, 필요한 컴포넌트에서 로그인 상태를 참조.
});

app.use(router)

app.mount('#app')
