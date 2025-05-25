<!-- src/views/Book/BookDetail.vue -->
<template>
    <div class="book-detail-page">
      <!-- 상단 헤더(라우팅, 네비 등 제외) -->
      <div class="detail-header">
        <!-- 책 커버 -->
        <div class="cover-placeholder"></div>
        <!-- 책 기본 정보 -->
        <div class="info">
          <!-- 배지 -->
          <div class="badges">
            <span class="badge badge-popular">인기 있는 도서</span>
            <span class="badge badge-theme">{{ book.themeLabel }}</span>
          </div>
          <!-- 제목 -->
          <h1 class="title">{{ book.title }}</h1>
          <!-- 작가명 -->
          <div class="author">(작가: {{ book.author }})</div>
          <!-- 액션 버튼 -->
          <div class="actions">
            <!-- 즐겨찾기 아이콘 (예시) -->
            <button class="btn icon-btn">
              📒
            </button>
            <!-- 좋아요 토글 아이콘 -->
            <button class="btn icon-btn like-btn" @click="toggleLike">
              <span v-if="liked">❤</span>
              <span v-else>🤍</span>
              <span class="like-count">{{ likeCount }}</span>
            </button>
          </div>
        </div>
      </div>
  
      <!-- 평점/통계 -->
      <div class="stats">
        <div class="star-rating">★ {{ book.rating.toFixed(1) }}</div>
        <div class="counts">
          <span class="count-item">작성된 감상평 {{ book.reviewCount }}</span>
          <span class="count-item">작성된 열린 결말 {{ book.endingCount }}</span>
        </div>
      </div>
  
      <!-- 줄거리 요약 -->
      <section class="summary">
        <h2>줄거리 요약</h2>
        <p>{{ book.summary }}</p>
      </section>
  
      <!-- Google TTS (회색 박스로 대체) -->
      <section class="tts-player">
        <div class="tts-placeholder">[Google TTS 플레이어 자리]</div>
      </section>
  
      <!-- 도서·작가 정보 -->
      <section class="author-info">
        <h2>도서 및 작가 정보</h2>
        <div class="info-grid">
          <div class="info-item"><strong>출판일</strong> {{ book.published }}</div>
          <div class="info-item"><strong>출판사</strong> {{ book.publisher }}</div>
        </div>
        <div class="author-bio">
          <div class="author-avatar"></div>
          <div class="bio-text">{{ book.authorBio }}</div>
        </div>
      </section>
  
      <!-- 추천 책 -->
      <section class="recommend">
        <h2>이런 책은 어떠세요?</h2>
        <div class="recommend-grid">
          <div
            v-for="rec in recommendations"
            :key="rec.id"
            class="rec-item"
          >
            <div class="rec-cover"></div>
            <div class="rec-title">{{ rec.title }}</div>
            <div class="rec-author">{{ rec.author }}</div>
          </div>
        </div>
      </section>
  
      <!-- 감상평 리스트 -->
      <section class="reviews">
        <h2>「{{ book.title }}」의 감상평({{ book.reviewCount }})</h2>
        <hr />
        <router-link
          v-for="rev in reviews"
          :key="rev.id"
          class="review-item"
          :to="{
            name: 'ReviewDetail',
            params: { bookId: book.id, reviewId: rev.id }
          }"
        >
          <h3 class="rev-title">“{{ rev.title }}” <small>- by. {{ rev.user }}</small></h3>
          <p class="rev-content">{{ rev.content }}</p>
          <div class="rev-actions">
            <button class="btn text-btn">❤ {{ rev.likes }}</button>
            <button class="btn text-btn">💬 {{ rev.comments }}</button>
          </div>
        </router-link>
        <!-- 페이징(간단 예시) -->
        <div class="pagination">
          <button class="page-btn">‹</button>
          <button class="page-btn">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">›</button>
        </div>
      </section>
  
      <!-- 열린 결말 리스트 -->
      <section class="endings">
        <h2>「{{ book.title }}」의 열린 결말({{ book.endingCount }})</h2>
        <hr />
        <router-link
          v-for="end in endings"
          :key="end.id"
          class="ending-item"
          :to="{
            name: 'EndingDetail',
            params: { bookId: book.id, endingId: end.id }
          }"
        >
          <h3 class="end-title">“{{ end.title }}” <small>- by. {{ end.user }}</small></h3>
          <p class="end-content">{{ end.content }}</p>
          <div class="end-actions">
            <button class="btn text-btn">❤ {{ end.likes }}</button>
            <button class="btn text-btn">💬 {{ end.comments }}</button>
          </div>
        </router-link>
        <div class="pagination">
          <button class="page-btn">‹</button>
          <button class="page-btn">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">›</button>
        </div>
      </section>
    </div>
    </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const bookId = route.params.id
  
  // 좋아요 상태
  const liked = ref(false)
  const likeCount = ref(0)
  function toggleLike() {
    liked.value = !liked.value
    likeCount.value += liked.value ? 1 : -1
  }
  
  // 상세 페이지 더미 데이터
  const book = ref({
    id: bookId,
    title: '7년의 밤',
    author: '정유정',
    rating: 4.5,
    reviewCount: 10,
    endingCount: 7,
    summary: '세월호 거대한 기억호수... (중략)',
    published: '2025.05.23',
    publisher: '은행나무',
    authorBio: '인간 내면의 어두운 본성과 심리적 균열을 사실적으로 그려내는 데 탁월한 한국의 대표 소설가입니다.',
    themeLabel: '소설/시/희곡',
  })
  // 페이지 로드시 초기 좋아요 갯수 설정
  onMounted(() => {
    likeCount.value = 0
  })
  
  // 추천 도서 더미
  const recommendations = ref([
    { id: 1, title: '종의 기원', author: '정유정' },
    { id: 2, title: '완전한 행복', author: '정유정' },
    { id: 3, title: '살인자의 기억법', author: '김영하' },
    { id: 4, title: '그녀는 다 계획이 있다', author: '이선미' },
    { id: 5, title: '체리새우 : 비밀글입니다', author: '이선미' },
    { id: 6, title: '절망의 구', author: '김이환' },
  ])
  
  // 감상평 더미
  const reviews = ref([
    { id: 1, title: '어둠을 통과한 소년, 빛을 선택하다', user: '호랭이 신싸피', content: '『7년의 밤』은 한 남자의... (중략)', likes: 4, comments: 2 },
    { id: 2, title: '무너진 세계에서 피어난 질문', user: '호랭이 천싸피', content: '『7년의 밤』은 한밤중...', likes: 4, comments: 2 },
    // … 총 10개
  ])
  
  // 열린 결말 더미
  const endings = ref([
    { id: 1, title: '호수는 모든 걸 기억하고 있었다', user: '호랭이 신싸피', content: '7년이 지난 후... (중략)' },
    { id: 2, title: '다시 쓰는 일곱 번째 봄', user: '호랭이 천싸피', content: '도망치듯 세월호를 떠난... (중략)' },
    // … 총 7개
  ])
  </script>
  
  <style scoped>
  .book-detail-page {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
    font-family: sans-serif;
    color: #333;
  }
  
  /* 상단 헤더 */
  .detail-header {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }
  .cover-placeholder {
    width: 200px;
    height: 300px;
    background: #eee;
    border-radius: 8px;
  }
  .info {
    flex: 1;
  }
  .badges {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.9rem;
    border: 1px solid #ffc93c;
  }
  .badge-popular {
    background: #ffc93c;
    color: #333;
  }
  .badge-theme {
    background: transparent;
    color: #444;
  }
  .title {
    margin: 0.25rem 0;
    font-size: 2rem;
  }
  .author {
    margin-bottom: 1rem;
    color: #666;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .btn.icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
  }
  .like-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .like-count {
    font-size: 1rem;
  }
  
  /* 평점/통계 */
  .stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  .star-rating {
    font-size: 1.5rem;
    color: #ffb400;
  }
  .counts {
    display: flex;
    gap: 1rem;
    color: #666;
  }
  
  /* 줄거리 */
  .summary {
    margin-bottom: 2rem;
  }
  .summary h2 {
    margin-bottom: 0.5rem;
  }
  
  /* TTS 플레이어 */
  .tts-player {
    margin-bottom: 2rem;
  }
  .tts-placeholder {
    height: 60px;
    background: #eee;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
  
  /* 작가 정보 */
  .author-info {
    margin-bottom: 2rem;
  }
  .info-grid {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
  }
  .info-item strong {
    width: 5rem;
    display: inline-block;
  }
  .author-bio {
    display: flex;
    gap: 1rem;
  }
  .author-avatar {
    width: 80px;
    height: 80px;
    background: #eee;
    border-radius: 50%;
  }
  .bio-text {
    flex: 1;
    color: #555;
  }
  
  /* 추천 책 */
  .recommend {
    margin-bottom: 2rem;
  }
  .recommend-grid {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    padding-bottom: 1rem;
  }
  .rec-item {
    min-width: 120px;
    text-align: center;
  }
  .rec-cover {
    width: 120px;
    height: 180px;
    background: #eee;
    border-radius: 4px;
    margin-bottom: 0.5rem;
  }
  .rec-title {
    font-size: 0.9rem;
    font-weight: bold;
  }
  .rec-author {
    font-size: 0.8rem;
    color: #666;
  }
  
  /* 감상평 & 열린결말 */
  .reviews, .endings {
    margin-bottom: 2rem;
  }
  .review-item, .ending-item {
    margin-bottom: 1.5rem;
  }
  .rev-title, .end-title {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
  }
  .rev-content, .end-content {
    margin: 0 0 0.5rem;
    color: #555;
  }
  .rev-actions {
    display: flex;
    gap: 1rem;
  }
  .btn.text-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }
  .page-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    color: #666;
  }
  .page-btn:hover {
    color: #333;
  }
  </style>
  