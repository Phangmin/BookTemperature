// src/stores/user.js
import { defineStore } from 'pinia'
import apiClient from '@/api'; // apiClient 직접 임포트

// API_URL은 apiClient의 baseURL을 사용하므로, 직접적인 API_URL 상수는 불필요해질 수 있음
// 또는 apiClient.defaults.baseURL을 참조할 수 있음

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    username: localStorage.getItem('username') || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: JSON.parse(localStorage.getItem('user')) || null, // 사용자 객체 정보 추가
  }),
  getters: {
    // API 요청 시 헤더에 토큰을 포함하기 위한 getter
    authHeader: (state) => {
      if (state.accessToken) {
        return { Authorization: `Bearer ${state.accessToken}` };
      } else {
        return {};
      }
    },
  },
  actions: {
    async login(credentials) {
      try {
        console.log('[userStore] Attempting login with credentials:', credentials);
        // apiClient를 사용하여 API 호출
        const response = await apiClient.post(`/auth/login/`, credentials);
        console.log('[userStore] Login API response:', response);

        const { key } = response.data;

        if (key) {
          console.log('[userStore] Login successful. Token received:', key);
          this.setToken(key);
          await this.fetchUser();

          if (this.isLoggedIn) {
            console.log('[userStore] User details fetched successfully after login.');
            return true;
          } else {
            console.error('[userStore] Login succeeded but failed to fetch user details.');
            this.logout();
            return false;
          }
        } else {
          console.error('[userStore] Login failed: Token not found in server response. Response data:', response.data);
          this.logout();
          return false;
        }
      } catch (error) {
        console.error('[userStore] Login API call failed. Error object:', error);
        if (error.response) {
          console.error('[userStore] Error response data:', error.response.data);
          console.error('[userStore] Error response status:', error.response.status);
          // 상세 에러 메시지 처리 강화
          const errorMsg = error.response.data.non_field_errors ? error.response.data.non_field_errors.join(', ') : JSON.stringify(error.response.data);
          console.error('[userStore] Specific login error:', errorMsg);
        } else if (error.request) {
          console.error('[userStore] Error request data (no response received):', error.request);
        } else {
          console.error('[userStore] Error message (request setup issue):', error.message);
        }
        this.logout();
        return false;
      }
    },
    logout() {
      this.username = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isLoggedIn = false;
      this.user = null; // 사용자 정보 초기화

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username');
      localStorage.removeItem('user'); // 사용자 정보 삭제
      delete apiClient.defaults.headers.common['Authorization']; // apiClient 헤더 삭제
    },
    setToken(token) {
      this.accessToken = token;
      this.isLoggedIn = !!token;
      if (token) {
        localStorage.setItem('accessToken', token);
        // 백엔드가 'Token <token_value>' 형식을 기대한다고 가정
        apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
      } else {
        localStorage.removeItem('accessToken');
        delete apiClient.defaults.headers.common['Authorization'];
      }
    },
    // setTokens 함수는 현재 사용되지 않으므로 그대로 두거나, 필요시 Token 스키마에 맞게 수정
    // setTokens(accessToken, refreshToken) { ... }

    async fetchUser() {
      const tokenFromStorage = localStorage.getItem('accessToken');

      if (tokenFromStorage) {
        // localStorage에 토큰이 있으면, 스토어 상태와 apiClient 헤더를 우선 설정
        this.accessToken = tokenFromStorage; // 스토어 상태 업데이트
        apiClient.defaults.headers.common['Authorization'] = `Token ${tokenFromStorage}`; // apiClient 헤더 설정
        this.isLoggedIn = true; // API 검증 전까지 임시로 로그인 상태로 간주
        console.log('[userStore] fetchUser: Token found in localStorage. apiClient Auth header set to:', apiClient.defaults.headers.common['Authorization']);
      } else {
        // localStorage에 토큰이 없으면 로그아웃 처리하고 함수 종료
        console.log('[userStore] fetchUser: No token in localStorage, logging out.');
        this.logout();
        return;
      }

      try {
        console.log('[userStore] fetchUser: Attempting to fetch user with token (from store state):', this.accessToken);
        const response = await apiClient.get(`/auth/user/`);
        const user = response.data;
        console.log('[userStore] fetchUser: User data received from API:', JSON.parse(JSON.stringify(user)));

        this.username = user.username;
        this.user = user; // 사용자 객체 전체를 스토어에 저장
        localStorage.setItem('username', user.username);
        localStorage.setItem('user', JSON.stringify(user)); // 사용자 객체 전체를 localStorage에 저장
        this.isLoggedIn = true; // API 호출 성공 시 확실히 로그인 상태
        console.log('[userStore] fetchUser: Store state updated. this.user:', JSON.parse(JSON.stringify(this.user)), 'this.isLoggedIn:', this.isLoggedIn);
      } catch (error) {
        console.error('[userStore] fetchUser: Failed to fetch user. Error:', error.response ? error.response.data : error.message);
        // 401 오류 발생 시 토큰이 유효하지 않으므로 로그아웃
        if (error.response && error.response.status === 401) {
          console.log('[userStore] fetchUser: Token is invalid (401), logging out.');
          this.logout();
        }
        // 다른 종류의 에러(네트워크 등)에서는 isLoggedIn 상태를 false로 설정할 수 있으나,
        // logout()을 호출하면 토큰까지 지워버리므로 주의.
        // 여기서는 401이 아닌 경우엔 토큰을 유지하고 로그인 상태만 false로 변경하거나,
        // 혹은 현재처럼 아무것도 안하고 다음번 앱 실행 시 initializeAuth에서 다시 시도하도록 둘 수 있음.
        // 현재는 401일 때만 명시적으로 로그아웃.
      }
    },
    // 페이지 로드 시 토큰 유효성 검사 및 사용자 정보 로드
    async initializeAuth() {
      const token = localStorage.getItem('accessToken');
      if (token && !this.isLoggedIn) { // 이미 로그인 상태가 아니라면 초기화 시도
        await this.fetchUser();
      } else if (!token) {
        this.logout(); // 토큰이 없으면 확실히 로그아웃
      }
    }
  }
})
