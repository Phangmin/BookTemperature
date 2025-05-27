// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// ✏️ 여기를 HomeView에서 HomePage로 바꿔주세요
import HomePage from '@/views/HomePage.vue'

// BookRecommend.vue 경로가 BookRecomend.vue일 경우 이름이 오타가 났다면 파일명에 맞춰 수정하세요
import BookRecomend from '@/views/Book/BookRecomend.vue'
import BookTheme from '@/views/Book/BookTheme.vue'
// const BookDetail = () => import('@/views/Book/BookDetail.vue')

import BookDetail from '@/views/Book/BookDetail.vue'
import ReviewDetail from '@/views/Review/ReviewDetail.vue'
import ReviewEdit from '@/views/Review/ReviewEdit.vue' // ReviewEdit 임포트
import EndingDetail from '@/views/Review/EndingDetail.vue'

import SignUpPage from '@/views/SignUpPage.vue'

import LoginPage from '@/views/LoginPage.vue'
import UserProfile from '@/views/Profile/UserProfile.vue'
import UserEditProfile from '@/views/Profile/UserEditProfile.vue' // 회원정보 수정 페이지 추가

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/recommend',
    name: 'book-recommend',
    component: BookRecomend,
  },
  {
    path: '/theme',
    redirect: { name: 'BookTheme', params: { id: 1 } },
  },
  {
    path: '/theme/:id',
    name: 'BookTheme',
    component: BookTheme,
    props: true,
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: BookDetail,
    props: true,
  },
  // 감상평 상세 페이지
  {
    path: '/book/:bookId/review/:reviewId',
    name: 'ReviewDetail',
    component: ReviewDetail,
    props: true
  },
  // 감상평 수정 페이지
  {
    path: '/book/:bookId/review/:reviewId/edit',
    name: 'ReviewEdit',
    component: ReviewEdit,
    props: true
    // meta: { requiresAuth: true } // 작성자만 접근 가능하도록 가드 추가 가능
  },
  // 열린결말 상세 페이지
  {
    path: '/book/:bookId/ending/:endingId',
    name: 'EndingDetail',
    component: EndingDetail,
    props: true
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('@/views/SignUpPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/profile/:username?',
    name: 'profile',
    component: UserProfile,
  },
  {
    path: '/profile/edit', // 회원 정보 수정 페이지 라우트
    name: 'UserEditProfile',
    component: UserEditProfile,
    // meta: { requiresAuth: true } // 필요한 경우 인증 가드 추가
  },
  // { // 소셜 로그인 콜백 라우트 주석 처리
  //   path: '/social-login-callback',
  //   name: 'SocialLoginCallback',
  //   component: () => import('@/views/SocialLoginCallback.vue'),
  //   props: (route) => ({ query: route.query })
  // },
  // TODO: ‘모두의 감상평’ 과 ‘열린 결말’도 나중에 추가하세요.
  {
    path: '/reviews',
    name: 'reviews',
    // 임시로 HomePage 컴포넌트 사용, 추후 실제 컴포넌트로 교체 필요
    component: HomePage, //  실제 ReviewListPage 같은 컴포넌트로 변경해야 합니다.
  },
  {
    path: '/endings',
    name: 'endings',
    // 임시로 HomePage 컴포넌트 사용, 추후 실제 컴포넌트로 교체 필요
    component: HomePage, // 실제 EndingListPage 같은 컴포넌트로 변경해야 합니다.
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
