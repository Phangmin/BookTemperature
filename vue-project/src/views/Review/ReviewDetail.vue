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
          <img :src="review.cover_img || aiGeneratedBanner" alt="Review Banner" class="banner-image" v-if="review.cover_img || aiGeneratedBanner" />
          <div class="banner-placeholder" v-else>AI 이미지 생성 중이거나 이미지가 없습니다.</div>
          <div class="banner-overlay-text">“{{ review.title }}”</div>
        </div>
      </div>

      <div class="main-content-wrapper">
        <div class="main-content" v-if="book">
          <div class="book-info-column">
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
            <!-- 중복된 닫는 div 태그 제거됨 -->
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
              <!-- 댓글 목록 및 입력창 (추후 구현) -->
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
const comments = ref([]);
const aiGeneratedBanner = ref('');
const isLoadingReview = ref(true);
const isLoadingBook = ref(true);
const isLoadingAiImage = ref(false);

import commentsIcon from '@/assets/icons/comments.png';
import emptyHeartIcon from '@/assets/icons/empty_heart.png';
import fullHeartIcon from '@/assets/icons/full_heart.png';

const loggedInUser = computed(() => userStore.user);
const isAuthor = computed(() => {
  return !!(review.value && loggedInUser.value && review.value.user?.id === loggedInUser.value?.id);
});

// 수정 모달 관련 상태 및 함수 제거
// const showEditReviewModal = ref(false);
// const editReviewTitle = ref('');
// const editReviewContent = ref('');

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function generateAndSetBannerImage() {
  if (review.value && review.value.cover_img) {
    aiGeneratedBanner.value = review.value.cover_img;
  } else if (review.value) {
    // AI 이미지 생성 로직 (필요시)
  }
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
    await generateAndSetBannerImage();
  } catch (error) {
    console.error("Error fetching review details:", error);
    review.value = null;
  } finally {
    isLoadingReview.value = false;
  }
}

async function fetchBookData(idOfBook) {
  if (!idOfBook) { isLoadingBook.value = false; return; }
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
  if (!review.value || !bookIdFromRoute) return;
  try {
    const response = await $api.put(`/books/${bookIdFromRoute}/thread/${review.value.id}/likes/`);
    if (response.data) {
      review.value.is_liked_by_user = response.data.liked;
      review.value.likes_count = response.data.like_count;
    }
  } catch (error) {
    console.error("Error toggling review like:", error);
    alert("좋아요 처리에 실패했습니다.");
  }
}

function editMyReview() { // 수정 페이지로 이동
  if (review.value) {
    router.push({
      name: 'ReviewEdit',
      params: {
        bookId: bookIdFromRoute,
        reviewId: review.value.id
      }
    });
  }
}

// submitEditReview, closeEditReviewModal 함수 제거

async function deleteMyReview() {
  if (review.value && confirm('이 감상평을 정말 삭제하시겠습니까?')) {
    try {
      await $api.delete(`/books/${bookIdFromRoute}/thread/${review.value.id}/delete/`);
      alert('감상평이 삭제되었습니다.');
      router.push({ name: 'BookDetail', params: { id: bookIdFromRoute } });
    } catch (error) {
      console.error("감상평 삭제 실패:", error.response?.data || error.message);
      alert(`감상평 삭제에 실패했습니다: ${error.response?.data?.detail || error.message}`);
    }
  }
}

function navigateToBookDetail(idOfBook) { if (idOfBook) router.push({ name: 'BookDetail', params: { id: idOfBook } });}
function goToUserProfile(userId) { if (userId) router.push({ name: 'UserProfile', params: { userId: userId } });}

onMounted(() => { fetchReviewDetail(); });
</script>

<style scoped>
/* ReviewDetail.vue 스타일 (수정 모달 관련 CSS는 제거됨) */
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
  justify-content: flex-end; /* 버튼들을 오른쪽으로 정렬 */
  gap: 0.5rem; /* 버튼 사이 간격을 0.5rem (8px)으로 줄임 */
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #ccc; /* 기본 테두리 추가 */
  transition: background-color 0.2s, color 0.2s, border-color 0.2s; /* 트랜지션 추가 */
}
.btn-edit {
  background-color: #f0f0f0; /* 기본 회색 배경 */
  color: #333; /* 기본 글자색 */
  border-color: #ccc;
}
.btn-edit:hover {
  background-color: #ffc107; /* 호버 시 노란색 계열 */
  color: white;
  border-color: #ffc107;
}
.btn-delete {
  background-color: #f0f0f0; /* 기본 회색 배경 */
  color: #333; /* 기본 글자색 */
  border-color: #ccc;
}
.btn-delete:hover {
  background-color: #dc3545; /* 호버 시 빨간색 계열 */
  color: white;
  border-color: #dc3545;
}
.comments-section { border-top: 1px solid #ddd; padding-top: 1.5rem; margin-top: 2rem; }
.comments-section h2 { font-size: 1.3rem; margin-bottom: 1rem; }
/* 수정 모달 관련 CSS는 ReviewEdit.vue로 이동 또는 ReviewDetail.vue에서 제거 */
</style>
