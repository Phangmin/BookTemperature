<!-- src/views/Review/ReviewDetail.vue -->
<template>
  <div class="review-detail-page">
    <div v-if="isLoadingReview || isLoadingBook || isLoadingAiImage" class="loading-placeholder">
      <p>데이터를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!review || !review.id" class="error-placeholder">
      <p>감상평을 찾을 수 없습니다. URL을 확인해주세요.</p>
      <router-link :to="{ name: 'BookDetail', params: { id: bookIdFromRoute } }" v-if="bookIdFromRoute">도서 상세로 돌아가기</router-link>
      <router-link to="/" v-else>홈으로 돌아가기</router-link>
    </div>
    <div v-else>
      <div class="banner-container">
        <div class="banner">
          <img :src="bannerImageUrl" alt="Review Banner" class="banner-image" v-if="bannerImageUrl" />
          <div class="banner-placeholder" v-else>배너 이미지가 없거나 AI 이미지 생성 중입니다.</div>
          <div class="banner-overlay-text">“{{ review.title }}”</div>
        </div>
      </div>

      <div class="main-content-wrapper">
        <div class="main-content" v-if="book">
          <div class="book-info-column"> {/* router-link 제거 */}
            <div class="book-info-container" @click="navigateToBookDetail(book.id)">
              <img :src="book.cover" :alt="book.title" class="book-cover-image" v-if="book.cover"/>
              <div class="book-cover-placeholder" v-else>표지 없음</div>
              <div class="book-details-text">
                <h2 class="book-title">{{ book.title }}</h2>
                <p class="book-author">저자: {{ book.author }}</p>
                <p class="book-pub-date">출판일: {{ book.pub_date }}</p>
                <p class="book-publisher">출판사: {{ book.publisher }}</p>
              </div>
            </div>
          </div>

          <div class="review-details-column">
            <section class="review-meta-section">
              <h1>감상평</h1>
              <p class="meta">
                by <span @click="goToUserProfile(review.user?.id)" style="cursor: pointer; text-decoration: underline;">{{ review.user?.nickname || review.user?.username }}</span> · {{ formatDate(review.created_at) }}
                <span class="actions">
                  <button @click="toggleReviewLikeApi" class="icon-button">
                    <img :src="review.is_liked_by_user ? fullHeartIcon : emptyHeartIcon" alt="Like" class="action-icon" /> {{ review.likes_count || 0 }}
                  </button>
                  <button class="icon-button">
                    <img :src="commentsIcon" alt="Comments" class="action-icon" /> {{ comments.length }}
                  </button>
                </span>
              </p>
            </section>

            <section class="review-body">
              <p>{{ review.content }}</p>
            </section>

            <!-- <div class="review-actions-footer" v-if="isAuthor"> -->
              <button class="btn btn-edit" @click="editMyReview">수정</button>
              <button class="btn btn-delete" @click="deleteMyReview">삭제</button>
            <!-- </div> -->

            <section class="comments-section">
              <h2>댓글 ({{ comments.length }})</h2>
              <!-- 댓글 목록 -->
              <div v-if="isLoadingComments" class="loading-comments">
                <p>댓글을 불러오는 중입니다...</p>
              </div>
              <div v-else-if="comments.length === 0 && !isLoadingComments" class="no-comments">
                <p>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
              </div>
              <ul v-else class="comment-list">
                <li v-for="comment in comments" :key="comment.id" class="comment-item">
                  <div class="comment-author">
                    <span @click="goToUserProfile(comment.user?.id)" style="cursor: pointer; font-weight: bold;">
                      {{ comment.user?.nickname || comment.user?.username || '익명 사용자' }}
                    </span>
                    <span class="comment-date">· {{ formatDate(comment.created_at) }}</span>
                  </div>
                  <p class="comment-content">{{ comment.content }}</p>
                  <!-- TODO: 댓글 좋아요, 수정, 삭제 기능은 추후 추가 -->
                </li>
              </ul>

              <!-- 댓글 입력 폼: 댓글 목록과 독립적으로 위치하도록 수정 -->
              <div v-if="loggedInUser" class="comment-form">
                <textarea v-model="newCommentText" placeholder="댓글을 입력하세요..." rows="3"></textarea>
                <button @click="submitComment" class="btn-submit-comment">댓글 작성</button>
              </div>
              <div v-else class="comment-login-prompt">
                <p>댓글을 작성하려면 <router-link :to="{ name: 'LoginPage' }">로그인</router-link>이 필요합니다.</p>
              </div>

            </section>
          </div>
        </div>
      </div>
    </div>
    <!-- 수정 모달 제거됨 -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const app = getCurrentInstance();
const $api = app.appContext.config.globalProperties.$api;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const reviewId = parseInt(route.params.reviewId);
const bookIdFromRoute = parseInt(route.params.bookId);

const review = ref(null);
const book = ref(null);
const comments = ref([]); // 댓글 목록
const newCommentText = ref(''); // 새 댓글 내용
const isLoadingReview = ref(true);
const isLoadingBook = ref(true);
const isLoadingAiImage = ref(false);
const isLoadingComments = ref(false); // 댓글 로딩 상태

import commentsIcon from '@/assets/icons/comments.png';
import emptyHeartIcon from '@/assets/icons/empty_heart.png';
import fullHeartIcon from '@/assets/icons/full_heart.png';

const loggedInUser = computed(() => userStore.user);
const isAuthor = computed(() => {
  return !!(review.value && loggedInUser.value && review.value.user?.id === loggedInUser.value?.id);
});

const djangoBaseUrl = 'http://127.0.0.1:8000';

const bannerImageUrl = computed(() => {
  if (review.value && review.value.cover_img) {
    let path = review.value.cover_img.replace(/\\/g, '/'); // ← 역슬래시 → 슬래시 변환

    if (path.startsWith('http')) {
      return path;
    } else if (path.startsWith('/media/')) {
      return `${djangoBaseUrl}${path}`;
    } else if (path.startsWith('media/')) {
      return `${djangoBaseUrl}/${path}`;
    }
    return `${djangoBaseUrl}/media/${path}`;
  }
  return '';
});


function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function fetchReviewDetail() {
  isLoadingReview.value = true;
  isLoadingBook.value = true;
  try {
    const response = await $api.get(`/books/${bookIdFromRoute}/thread/${reviewId}/`);
    review.value = response.data;

    let bookIdToFetch = bookIdFromRoute;
    if (review.value && review.value.book && typeof review.value.book === 'number') {
      bookIdToFetch = review.value.book;
    } else if (review.value && review.value.book && typeof review.value.book === 'object') {
      book.value = review.value.book;
      isLoadingBook.value = false;
    }

    if (isLoadingBook.value && bookIdToFetch) {
        await fetchBookData(bookIdToFetch);
    } else if (!bookIdToFetch) {
        isLoadingBook.value = false;
    }

    // 감상평 상세 정보 로드 성공 시 댓글 목록 가져오기
    if (review.value && review.value.id) {
      await fetchComments(review.value.id); // 이전에 fetchComments(review.value.id) 였으나, reviewId가 더 명확
    }
    // AI 배너 이미지는 bannerImageUrl computed property가 처리하므로 별도 함수 호출 불필요
  } catch (error) {
    console.error("Error fetching review details:", error);
    review.value = null;
    isLoadingBook.value = false; // 오류 시 책 로딩 상태도 해제
  } finally {
    isLoadingReview.value = false; // 감상평 로딩은 여기서 항상 해제
  }
}

async function fetchBookData(idOfBook) {
  if (!idOfBook) {
    isLoadingBook.value = false;
    return;
  }
  // isLoadingBook.value = true; // 호출 전에 이미 true로 설정됨
  try {
    const response = await $api.get(`/books/${idOfBook}/`);
    book.value = response.data;
  } catch (error) {
    console.error("Error fetching book data:", error);
  } finally {
    isLoadingBook.value = false;
  }
}

async function toggleReviewLikeApi() {
  if (!loggedInUser.value) {
    alert('좋아요를 누르려면 로그인이 필요합니다.');
    router.push({ name: 'LoginPage' });
    return;
  }

  if (!review.value || !review.value.id || !bookIdFromRoute) {
    alert('감상평 또는 책 정보를 찾을 수 없습니다.');
    return;
  }

  try {
    // API URL: /api/books/{bookId}/thread/{threadId}/likes/
    // bookIdFromRoute는 현재 페이지의 book ID, reviewId는 현재 감상평(thread)의 ID
    const response = await $api.post(`/books/${bookIdFromRoute}/thread/${reviewId}/likes/`);

    // 백엔드 응답에 따라 is_liked_by_user 와 likes_count 업데이트
    // 백엔드가 { liked: boolean, like_count: number } 형태로 응답하므로 이에 맞춤.
    if (response.data && typeof response.data.liked === 'boolean' && typeof response.data.like_count === 'number') {
      review.value.is_liked_by_user = response.data.liked;
      review.value.likes_count = response.data.like_count; // 'like_count'로 수정
    } else {
      // 또는, 백엔드가 토글만 하고 상태를 반환하지 않는 경우 (덜 이상적)
      // 이 경우, 프론트에서 직접 상태를 반전시키고 카운트를 조절해야 함.
      // 여기서는 백엔드가 명확한 상태를 준다고 가정하고, 그렇지 않으면 에러로 처리하거나
      // fetchReviewDetail()을 다시 호출하여 전체 데이터를 갱신할 수 있음.
      // 지금은 간단하게, 응답 형식이 다르면 다시 불러오는 것으로 처리
      console.warn('좋아요 API 응답 형식이 예상과 다릅니다. 데이터를 다시 불러옵니다.');
      await fetchReviewDetail(); // 또는 fetchReviewDetail의 일부만 (예: 좋아요 상태만)
    }

  } catch (error) {
    console.error("Error toggling review like:", error);
    if (error.response && error.response.status === 401) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      router.push({ name: 'LoginPage' });
    } else {
      alert('좋아요 처리 중 오류가 발생했습니다.');
    }
  }
}

function editMyReview() { /* ... */ }
async function deleteMyReview() { /* ... */ }
function navigateToBookDetail(idOfBook) {
  if (idOfBook) {
    router.push({ name: 'BookDetail', params: { id: idOfBook } });
  }
}
function goToUserProfile(userId) {
  if (userId) {
    router.push({ name: 'UserProfile', params: { userId: userId } });
  }
}

async function fetchComments(threadId) { // threadId는 reviewId와 동일하게 사용됨
  if (!reviewId) return; // reviewId를 사용하도록 통일
  isLoadingComments.value = true;
  try {
    // API 경로 수정: /books/threads/{threadId}/comments/
    // bookIdFromRoute는 review.book.id (또는 review.value.book)와 다를 수 있으므로,
    // 댓글은 thread(감상평)에 직접 연결되므로 reviewId (또는 threadId)를 사용합니다.
    // 백엔드 API URL을 /api/books/<thread_pk>/comment/ 형태로 수정합니다.
    // reviewId가 thread_pk에 해당합니다.
    const response = await $api.get(`/books/${reviewId}/comment/`); // reviewId 사용
    comments.value = response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    comments.value = []; // 오류 발생 시 댓글 목록 초기화
  } finally {
    isLoadingComments.value = false;
  }
}

async function submitComment() {
  if (!newCommentText.value.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  if (!review.value || !review.value.id) { // review.value.id는 reviewId와 같음
    alert('감상평 정보를 찾을 수 없습니다.');
    return;
  }

  try {
    // 백엔드 API URL을 /api/books/<thread_pk>/comment/create/ 형태로 수정합니다.
    const response = await $api.post(`/books/${reviewId}/comment/create/`, { // reviewId 사용
      content: newCommentText.value,
      // user 정보는 백엔드에서 요청한 사용자(request.user)를 사용하므로 프론트에서 보낼 필요 없음
    });
    // 성공 시 새 댓글을 목록에 추가하거나, 목록을 다시 불러옴
    // 여기서는 목록을 다시 불러오는 방식으로 처리
    await fetchComments(reviewId); // reviewId 사용
    newCommentText.value = ''; // 입력창 초기화
  } catch (error) {
    console.error("Error posting comment:", error);
    if (error.response && error.response.status === 401) {
      alert('댓글을 작성하려면 로그인이 필요합니다.');
      router.push({ name: 'LoginPage' });
    } else if (error.response && error.response.data && error.response.data.content) {
      alert(`댓글 작성 실패: ${error.response.data.content.join(', ')}`);
    }
     else {
      alert('댓글 작성 중 오류가 발생했습니다.');
    }
  }
}

onMounted(() => {
  fetchReviewDetail();
  // fetchComments는 fetchReviewDetail 성공 후 호출되도록 변경됨
});
</script>

<style scoped>
/* ... (기존 스타일과 동일) ... */
.review-detail-page { font-family: 'Noto Sans KR', sans-serif; color: #333; }
.loading-placeholder, .error-placeholder { text-align: center; padding: 3rem; font-size: 1.2rem; color: #777;}
.banner-container { width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); height: 280px; position: relative; background-color: #333; }
.banner { width: 100%; height: 100%; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; }
.banner-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
.banner-placeholder { width: 100%; height: 100%; background-image: linear-gradient(to right, #4a4a4a 0%, #2c2c2c 100%); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; }
.banner-overlay-text { position: absolute; color: white; font-size: 2.4rem; font-weight: bold; text-align: center; padding: 0 2rem; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); z-index: 10; }
.main-content-wrapper { max-width: 960px; margin: 0 auto; padding: 0 1rem; position: relative; }
.main-content { display: flex; gap: 2.5rem; margin-top: -80px; position: relative; z-index: 5; }
.book-info-column { width: 260px; flex-shrink: 0; position: relative; z-index: 20; }
.book-info-container { background-color: rgba(51, 58, 64, 0.85); color: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); cursor: pointer;}
.book-cover-image, .book-cover-placeholder { display: block; width: 180px; height: 270px; object-fit: cover; border-radius: 6px; margin: 0 auto 1.5rem auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); }
.book-cover-placeholder { background-color: #555; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.book-details-text { text-align: left; }
.book-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem; line-height: 1.3; }
.book-author, .book-pub-date, .book-publisher { font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.4rem; color: #e0e0e0; }
.book-publisher { margin-bottom: 0; }
.review-details-column { flex-grow: 1; padding-top: 90px; }
.review-meta-section { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e0e0e0; }
.review-meta-section h1 { font-size: 1.8rem; font-weight: bold; color: #2c3e50; margin-bottom: 0.5rem; }
.meta { font-size: 0.95rem; color: #555; display: flex; align-items: center; }
.meta .actions { margin-left: auto; display: flex; align-items: center; }
.meta button { background: none; border: none; cursor: pointer; font-size: 0.9rem; color: #555; margin-left: 0.75rem; display: flex; align-items: center; }
.meta button:hover { color: #ff6b6b; }
.action-icon { width: 18px; height: 18px; margin-right: 4px; vertical-align: middle; }
.icon-button { display: inline-flex; align-items: center; padding: 4px 6px; }
.review-body { line-height: 1.7; margin-bottom: 2.5rem; white-space: pre-wrap; }
.review-actions-footer {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #ccc;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}
.btn-edit {
  background-color: #f0f0f0;
  color: #333;
  border-color: #ccc;
}
.btn-edit:hover {
  background-color: #ffc107;
  color: white;
  border-color: #ffc107;
}
.btn-delete {
  background-color: #f0f0f0;
  color: #333;
  border-color: #ccc;
}
.btn-delete:hover {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}
.comments-section { border-top: 1px solid #ddd; padding-top: 1.5rem; margin-top: 2rem; }
.comments-section h2 { font-size: 1.3rem; margin-bottom: 1rem; }

.comment-form { margin-bottom: 1.5rem; }
.comment-form textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  font-family: inherit;
  font-size: 0.95rem;
  box-sizing: border-box; /* 너비 계산에 padding과 border 포함 */
}
.btn-submit-comment {
  background-color: #3498db;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}
.btn-submit-comment:hover {
  background-color: #2980b9;
}
.comment-login-prompt {
  text-align: center;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.loading-comments, .no-comments {
  text-align: center;
  color: #777;
  padding: 1rem 0;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.comment-item {
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-author {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.3rem;
}
.comment-author .comment-date {
  color: #888;
  font-size: 0.8rem;
}
.comment-content {
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap; /* 줄바꿈 및 공백 유지 */
}
</style>
