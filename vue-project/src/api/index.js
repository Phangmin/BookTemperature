import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // 백엔드 API 주소
  // withCredentials: true, // 필요에 따라 주석 해제 (인증 정보 포함 시)
});

// 요청 인터셉터 (예: 토큰 추가)
// apiClient.interceptors.request.use(config => {
//   const token = localStorage.getItem('accessToken'); // 예시: 로컬 스토리지에서 토큰 가져오기
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// }, error => {
//   return Promise.reject(error);
// });

// 응답 인터셉터 (예: 에러 처리)
// apiClient.interceptors.response.use(response => {
//   return response;
// }, error => {
//   // 예: 401 Unauthorized 에러 시 로그인 페이지로 리다이렉트
//   if (error.response && error.response.status === 401) {
//     // router.push('/login'); // Vue Router 사용 시
//   }
//   return Promise.reject(error);
// });

export default apiClient;
