<!-- src/views/Review/EndingDetail.vue -->
<template>
    <div class="review-detail-page">

  <!-- 1) 배너 영역 (AI 생성 이미지 & 리뷰 제목 오버레이) -->
  <div class="banner-container" v-if="review">
    <div class="banner">
      <img :src="aiGeneratedBanner" alt="AI Generated Banner" class="banner-image" v-if="aiGeneratedBanner" />
      <div class="banner-placeholder" v-else></div> <!-- 실제 배너 이미지 없을 시 배경 -->
      <div class="banner-overlay-text">“{{ review.title }}”</div>
    </div>
  </div>

  <!-- 2) 메인 콘텐츠 영역 (2단 레이아웃) -->
  <div class="main-content-wrapper">
    <div class="main-content" v-if="review && book">
      <!-- 왼쪽 컬럼: 책 정보 -->
      <div class="book-info-column">
        <div class="book-info-container">
          <img :src="book.fields.cover" :alt="book.fields.title" class="book-cover-image" />
          <div class="book-details-text">
            <h2 class="book-title">{{ book.fields.title }}</h2>
            <p class="book-author">저자: {{ book.fields.author }}</p>
            <p class="book-pub-date">출판일: {{ book.fields.pub_date }}</p>
            <p class="book-publisher">출판사: {{ book.fields.publisher }}</p>
          </div>
        </div>
      </div>

      <!-- 오른쪽 컬럼: 리뷰 상세 -->
      <div class="review-details-column">
        <section class="review-meta-section">
          <h1>열린 결말</h1>
          <p class="meta">
            by <span @click="goToUserProfile(review.userId)" style="cursor: pointer; text-decoration: underline;">{{ review.user }}</span> · {{ review.date }}
            <span class="actions">
              <button @click="toggleReviewLike()" class="icon-button">
                <img :src="review.isLiked ? fullHeartIcon : emptyHeartIcon" alt="Like" class="action-icon" /> {{ review.likes }}
              </button>
              <button class="icon-button">
                <img :src="commentsIcon" alt="Comments" class="action-icon" /> {{ review.commentsCount }}
              </button>
            </span>
          </p>
        </section>

        <section class="review-body">
        <p>{{ review.content }}</p>
      </section>

      <section class="comments-section">
        <h2>댓글 ({{ comments.length }})</h2>
        <ul class="comment-list">
          <li v-for="c in comments" :key="c.id" class="comment-item">
            <p class="comment-text">{{ c.text }}</p>
            <div class="comment-meta">
              <div class="comment-author-date">
                <span class="comment-user">{{ c.user }}</span>
                <span class="comment-date">{{ c.date }}</span>
              </div>
              <div class="comment-actions">
                <button @click="toggleCommentLike(c)" class="icon-button">
                  <img :src="thumbsUpIcon" alt="Like comment" class="action-icon" /> {{ c.likes }}
                </button>
                <button @click="handleCommentDislike(c)" class="icon-button">
                  <img :src="thumbsDownIcon" alt="Dislike comment" class="action-icon" />
                </button>
              </div>
            </div>
          </li>
        </ul>

        <!-- 5) 댓글 입력창 -->
        <div class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="댓글을 입력하세요..."
            rows="3"
          ></textarea>
          <button class="btn-submit" @click="addComment">등록</button>
        </div>
      </section>
    </div> <!-- review-details-column 닫는 태그 -->
  </div> <!-- main-content 닫는 태그 -->
  </div> <!-- main-content-wrapper 닫는 태그 -->
</div> <!-- review-detail-page 닫는 태그 -->
</template>

<script setup>
  import { ref, onMounted, computed, getCurrentInstance } from 'vue'
  import { useRoute, useRouter } from 'vue-router' // useRouter 추가

  const app = getCurrentInstance();
  const $api = app.appContext.config.globalProperties.$api;

  import commentsIcon from '@/assets/icons/comments.png'
  import emptyHeartIcon from '@/assets/icons/empty_heart.png'
  import fullHeartIcon from '@/assets/icons/full_heart.png'
  import thumbsUpIcon from '@/assets/icons/thumbs_up.png'
  import thumbsDownIcon from '@/assets/icons/thumbs_down.png'

  const route = useRoute()
  const router = useRouter() // router 인스턴스 생성
  const endingId = parseInt(route.params.endingId || route.params.reviewId) // endingId 또는 reviewId 사용
  const bookIdFromRoute = parseInt(route.params.bookId)

  const aiGeneratedBanner = ref('')
  const isLoadingBook = ref(true);
  const isLoadingEnding = ref(true); // 열린결말 로딩 상태

  // 임시 전체 열린결말 목록 (추후 API 연동 시 제거)
  const allEndings = [
    { id: 1, userId: 'user789', bookId: 1, title: '호수는 모든 걸 기억하고 있었다', user: '호랭이 신싸피', date: '2025.05.20', likes: 10, commentsCount: 3, content: '7년이 지난 후, 세령호의 물안개가 걷히자 모든 비밀이 드러났다. 승환은 아버지의 그늘에서 벗어나 새로운 삶을 시작할 수 있을까, 아니면 과거의 악몽은 계속될 것인가. 독자의 상상에 맡겨진 결말은 깊은 여운을 남긴다.', isLiked: false },
    { id: 2, userId: 'user101', bookId: 1, title: '다시 쓰는 일곱 번째 봄', user: '호랭이 천싸피', date: '2025.05.22', likes: 8, commentsCount: 1, content: '도망치듯 세령호를 떠났던 승환은 7년 만에 돌아와 영제를 만난다. 두 사람의 만남은 과거의 상처를 치유하는 첫걸음이 될 수도, 혹은 또 다른 비극의 시작일 수도 있다. 작가는 명확한 답을 제시하지 않음으로써 독자에게 끊임없는 질문을 던진다.', isLiked: true },
    { id: 3, userId: 'userABC', bookId: 2, title: '다른 책에 대한 열린결말', user: '상상가 김싸피', date: '2025.05.24', likes: 3, commentsCount: 0, content: '이것은 다른 책(ID:2)에 대한 열린결말 예시입니다.', isLiked: false }
  ];

  const review = ref(null) // 열린결말 데이터를 담을 변수 (이름은 review 유지 또는 ending으로 변경 가능)
  const book = ref(null)

  const comments = ref([
    { id: 1, user: '사용자A', date: '2025.05.24', text: '정말 공감되는 해석이네요!', likes: 2, dislikes: 0, isLiked: false },
    { id: 2, user: '사용자B', date: '2025.05.25', text: '이 부분이 특히 마음에 들었습니다.', likes: 1, dislikes: 0, isLiked: false },
  ])

  const newComment = ref('')

  function goToUserProfile(userId) {
    if (userId) {
      router.push({ name: 'UserProfile', params: { userId: userId } }); // UserProfile 라우트의 파라미터 이름 확인 필요
    } else {
      console.error("Cannot navigate: userId is not available.");
    }
  }

  function toggleReviewLike() {
    if (review.value) {
      review.value.isLiked = !review.value.isLiked;
      review.value.likes += review.value.isLiked ? 1 : -1;
      // TODO: API로 열린결말 좋아요 상태 업데이트
    }
  }

  function toggleCommentLike(comment) {
    comment.isLiked = !comment.isLiked;
    comment.likes += comment.isLiked ? 1 : -1;
    // TODO: API로 댓글 좋아요 상태 업데이트
  }

  function handleCommentDislike(comment) {
    console.log('Disliked comment:', comment.id);
    // TODO: API로 댓글 싫어요 상태 업데이트 (필요시)
  }

  function addComment() {
    const text = newComment.value.trim()
    if (!text) return
    // TODO: API로 댓글 등록
    comments.value.push({
      id: Date.now(),
      user: '로그인 사용자',
      date: new Date().toISOString().slice(0, 10),
      text,
      likes: 0,
      dislikes: 0,
    })
    newComment.value = ''
  }

  async function fetchBookData() {
    if (bookIdFromRoute === null) {
      isLoadingBook.value = false;
      book.value = null;
      return;
    }
    isLoadingBook.value = true;
    try {
      const response = await $api.get(`books/${bookIdFromRoute}/`);
      book.value = { // API 응답이 BookSerializer 형식을 따른다고 가정
        pk: response.data.id,
        fields: response.data
      };
    } catch (error) {
      console.error("Error fetching book data for EndingDetail:", error);
      book.value = { pk: bookIdFromRoute, fields: { title: '책 정보를 찾을 수 없습니다.', author: '-', pub_date: '-', publisher: '-', cover: '' } };
    } finally {
      isLoadingBook.value = false;
    }
  }

  onMounted(async () => {
    await fetchBookData(); // 책 정보 먼저 로드

    // endingId와 bookIdFromRoute에 해당하는 열린결말 찾기 (기존 로직 유지, 추후 API 연동)
    const foundEnding = allEndings.find(e => e.id === endingId && e.bookId === bookIdFromRoute);
    if (foundEnding) {
      review.value = foundEnding; // review ref에 할당 (또는 ending ref 사용)
    } else {
      review.value = {
        id: endingId,
        userId: null, // userId 추가
        bookId: bookIdFromRoute,
        title: '열린 결말을 찾을 수 없습니다.',
        user: '-',
        date: '-',
        likes: 0,
        content: '요청하신 열린 결말 정보를 불러올 수 없습니다. URL을 확인해주세요.',
        commentsCount: 0
      };
    }
    isLoadingEnding.value = false;

    // 댓글 로직 (기존 유지, 추후 API 연동)
    if (review.value && review.value.id === 1) {
        comments.value = [
            { id: 1, user: '댓글러1', date: '2025.05.21', text: '흥미로운 결말 해석입니다!', likes: 3, dislikes: 0 },
        ];
    } else {
        comments.value = [];
    }
  })
  </script>

  <style scoped>
  .review-detail-page {
    font-family: 'Noto Sans KR', sans-serif;
    color: #333;
  }

  .banner-container {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    height: 280px;
    position: relative;
    background-color: #333;
  }
  .banner {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.6);
  }
  .banner-placeholder {
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right, #4a4a4a 0%, #2c2c2c 100%);
  }
  .banner-overlay-text {
    position: absolute;
    color: white;
    font-size: 2.4rem;
    font-weight: bold;
    text-align: center;
    padding: 0 2rem;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
    z-index: 10;
  }

  .main-content-wrapper {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 1rem;
    position: relative;
  }

  .main-content {
    display: flex;
    gap: 2.5rem;
    margin-top: -80px;
    position: relative;
    z-index: 5;
  }

  .book-info-column {
    width: 260px;
    flex-shrink: 0;
    position: relative;
    z-index: 20;
  }

  .book-info-container {
    background-color: #333a4093;
    color: #fff;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  }

  .book-cover-image {
    display: block;
    width: 180px;
    height: auto;
    border-radius: 6px;
    margin: 0 auto 1.5rem auto;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  .book-details-text {
    text-align: left;
  }

  .book-title {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  .book-author,
  .book-pub-date,
  .book-publisher {
    font-size: 0.85rem;
    line-height: 1.5;
    margin-bottom: 0.4rem;
    color: #e0e0e0;
  }
  .book-publisher {
    margin-bottom: 0;
  }

  .review-details-column {
    flex-grow: 1;
    padding-top: 90px;
  }

  .review-meta-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .meta {
    font-size: 0.95rem;
    color: #555;
    display: flex;
    align-items: center;
  }
  .meta .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  .meta button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.9rem;
    color: #555;
    margin-left: 0.75rem;
    display: flex;
    align-items: center;
  }
  .meta button:hover {
    color: #ff6b6b;
  }
  .action-icon {
    width: 18px;
    height: 18px;
    margin-right: 4px;
    vertical-align: middle;
  }
  .icon-button {
    display: inline-flex;
    align-items: center;
    padding: 4px 6px;
  }

  .review-body {
    line-height: 1.6;
    margin-bottom: 2.5rem;
  }

  .comments-section {
    border-top: 1px solid #ddd;
    padding-top: 1.5rem;
  }
  .comment-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }
  .comment-item {
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  .comment-text {
    margin: 0 0 0.75rem 0;
  }
  .comment-meta {
    font-size: 0.85rem;
    color: #555;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .comment-author-date span {
    margin-right: 1rem;
  }
  .comment-actions button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
    color: #555;
  }
  .comment-meta button:hover {
    color: #007bff;
  }
  .comment-meta .action-icon {
    width: 16px;
    height: 16px;
  }

  .comment-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .comment-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }
  .btn-submit {
    align-self: flex-end;
    padding: 0.5rem 1rem;
    background: #ffc93c;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;
  }
  </style>
