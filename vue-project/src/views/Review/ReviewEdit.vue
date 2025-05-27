<template>
  <div class="review-edit-page">
    <div v-if="isLoading" class="loading-placeholder">
      <p>감상평 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!reviewToEdit || !reviewToEdit.id" class="error-placeholder">
      <p>수정할 감상평을 찾을 수 없습니다.</p>
      <router-link :to="{ name: 'BookDetail', params: { id: bookIdFromRoute } }" v-if="bookIdFromRoute">도서 상세로 돌아가기</router-link>
      <router-link to="/" v-else>홈으로 돌아가기</router-link>
    </div>
    <div v-else>
      <div class="banner-container">
        <div class="banner">
          <img :src="reviewToEdit.cover_img || book?.cover" alt="Banner" class="banner-image" v-if="reviewToEdit.cover_img || book?.cover" />
          <div class="banner-placeholder" v-else>배너 이미지 없음</div>
          <div class="banner-overlay-text">“{{ editTitle }}” 감상평 수정</div>
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
              </div>
            </div>
          </div>

          <div class="review-edit-form-column">
            <h1>감상평 수정</h1>
            <form @submit.prevent="submitEditedReview">
              <div class="form-group">
                <label for="reviewTitle">제목</label>
                <input type="text" id="reviewTitle" v-model="editTitle" class="form-input" required />
              </div>
              <div class="form-group">
                <label for="reviewContent">내용</label>
                <textarea id="reviewContent" v-model="editContent" class="form-textarea" rows="10" required></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">수정 완료</button>
                <button type="button" class="btn btn-secondary" @click="cancelEdit">취소</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const app = getCurrentInstance();
const $api = app.appContext.config.globalProperties.$api;
const route = useRoute();
const router = useRouter();

const reviewId = parseInt(route.params.reviewId);
const bookIdFromRoute = parseInt(route.params.bookId);

const reviewToEdit = ref(null);
const book = ref(null); // 감상평에 연결된 책 정보
const editTitle = ref('');
const editContent = ref('');
const isLoading = ref(true);

async function fetchReviewDataForEdit() {
  isLoading.value = true;
  try {
    const response = await $api.get(`/books/${bookIdFromRoute}/thread/${reviewId}/`);
    reviewToEdit.value = response.data;
    if (reviewToEdit.value) {
      editTitle.value = reviewToEdit.value.title;
      editContent.value = reviewToEdit.value.content;
      // 책 정보도 함께 가져오기
      if (reviewToEdit.value.book && typeof reviewToEdit.value.book === 'number') {
        await fetchBookData(reviewToEdit.value.book);
      } else if (reviewToEdit.value.book && typeof reviewToEdit.value.book === 'object') {
        book.value = reviewToEdit.value.book;
      } else {
         await fetchBookData(bookIdFromRoute); // Fallback
      }
    }
  } catch (error) {
    console.error("수정할 감상평 정보를 가져오는데 실패했습니다:", error);
    reviewToEdit.value = null;
  } finally {
    isLoading.value = false;
  }
}

async function fetchBookData(idOfBook) {
  if (!idOfBook) return;
  try {
    const response = await $api.get(`/books/${idOfBook}/`);
    book.value = response.data;
  } catch (error) {
    console.error("책 정보를 가져오는데 실패했습니다:", error);
  }
}

async function submitEditedReview() {
  if (!editTitle.value.trim() || !editContent.value.trim()) {
    alert('제목과 내용을 모두 입력해주세요.');
    return;
  }
  try {
    await $api.patch(`/books/${bookIdFromRoute}/thread/${reviewId}/update/`, {
      title: editTitle.value,
      content: editContent.value,
    });
    alert('감상평이 성공적으로 수정되었습니다.');
    router.push({ name: 'ReviewDetail', params: { bookId: bookIdFromRoute, reviewId: reviewId } });
  } catch (error) {
    console.error("감상평 수정 실패:", error.response?.data || error.message);
    alert(`감상평 수정에 실패했습니다: ${error.response?.data?.detail || error.message}`);
  }
}

function cancelEdit() {
  router.push({ name: 'ReviewDetail', params: { bookId: bookIdFromRoute, reviewId: reviewId } });
}

function navigateToBookDetail(idOfBook) {
  if (idOfBook) router.push({ name: 'BookDetail', params: { id: idOfBook } });
}

onMounted(() => {
  fetchReviewDataForEdit();
});
</script>

<style scoped>
/* ReviewDetail.vue와 유사한 스타일 + 폼 스타일 */
.review-edit-page { font-family: 'Noto Sans KR', sans-serif; color: #333; }
.loading-placeholder, .error-placeholder { text-align: center; padding: 3rem; font-size: 1.2rem; color: #777;}
.banner-container { width: 100vw; margin-left: calc(50% - 50vw); margin-right: calc(50% - 50vw); height: 200px; /* 상세페이지보다 배너 높이 약간 줄임 */ position: relative; background-color: #333; }
.banner { width: 100%; height: 100%; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; }
.banner-image { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
.banner-placeholder { width: 100%; height: 100%; background-image: linear-gradient(to right, #4a4a4a 0%, #2c2c2c 100%); display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; }
.banner-overlay-text { position: absolute; color: white; font-size: 2rem; font-weight: bold; text-align: center; padding: 0 2rem; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6); z-index: 10; }

.main-content-wrapper { max-width: 960px; margin: 0 auto; padding: 0 1rem; position: relative; }
.main-content { display: flex; gap: 2.5rem; margin-top: -60px; /* 배너 높이 변경에 따라 조정 */ position: relative; z-index: 5; }

.book-info-column { width: 260px; flex-shrink: 0; position: relative; z-index: 20; }
.book-info-container { background-color: rgba(51, 58, 64, 0.85); color: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); cursor: pointer;}
.book-cover-image, .book-cover-placeholder { display: block; width: 180px; height: 270px; object-fit: cover; border-radius: 6px; margin: 0 auto 1.5rem auto; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); }
.book-cover-placeholder { background-color: #555; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; }
.book-details-text { text-align: left; }
.book-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem; line-height: 1.3; }
.book-author { font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.4rem; color: #e0e0e0; }

.review-edit-form-column { flex-grow: 1; padding-top: 70px; /* 배너 높이 변경에 따라 조정 */ background-color: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.review-edit-form-column h1 { font-size: 1.8rem; font-weight: bold; color: #2c3e50; margin-bottom: 1.5rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; font-size: 0.95rem; }
.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  line-height: 1.5;
}
.form-textarea { resize: vertical; min-height: 150px; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; }
.btn { padding: 0.6rem 1.2rem; border-radius: 4px; cursor: pointer; font-size: 0.95rem; font-weight: 500; border: none; }
.btn-primary { background-color: #007bff; color: white; }
.btn-primary:hover { background-color: #0056b3; }
.btn-secondary { background-color: #6c757d; color: white; }
.btn-secondary:hover { background-color: #545b62; }
</style>
