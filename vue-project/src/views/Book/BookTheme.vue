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
  import { ref, computed, onMounted, getCurrentInstance } from 'vue' // getCurrentInstance, onMounted 추가
  import { useRoute, useRouter } from 'vue-router'
  import banner1 from '@/assets/banner1.jpg'
  import ad1 from '@/assets/ad1.png'
  import ad2 from '@/assets/ad2.jpg'
  // import booksData from '@/data/books.json' // 삭제
  // import categoriesData from '@/data/categories.json' // 삭제

  const app = getCurrentInstance();
  const $api = app.appContext.config.globalProperties.$api;

  const route = useRoute()
  const router = useRouter()

  const allBooksFromApi = ref([]);
  const allCategoriesFromApi = ref([]); // API로부터 모든 카테고리 (중복 제거된)
  const isLoading = ref(true);

  // categories.json의 첫번째 pk를 기본값으로 사용하거나, 0번 카테고리(전체)가 있다면 그것을 사용
  // API 로드 후 defaultCategoryId 결정 필요
  const defaultCategoryId = computed(() => {
    const 전체카테고리 = allCategoriesFromApi.value.find(c => c.id === 0);
    return 전체카테고리 ? 0 : (allCategoriesFromApi.value[0]?.id || 1);
  });
  const currentId = computed(() => Number(route.params.id) || defaultCategoryId.value)
  const search = ref('')

  // 카테고리 목록 (API 데이터 기반, "전체" 탭 포함)
  const themes = computed(() => {
    return allCategoriesFromApi.value; // "전체" 탭을 포함하여 모든 카테고리 표시
  });

  // 현재 선택된 테마 정보 (API 데이터 기반)
  const currentTheme = computed(() => {
    if (currentId.value === 0) {
      // "전체" 탭 선택 시 메인 콘텐츠 제목을 "전체 도서"로 설정
      return { id: 0, label: '전체 도서', name: '전체', description: '모든 도서를 확인하세요.', image: `https://via.placeholder.com/600x300?text=전체도서` };
    }
    // themes에서 id가 0인 "전체"는 사이드바에만 표시되고, 실제 테마 필터링에는 사용되지 않음.
    // 따라서 themes.value.find는 id가 0이 아닌 실제 카테고리만 찾게 됨.
    // allCategoriesFromApi에서 직접 찾아야 currentId.value가 0일 때도 올바른 테마 정보를 가져올 수 있음.
    // 하지만 위에서 currentId.value === 0인 경우를 이미 처리했으므로, 여기서는 0이 아닌 경우만 고려.
    const foundTheme = allCategoriesFromApi.value.find((t) => t.id === currentId.value);
    return foundTheme || (allCategoriesFromApi.value.length > 0 ? allCategoriesFromApi.value[0] : { id: defaultCategoryId.value, label: '카테고리 없음', name: '카테고리 없음', description: '', image: ''});
  });

  // 필터링 및 검색된 도서 목록 (API 데이터 기반)
  const books = computed(() => {
    let filteredBooks = [];
    if (currentId.value === 0) { // "전체" 카테고리 선택 시
      filteredBooks = allBooksFromApi.value.map(book => ({
        id: book.id,
        cover: book.cover,
        title: book.title,
        author: book.author,
        category: book.category // category 객체 전체를 유지하거나, id만 필요하면 book.category.id
      }));
    } else {
      filteredBooks = allBooksFromApi.value
        .filter(book => book.category && book.category.id === currentId.value)
        .map(book => ({
          id: book.id,
          cover: book.cover,
          title: book.title,
          author: book.author,
          category: book.category
        }));
    }

    if (search.value) {
      const searchTerm = search.value.toLowerCase()
      return filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
      );
    }
    return filteredBooks;
  });

  function goTheme(id) {
    router.push({ name: 'BookTheme', params: { id: id } });
  }

  onMounted(async () => {
    isLoading.value = true;
    try {
      const response = await $api.get('books/');
      allBooksFromApi.value = response.data;

      // 카테고리 데이터 추출 및 가공 (HomePage.vue와 유사하게)
      const uniqueCategories = new Map();
      const categoriesFromBooks = new Map();
      allBooksFromApi.value.forEach(book => {
        if (book.category) {
          if (!categoriesFromBooks.has(book.category.id)) {
            categoriesFromBooks.set(book.category.id, {
              id: book.category.id,
              label: book.category.name, // 사이드바 표시용
              name: book.category.name,  // currentTheme 제목용
              pk: book.category.id
            });
          }
        }
      });

      const pkOrder = [1, 2, 3, 4, 5, 6, 7];
      let sortedApiCategories = Array.from(categoriesFromBooks.values())
        .sort((a, b) => {
          const indexA = pkOrder.indexOf(a.pk);
          const indexB = pkOrder.indexOf(b.pk);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

      // "전체" 탭을 맨 앞에 추가
      allCategoriesFromApi.value = [
        { id: 0, label: '전체', name: '전체 도서' }, // 사이드바용 label, currentTheme용 name
        ...sortedApiCategories
      ];

    } catch (error) {
      console.error("Error fetching data for BookTheme:", error);
    } finally {
      isLoading.value = false;
    }
  });
  </script>

<style scoped>
.book-theme-page {
  display: flex;
  min-height: 100vh;
}
  /* ── 사이드바 ───────────────────────────────── */
  .sidebar {
    width: 240px;
    padding: 0 1rem 2rem 1rem; /* padding-top 제거 */
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
    padding: 0 2rem 2rem 2rem; /* padding-top 제거 */
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
  margin-top: 30px;
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
