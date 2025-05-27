<!-- src/views/HomePage.vue -->
<template>
  <div class="home-page">
    <div class="sections-wrapper" ref="wrapper">

      <!-- 섹션1: Hero -->
      <section id="section1" class="section hero">
        <div class="hero-content">
          <img
            class="hero-image"
            :src="heroIllustration"
            alt="hero illustration"
          />
          <div class="hero-text">
            <h1>당신의 서재는 지금 몇 도인가요?</h1>
            <p>
              AI가 당신의 감성과 취향을 이해하고 가장 어울리는 책 두 권을 추천해드립니다.<br />
              ‘선호 도서 카테고리’와 당신만의 독서 패턴을 분석한 ‘내 알고리즘’을<br />
              바탕으로 지금의 당신에게 가장 필요한 책을 연결해드려요.<br />
              지금, 당신만의 서재 온도를 확인해보세요.
            </p>
            <button class="btn-primary" @click="$router.push('/recommend')">
              바로가기
            </button>
          </div>
        </div>
        <div class="scroll-indicator" @click="scrollTo('section2')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16.5L6 10.5L7.41 9.09L12 13.67L16.59 9.09L18 10.5L12 16.5Z" fill="black"/>
          </svg>
        </div>
      </section>

      <!-- 섹션2: 테마별 도서 + 베스트셀러 -->
      <section id="section2" class="section theme-best">
        <div class="theme-grid">
          <h2 class="section-title">테마별 도서</h2>
          <div class="theme-items-container">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="theme-item"
              @click="$router.push(`/theme/${cat.id}`)"
            >
              <img :src="getCategoryIcon(cat.icon)" :alt="cat.name" class="theme-icon" v-if="cat.icon" />
              <span>{{ cat.name }}</span>
            </div>
          </div>
        </div>

        <section class="best-seller">
          <h2 class="section-title">베스트 셀러</h2>
          <div class="best-seller-carousel-wrapper">
            <div class="books" :style="{ transform: `translateX(-${currentSlide * (180 + 24)}px)` }">
              <div
                class="book-card"
                v-for="book_item in bestSellers"
                :key="book_item.id"
                @click="$router.push(`/books/${book_item.id}`)"
              >
                <img
                  :src="book_item.cover"
                  :alt="book_item.title + ' cover'"
                  class="book-thumb"
                />
                <div class="book-info-wrapper">
                  <div class="book-title">{{ book_item.title }}</div>
                  <div class="book-author">{{ book_item.author }}</div>
                </div>
              </div>
            </div>
            <button @click="prevSlide" class="carousel-btn prev-btn">‹</button>
            <button @click="nextSlide" class="carousel-btn next-btn">›</button>
          </div>
        </section>

        <div class="scroll-arrow" @click="scrollTo('section3')">▼</div>
      </section>

      <!-- 섹션3: 인기 감상평 + 인기 열린결말 -->
      <section id="section3" class="section popular">

        <!-- 3.1) 인기 감상평 -->
        <div class="popular-block">
          <div class="popular-content">
            <!-- 좌측 텍스트 -->
            <div class="popular-info">
              <span class="overlay-text">Hot</span>
              <h2 class="heading">인기 감상평</h2>
              <p class="subheading">
                지금 가장 인기 있는 감상평을 만나보세요!<br />
                독자들이 사랑한 생생한 리뷰를 한눈에 확인할 수 있습니다.
              </p>
              <div class="dots">
                <span class="dot active"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
            <!-- 우측 카드 -->
            <div class="popular-cards">
              <div
                class="card"
                v-for="review in popularReviews"
                :key="review.id"
              >
                <img
                  :src="review.img"
                  alt="카테고리"
                  class="card-badge"
                />
                <h3 class="quote">“{{ review.title }}”</h3>
                <p class="text">{{ review.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 3.2) 인기 열린결말 -->
        <div class="popular-block">
          <div class="popular-content">
            <div class="popular-info">
              <span class="overlay-text">Popular</span>
              <h2 class="heading">인기 열린결말</h2>
              <p class="subheading">
                여운을 남기는 열린 결말,<br />
                당신의 해석은 무엇인가요? 다양한 시선의 감상평을 확인해보세요.
              </p>
              <div class="dots">
                <span class="dot"></span>
                <span class="dot active"></span>
                <span class="dot"></span>
              </div>
            </div>
            <div class="popular-cards">
              <div
                class="card"
                v-for="ending in popularEndings"
                :key="ending.id"
              >
                <img
                  :src="ending.img"
                  alt="카테고리"
                  class="card-badge"
                />
                <h3 class="quote">“{{ ending.title }}”</h3>
                <p class="text">{{ ending.text }}</p>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue' // getCurrentInstance, onMounted, onUnmounted 추가
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Hero 일러스트
import heroIllustration from '@/assets/hero-illustration.png'

// API 클라이언트 가져오기
const app = getCurrentInstance();
const $api = app.appContext.config.globalProperties.$api;

// 데이터 저장을 위한 ref
const allBooks = ref([]);
const categories = ref([]);

// 카드 원형 뱃지 (예시; 실제 써야할 asset import)
import novelCircle      from '@/assets/circles/novel_circle.png'
import selfCircle       from '@/assets/circles/self_circle.png'
import kidsCircle       from '@/assets/circles/kids_circle.png'
import businessCircle   from '@/assets/circles/business_circle.png'
import humanitiesCircle from '@/assets/circles/humanities_circle.png'
import scienceCircle    from '@/assets/circles/science_circle.png'

const router     = useRouter()
const wrapper    = ref(null)
const userStore  = useUserStore()
const isLoggedIn = computed(() => userStore.isLoggedIn)

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
function logout() {
  userStore.logout()
  router.push('/')
}

// 1) 카테고리 아이콘 매핑
const categoryIconMap = {
  '소설/시/희곡': 'novel.png',
  '경제/경영': 'business.png',
  '자기계발': 'self.png',
  '인문/교양': 'humanities.png',
  '취미/실용': 'hobby.png',
  '어린이/청소년': 'kids.png',
  '과학': 'science.png',
  // 추가 카테고리가 있다면 여기에 매핑
};

// 카테고리 아이콘 경로를 반환하는 함수
function getCategoryIcon(iconFilename) {
  if (!iconFilename) return '';
  try {
    return `/src/assets/icons/${iconFilename}`;
  } catch (e) {
    console.warn(`Icon not found: ${iconFilename}`);
    return '';
  }
}

// 2) 베스트셀러 계산 (API로부터 allBooks 데이터가 로드된 후 계산됨)
const bestSellers = computed(() => {
  return [...allBooks.value] // 원본 배열 수정을 피하기 위해 복사본 사용
    .sort((a, b) => b.customer_review_rank - a.customer_review_rank)
    .slice(0, 20)
    .map(item => ({ // 필요한 필드만 매핑 (API 응답 구조에 맞게)
      id:     item.id,
      title:  item.title,
      author: item.author,
      cover:  item.cover
    }));
});

const currentSlide = ref(0);
const slideInterval = ref(null);
const totalSlides = computed(() => bestSellers.value.length);

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % totalSlides.value;
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + totalSlides.value) % totalSlides.value;
}

function startSlideShow() {
  stopSlideShow(); // 기존 인터벌이 있다면 중지
  if (bestSellers.value.length > 0) { // 책이 로드된 후에만 슬라이드쇼 시작
    slideInterval.value = setInterval(nextSlide, 2000);
  }
}

function stopSlideShow() {
  clearInterval(slideInterval.value);
  slideInterval.value = null;
}

onMounted(async () => {
  try {
    const response = await $api.get('books/'); // API 호출 (baseURL에 /api가 있으므로 'books/')
    allBooks.value = response.data;

    // 카테고리 데이터 추출 및 가공
    const uniqueCategories = new Map();
    allBooks.value.forEach(book => {
      if (book.category && book.category.id !== 0) { // "전체" 카테고리(id:0) 제외 가정
        if (!uniqueCategories.has(book.category.id)) {
          uniqueCategories.set(book.category.id, {
            id:   book.category.id,
            name: book.category.name,
            icon: categoryIconMap[book.category.name] || '',
            pk: book.category.id // 정렬을 위해 pk 값(id와 동일)을 저장
          });
        }
      }
    });

    // 카테고리들을 pk 순서로 정렬
    const pkOrder = [1, 2, 3, 4, 5, 6, 7];
    categories.value = Array.from(uniqueCategories.values())
      .sort((a, b) => {
        const indexA = pkOrder.indexOf(a.pk);
        const indexB = pkOrder.indexOf(b.pk);
        // pkOrder에 없는 pk는 뒤로 보냄
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });

    startSlideShow(); // 데이터 로드 후 슬라이드쇼 시작
  } catch (error) {
    console.error("Error fetching books data:", error);
  }
});

onUnmounted(() => {
  stopSlideShow();
});


// 3) 인기 감상평 더미
const popularReviews = [
  { id:1, img: novelCircle,      title:'마음에 남는 이야기', text:'섬세한 문장과 깊은 여운이 어우러진 작품입니다.' },
  { id:2, img: selfCircle,       title:'놀라운 일상',       text:'작지만 강한 변화가 필요할 때 추천하고 싶어요.' },
  { id:3, img: kidsCircle,       title:'따뜻한 이야기',     text:'어린이도 공감할 수 있고, 어른도 돌아보게 만드는 이야기예요.' },
]

// 4) 인기 열린결말 더미
const popularEndings = [
  { id:1, img: businessCircle,   title:'어느 봄날의 약속',        text:'만남 이후 펼쳐질 이야기를 상상하게 하는 열린 결말.' },
  { id:2, img: humanitiesCircle, title:'당신의 선택은 계속된다', text:'마지막 문장이 큰 울림을 주는 작품입니다.' },
  { id:3, img: scienceCircle,    title:'시간이 멈춘 학교',        text:'판타지와 현실을 넘나드는 흥미로운 결말.' },
]
</script>

<style scoped>
.home-page {
  position: relative;
  /* height: 100vh; */ /* App.vue에서 스크롤을 관리하므로 제거 */
  /* overflow: hidden; */ /* App.vue에서 스크롤을 관리하므로 제거 */
}

/* 스크롤 스냅 */
.sections-wrapper {
  /* App.vue에서 스크롤을 관리하므로 이 요소의 스크롤 관련 스타일은 제거 */
}
.section {
  position: relative;
  min-height: 100vh; /* 최소 높이를 뷰포트로 설정하고 내용은 auto로 */
  height: auto;
  scroll-snap-align: start; /* App.vue의 스크롤 컨테이너에 스냅되도록 */
  display: flex; /* 내부 컨텐츠 정렬을 위해 flex 사용 고려 */
  flex-direction: column;
  justify-content: center; /* 기본적으로 중앙 정렬, 필요시 섹션별로 조정 */
  padding-top: 0; /* Navbar 높이만큼의 패딩은 App.vue에서 관리 */
  /* padding-top: 4rem; */ /* Navbar 높이를 고려한 패딩이었으나, App.vue에서 동적으로 관리하므로 여기서는 0 또는 제거 */
  box-sizing: border-box;
}

/* Hero */
.hero {
  background: #FFD460; /* 두번째 이미지 배경색과 유사하게 변경 */
  display: flex;
  flex-direction: column; /* 컨텐츠와 스크롤 인디케이터 수직 정렬 */
  align-items: center;
  justify-content: center;
  text-align: left; /* 텍스트 왼쪽 정렬 */
}
.hero-content {
  display: flex;
  align-items: center;
  justify-content: center; /* 중앙 정렬로 변경 */
  gap: 5%; /* 이미지와 텍스트 사이 간격 */
  width: 100%;
  max-width: 1100px; /* 콘텐츠 최대 너비 조정 */
  margin: 0 auto;
  padding: 0 5%; /* 좌우 패딩 조정 */
}
.hero-image {
  width: clamp(350px, 40vw, 500px); /* 이미지 크기 조정 */
  height: auto;
  order: 1; /* 이미지 먼저 나오도록 */
}
.hero-text {
  order: 2; /* 텍스트 나중에 나오도록 */
  flex-basis: 60%; /* 텍스트 영역 너비 조정 */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 텍스트 왼쪽 정렬 */
}
.hero-text h1 {
  font-size: 2.8rem; /* 폰트 크기 조정 */
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1E1E1E; /* 텍스트 색상 변경 */
  line-height: 1.3;
}
.hero-text p {
  font-size: 1rem; /* 폰트 크기 조정 */
  line-height: 1.8;
  margin-bottom: 2.5rem;
  color: #4A4A4A; /* 텍스트 색상 변경 */
}
.btn-primary {
  padding: 0.8rem 2rem; /* 패딩 조정 */
  background: #333333; /* 버튼 배경색 변경 */
  color: #FFFFFF; /* 버튼 텍스트색 변경 */
  border-radius: 25px; /* 버튼 모서리 둥글게 */
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}
.btn-primary:hover {
  background: #555555; /* 호버 시 배경색 변경 */
}

/* Scroll indicator */
.scroll-indicator {
  position: absolute;
  bottom: 3rem; /* 위치 조정 */
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 2s infinite;
}
.scroll-indicator svg path {
  fill: #333333; /* 아이콘 색상 변경 */
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}


/* 섹션2: 테마별 도서 + 베스트셀러 */
.theme-best {
  padding: 1rem 2rem; /* 상단 패딩을 줄여서 Hero 섹션과의 간격 조정 */
  background-color: #FFF9EA;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 컨텐츠를 수직 중앙에 가깝게 */
  gap: 3rem; /* 간격 조정 */
}

.theme-grid {
  text-align: left; /* 제목 왼쪽 정렬 */
  max-width: 1100px;
  margin: 0 auto;
  width:100%;
}
.section-title { /* 공통 섹션 제목 스타일 */
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 2.5rem;
  color: #333;
  padding-left: 1rem;
  border-left: 4px solid #FFC107; /* 제목 왼쪽에 강조선 */
}
.theme-items-container { /* 테마 아이템들을 감싸는 컨테이너 추가 */
  display: flex;
  flex-wrap: wrap; /* 작은 화면에서 줄바꿈 */
  justify-content: center; /* 중앙 정렬 */
  gap: 1.5rem; /* 아이템 간 간격 */
}
.theme-item {
  width: 130px; /* 크기 약간 증가 */
  height: 130px;
  background: #ffffff;
  border-radius: 12px; /* 좀 더 부드러운 모서리 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column; /* 아이콘과 텍스트 수직 정렬 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* 그림자 개선 */
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  font-size: 0.9rem; /* 텍스트 크기 약간 줄임 */
  font-weight: 500;
  color: #495057;
  border: 1px solid #e9ecef;
  padding: 0.5rem; /* 내부 패딩 추가 */
  text-align: center; /* 텍스트 중앙 정렬 */
}
.theme-item:hover {
  transform: translateY(-5px) scale(1.03); /* 호버 효과 */
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  color: #007bff; /* 호버 시 텍스트 색상 변경 (예시) */
}
.theme-icon {
  width: 48px; /* 아이콘 크기 */
  height: 48px;
  margin-bottom: 0.75rem; /* 아이콘과 텍스트 간격 */
  object-fit: contain; /* 아이콘 비율 유지 */
}

.best-seller {
  text-align: left;
  max-width: 1100px;
  margin: 0 auto;
  width:100%;
  position: relative; /* 버튼 위치를 위해 */
}

.best-seller-carousel-wrapper {
  overflow: hidden; /* 중요: 슬라이드 영역 밖의 책들을 숨김 */
  position: relative;
}

.best-seller .books {
  display: flex; /* 가로로 나열 */
  transition: transform 0.5s ease-in-out; /* 부드러운 슬라이드 효과 */
}
.book-card {
  /* background: #fff; */ /* 카드 배경 제거 */
  /* border-radius: 8px; */ /* 카드 테두리 둥글게 제거 */
  /* box-shadow: 0 2px 6px rgba(0,0,0,0.06); */ /* 카드 그림자 제거 */
  cursor: pointer;
  transition: transform 0.2s ease; /* 호버 시 그림자 효과는 제거 */
  overflow: visible; /* 내부 요소가 넘칠 수 있도록 (필요시) */
  display: flex;
  flex-direction: column;
  align-items: center; /* 내부 요소들 가운데 정렬 */
  width: 180px; /* 책 아이템 너비 고정 */
  flex-shrink: 0;
  margin-right: 1.5rem;
}
.book-card:hover {
  transform: translateY(-4px);
  /* box-shadow: 0 4px 10px rgba(0,0,0,0.1); */ /* 호버 시 그림자 제거 */
}
.book-thumb {
  width: 100%; /* 너비 100% 유지 */
  height: 260px; /* 이미지 높이 약간 늘림 */
  object-fit: cover;
  border-radius: 4px; /* 이미지 자체에 약간의 둥근 모서리 */
  margin-bottom: 0.75rem; /* 이미지와 텍스트 사이 간격 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* 이미지에 약간의 그림자 */
}
.book-info-wrapper {
  padding: 0.5rem 0; /* 상하 패딩, 좌우 패딩 제거 */
  text-align: center; /* 텍스트 가운데 정렬 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.book-title {
  font-size: 0.95rem; /* 제목 크기 약간 줄임 */
  font-weight: 600;
  color: #343a40;
  margin-bottom: 0.25rem;
  line-height: 1.3;
    /* 여러 줄 말줄임 (필요시) */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.4em; /* 2줄 높이 확보 (폰트 크기 따라 조정) */
}
.book-author {
  font-size: 0.8rem; /* 폰트 크기 약간 줄임 */
  color: #6c757d;
  /* padding: 0 1rem 1rem; 제거하고 book-info-wrapper에서 관리 */
  text-align: center; /* 가운데 정렬 유지 */
  white-space: nowrap; /* 한 줄로 표시 강제 */
  overflow: hidden; /* 넘치는 내용 숨김 */
  text-overflow: ellipsis; /* 말줄임표 적용 */
  width: 100%; /* 부모 요소 너비에 맞춤 */
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.7);
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  color: #333;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.carousel-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}
.prev-btn {
  left: -20px; /* 위치 조정 */
}
.next-btn {
  right: -20px; /* 위치 조정 */
}


/* 섹션3 */
.popular {
  background: #fff;
  padding: 3rem 5%; /* 패딩 조정 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 컨텐츠를 수직 중앙에 가깝게 */
  gap: 3rem; /* 인기 감상평과 열린결말 사이 간격 */
}
.popular-block { position: relative; /* margin-top: 5rem; */ } /* 상단 마진은 .popular의 gap으로 관리 */
.popular-content {
  display: flex; align-items: flex-start; justify-content: space-between;
}
.popular-info { width: 25%; position: relative; }
.overlay-text {
  position: absolute; top: -50px; left: 0;
  font-size: 6rem; font-weight: bold;
  color: transparent;
  -webkit-text-stroke-width: 0.5px;
  -webkit-text-stroke-color: rgb(255,153,0);
  z-index: 0;
}
.heading {
  font-size: 3rem; margin-bottom: .5rem; z-index:1;
  padding-left: .5rem;
}
.subheading {
  color: #666; font-size: .95rem; margin-bottom: 1.5rem; z-index:1;
}
.dots { display: flex; margin-top: 1rem; z-index:1; }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #ddd; margin-right: 8px; z-index:1;
}
.dot.active { background: #333; }

.popular-cards {
  width: 70%; display: flex; gap: 2rem; justify-content: space-between;
}
.card {
  flex: 2; background: #fff; padding: 2rem; border-radius: 3rem;
  box-shadow: 0 0 6px rgba(0,0,0,0.1); text-align: left;
  transition: transform .3s ease, box-shadow .3s ease;
  z-index:1;
}
.card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.card-badge {
  display: block; width: 50px; height: 50px; margin-bottom: 1rem;
  object-fit: cover;
}
.quote { font-size: 1.25rem; margin-bottom: .5rem; }
.text { color: #333; line-height: 1.4; }
</style>
