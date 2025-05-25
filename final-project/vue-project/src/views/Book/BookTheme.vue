<!-- src/views/Book/BookTheme.vue -->
<template>
    <div class="book-theme-page">
      <!-- 1) 사이드바 -->
      <aside class="sidebar">
        <!-- 제목 + 밑줄 -->
         <h2 class="sidebar-title">테마별 도서</h2>
         <hr class="sidebar-divider" />

        <!-- 검색창 -->
        <input
          v-model="search"
          type="text"
          placeholder="도서 검색"
          class="search"
        />

        <!-- 카테고리 -->
        <ul class="category-list">
          <li
            v-for="theme in themes"
            :key="theme.id"
          >
            <button
              :class="{ active: theme.id === currentId }"
              @click="goTheme(theme.id)"
            >
              {{ theme.label }}
            </button>
          </li>
        </ul>
      </aside>
  
      <!-- 2) 메인 콘텐츠 -->
      <section class="main-content">
        <div class="banner-ads">
          <!-- 2.1) 대표 배너 -->
          <div class="highlight">
            <img
              :src="banner1"
              alt="대표 배너"
              class="highlight-img"
            />
          </div>

          <!-- 2.2) 광고 카드 -->
          <div class="ads">
            <div class="ad-card">
              <img :src="ad1" alt="광고1" class="ad-img" />
            </div>
            <div class="ad-card">
              <img :src="ad2" alt="광고2" class="ad-img" />
            </div>
          </div>
        </div>
          
  
        
  
        <!-- 2.3) 도서 리스트 -->
        <div class="book-list-section">
          <h3>{{ currentTheme.label }}</h3>
          <hr />
          <div class="book-grid">
            <router-link
              v-for="book in books"
              :key="book.id"
              :to="{ name: 'BookDetail', params: { id: book.id }}"
              class="book-item"
            >
              <img :src="book.cover" alt="book cover" />
              <h4>{{ book.title }}</h4>
              <p class="author">{{ book.author }}</p>
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import banner1 from '@/assets/banner1.jpg'
  import ad1 from '@/assets/ad1.png'
  import ad2 from '@/assets/ad2.jpg'
  
  // ▶ 라우터 /theme/:id 로 연결된다고 가정
  const route = useRoute()
  const router = useRouter()
  const currentId = computed(() => Number(route.params.id) || 1)
  const search = ref('')
  
  // ▶ 테마 목록 (아이콘 대신 label, description, image 포함)
  const themes = [
    { id: 1, label: '소설/시/희곡', description: '가장 문학적인 이야기들', image: 'https://via.placeholder.com/600x300?text=소설/시/희곡' },
    { id: 2, label: '경제/경영',   description: '비즈니스 통찰력',     image: 'https://via.placeholder.com/600x300?text=경제/경영' },
    { id: 3, label: '자기개발',     description: '나를 성장시키는 책',  image: 'https://via.placeholder.com/600x300?text=자기개발' },
    { id: 4, label: '인문/교양',     description: '세상을 읽는 눈',      image: 'https://via.placeholder.com/600x300?text=인문/교양' },
    { id: 5, label: '취미/실용',     description: '생활을 즐겁게',      image: 'https://via.placeholder.com/600x300?text=취미/실용' },
    { id: 6, label: '어린이/청소년', description: '다음 세대를 위한',    image: 'https://via.placeholder.com/600x300?text=어린이/청소년' },
    { id: 7, label: '과학',        description: '호기심을 자극하는',   image: 'https://via.placeholder.com/600x300?text=과학' },
  ]
  
  // ▶ 현재 테마 정보
  const currentTheme = computed(() =>
    themes.find((t) => t.id === currentId.value) || themes[0]
  )
  
  // ▶ 광고 데이터 (더미)
  // const ads = [
  //   { id: 1, image: 'https://via.placeholder.com/200x100?text=AD1', text: '“You’re Fired!” 중국 해고 통지서가 날아들었다' },
  //   { id: 2, image: 'https://via.placeholder.com/200x100?text=AD2', text: '온몸으로 불안을 깨부숴라! 전 세계 100만러너가 환호한 책' },
  // ]
  
  // ▶ 도서 리스트 (더미)
  const books = [
    { id: 1, cover: 'https://via.placeholder.com/150x220?text=7년의+밤',    title: '7년의 밤',      author: '정유정' },
    { id: 2, cover: 'https://via.placeholder.com/150x220?text=사람의+아들',  title: '사람의 아들',    author: '이문열' },
    { id: 3, cover: 'https://via.placeholder.com/150x220?text=죽은+시인의+사회', title: '죽은 시인의 사회', author: '톰 슐먼' },
    { id: 4, cover: 'https://via.placeholder.com/150x220?text=꽃을+보듯+너를+본다', title: '꽃을 보듯 너를 본다', author: '나태주' },
    { id: 5, cover: 'https://via.placeholder.com/150x220?text=노르웨이의+숲',  title: '노르웨이의 숲',   author: '무라카미 하루키' },
  ]
    
  function goTheme(id) {
    router.push({ name: 'BookTheme', params: { id } })
  }
  </script>
  
  <style scoped>
  .book-theme-page {
    display: flex;
    min-height: 100vh;
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

  /* ── 사이드바 ───────────────────────────────── */
  .sidebar {
    width: 240px;
    padding: 2rem 1rem;
    background: #fff;
    border-right: 1px solid #eee;
  }
  .search {
    width: 100%;
    height: 36px;
    padding: 0 1rem;
    border: 1px solid #ffc93c;
    border-radius: 20px;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
  }
  .search:focus {
  border-color: #ffc93c; /* 원하는 색으로 변경 */
  }
  .category-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .category-list li + li {
    margin-top: 0.75rem;
  }
  .category-list button {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.5rem;
    font-size: 1rem;
    color: #333;
    cursor: pointer;
  }
  .category-list button.active {
    background: #ffc93c;
    color: #fff;
    border-radius: 4px;
  }
  
  /* ── 메인 콘텐츠 ─────────────────────────────── */
  .main-content {
    flex: 1;
    padding: 2rem;
    background: #f9f9f9;
  }
  
/* ─── 배너 + 광고 영역 ───────────────────────── */
.banner-ads {
  display: flex;
  gap: 1rem;
  /* 원하는 전체 높이로 고정 */
  /* width: 1000px; */
  height: 300px;
  margin-bottom: 2rem;
}

/* 좌측 대표 배너 (2/3 차지) */
.highlight {
  flex: 2;
  height: 300px;
  background: #2b2b2b; /* 검정 배경으로 바뀐 예시 */
  border-radius: 12px;
  overflow: hidden;
}
.highlight-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

/* 우측 광고 컨테이너 (1/3 차지) */
.ads {
  flex: 1;
  height: 300px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 광고 카드: 높이를 남은 절반씩 차지하도록 */
.ad-card {
  flex: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  border-radius: 8px;
  /* padding: 1rem; */
  /* box-shadow: 0 0 6px rgba(0,0,0,0.05); */
}
.ad-img {

}
.ad-card p {
  margin: 0;
  font-size: 0.9rem;
  color: #333;
}
  
  /* 도서 리스트 */
  .book-list-section h3 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    color: #222;
  }
  .book-list-section hr {
    border: none;
    border-top: 1px solid #ddd;
    margin-bottom: 1.5rem;
  }
  .book-grid {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .book-item {
    width: 150px;
    text-align: center;
  }
  .book-item img {
    width: 100%;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  .book-item h4 {
    margin: 0;
    font-size: 1rem;
    color: #111;
  }
  .book-item .author {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #666;
  }
  </style>
  