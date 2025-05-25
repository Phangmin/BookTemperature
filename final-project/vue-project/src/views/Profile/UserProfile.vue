<!-- src/views/Profile/UserProfile.vue -->
<template>
    <div class="user-profile">
      <!-- 1. 사이드바 -->
      <aside class="sidebar">
        <div class="avatar-wrapper">
          <img class="avatar" src="@/assets/avatar.jpg" alt="유저 아바타" />
          <h2 class="username">호랭이 김싸피</h2>
          <button class="btn edit-btn">회원 정보 수정</button>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="number">0</span>
            <span class="label">팔로잉</span>
          </div>
          <div class="stat">
            <span class="number">0</span>
            <span class="label">팔로워</span>
          </div>
        </div>
        <div class="temperature">
          <label class="label">내 서재 온도</label>
          <div class="temp-bar">
            <div class="fill" :style="{ width: temp + '%' }"></div>
            <span class="temp-marker" :style="{ left: temp + '%' }">🌡️</span>
          </div>
          <div class="temp-value">{{ (temp * 0.36 + 5).toFixed(1) }}°C</div>
        </div>
      </aside>
  
      <!-- 2. 메인 컨텐츠 -->
      <section class="main-content">
        <!-- 2-1. 탭 -->
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="{ active: currentTab === tab.key }"
            @click="currentTab = tab.key"
          >
            {{ tab.label }} ({{ tab.count }})
          </button>
        </div>
  
        <!-- 2-2. 탭 컨텐츠: 리스트 형태의 카드 -->
        <div class="tab-panel">
          <div class="item-list">
            <div
              class="item-card"
              v-for="item in itemsMap[currentTab]"
              :key="item.id"
            >
              <!-- 좌측 커버 -->
              <img class="cover" :src="item.cover" alt="책 표지" />
  
              <!-- 중간 정보 -->
              <div class="info">
                <h3 class="title">{{ item.title }} <span v-if="item.author">(작가: {{ item.author }})</span></h3>
                <p class="desc">{{ item.desc }}</p>
              </div>
  
              <!-- 우측 액션 -->
              <div class="actions">
                <button class="btn btn-detail">도서 상세보기</button>
                <template v-if="currentTab === 'reviews'">
                  <button class="btn btn-action">감상문 작성</button>
                </template>
                <template v-else-if="currentTab === 'endings'">
                  <button class="btn btn-action">감상문 보기</button>
                </template>
                <template v-else>
                  <!-- 읽고싶은책 / 다읽은책 -->
                  <button class="btn btn-action">감상문 작성</button>
                  <button class="btn btn-action">열린 결말 작성</button>
                </template>
                <button class="btn btn-delete">삭제하기</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // 온도 퍼센트 (임시)
  const temp = ref(75)
  
  // 탭 정보와 해당 아이템 수
  const tabs = [
    { key: 'reviews',    label: '나의 감상문',    count: 9 },
    { key: 'endings',    label: '나의 열린 결말', count: 4 },
    { key: 'wantToRead', label: '읽고 싶은 책',   count: 4 },
    { key: 'read',       label: '다 읽은 책',     count: 4 },
  ]
  const currentTab = ref('reviews')
  
  // 탭별 아이템 더미 데이터
  const reviews = Array.from({ length: 9 }, (_, i) => ({
    id: i+1,
    cover: 'https://via.placeholder.com/60x90?text=표지',
    title: '책 제목 ' + (i+1),
    author: '홍길동',
    desc: '여기에 내가 쓴 감상문 내용이 들어갑니다. 짧게 요약되죠.'
  }))
  const endings = Array.from({ length: 4 }, (_, i) => ({
    id: i+1,
    cover: 'https://via.placeholder.com/60x90?text=표지',
    title: '열린결말 제목 ' + (i+1),
    author: '이영희',
    desc: '열린 결말에 대한 간단한 설명이 여기에 표시됩니다.'
  }))
  const wantToRead = Array.from({ length: 4 }, (_, i) => ({
    id: i+1,
    cover: 'https://via.placeholder.com/60x90?text=표지',
    title: '읽고싶은책 ' + (i+1),
    author: '작자 미상',
    desc: '이 책을 꼭 읽고 싶어서 찜해두었습니다.'
  }))
  const read = Array.from({ length: 4 }, (_, i) => ({
    id: i+1,
    cover: 'https://via.placeholder.com/60x90?text=표지',
    title: '읽은책 ' + (i+1),
    author: '어떤 작가',
    desc: '이미 다 읽은 책입니다. 좋아요!'
  }))
  
  const itemsMap = {
    reviews,
    endings,
    wantToRead,
    read
  }
  </script>
  
  <style scoped>
  .user-profile {
    display: flex;
    min-height: 100vh;
    background: #faf9f5;
  }
  
  /* ── 사이드바 ───────────────────────── */
  .sidebar {
    width: 280px;
    background: #fff;
    padding: 2rem 1.5rem;
    border-right: 1px solid #e0e0e0;
  }
  .avatar-wrapper {
    text-align: center;
    margin-bottom: 2rem;
  }
  .avatar {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
  }
  .username {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  .edit-btn {
    margin-top: 0.75rem;
    padding: 0.5rem 1rem;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.9rem;
    cursor: pointer;
  }
  .stats {
    display: flex;
    justify-content: space-around;
    margin: 2rem 0;
  }
  .stat .number {
    display: block;
    font-size: 1.25rem;
    font-weight: bold;
  }
  .stat .label {
    color: #666;
  }
  .temperature {
    margin-top: 1rem;
  }
  .temperature .label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: #333;
  }
  .temp-bar {
    position: relative;
    width: 100%;
    height: 8px;
    background: #eee;
    border-radius: 4px;
    overflow: hidden;
  }
  .temp-bar .fill {
    height: 100%;
    background: #ffc93c;
  }
  .temp-bar .temp-marker {
    position: absolute;
    top: -12px;
    transform: translateX(-50%);
    font-size: 1rem;
  }
  .temp-value {
    text-align: center;
    margin-top: 0.25rem;
    font-size: 0.9rem;
    color: #333;
  }
  
  /* ── 메인 컨텐츠 ──────────────────────── */
  .main-content {
    flex: 1;
    padding: 2rem;
  }
  
  /* 탭 */
  .tabs {
    display: flex;
    gap: 1rem;
    border-bottom: 2px solid #ffc93c;
    margin-bottom: 1.5rem;
  }
  .tabs button {
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: #666;
  }
  .tabs button.active {
    background: #fff;
    color: #333;
    border: 1px solid #e0e0e0;
    border-bottom: 2px solid #ffc93c;
  }
  
  /* 카드 리스트 */
  .tab-panel {
    background: #fff;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 8px 8px;
  }
  .item-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .item-card {
    display: flex;
    align-items: flex-start;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .cover {
    width: 60px;
    height: 90px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;
  }
  .info {
    flex: 1;
  }
  .title {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }
  .desc {
    margin: 0;
    font-size: 0.9rem;
    color: #555;
    line-height: 1.4;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-left: 1rem;
    white-space: nowrap;
  }
  .actions .btn {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    font-size: 0.85rem;
    cursor: pointer;
  }
  .btn-detail { background: #ffc93c; color: #fff; }
  .btn-action { background: #f0f0f0; color: #333; }
  .btn-delete { background: #e63c3c; color: #fff; }
  
  /* 카드 hover 시 살짝 커지는 효과 */
  .item-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .item-card:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  </style>
  