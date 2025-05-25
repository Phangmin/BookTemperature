// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// ✏️ 여기를 HomeView에서 HomePage로 바꿔주세요
import HomePage from '@/views/HomePage.vue'

// BookRecommend.vue 경로가 BookRecomend.vue일 경우 이름이 오타가 났다면 파일명에 맞춰 수정하세요
import BookRecomend from '@/views/Book/BookRecomend.vue'
import BookTheme    from '@/views/Book/BookTheme.vue'
// const BookDetail = () => import('@/views/Book/BookDetail.vue')

import BookDetail from '@/views/Book/BookDetail.vue'
import ReviewDetail from '@/views/Review/ReviewDetail.vue'
import EndingDetail from '@/views/Review/EndingDetail.vue'

import SignUpPage    from '@/views/SignUpPage.vue'

import LoginPage     from '@/views/LoginPage.vue'
import UserProfile   from '@/views/Profile/UserProfile.vue'

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
  // TODO: ‘모두의 감상평’ 과 ‘열린 결말’도 나중에 추가하세요.
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
