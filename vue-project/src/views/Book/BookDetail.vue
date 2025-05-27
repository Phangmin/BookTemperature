<!-- src/views/Book/BookDetail.vue -->
<template>
  <div class="book-detail-container-wrapper">
    <div v-if="isLoading" class="loading-placeholder">
      <p>도서 정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!book" class="error-placeholder">
      <p>도서 정보를 찾을 수 없습니다. URL을 확인해주세요.</p>
      <router-link to="/">홈으로 돌아가기</router-link>
    </div>
    <div v-else class="book-detail-page">
      <div class="main-content">
        <!-- ... (기존 헤더, TTS, 작가정보, 추천 등 HTML 동일) ... -->
        <div class="detail-header">
          <div class="cover-section">
            <img :src="book?.cover" :alt="book?.title + ' cover'" class="cover-image" v-if="book?.cover"/>
            <div class="cover-placeholder" v-else>표지 없음</div>
          </div>
          <div class="info-section">
            <div class="badges">
              <span class="badge badge-popular">인기 있는 도서</span>
              <span class="badge badge-theme">{{ book?.themeLabel }}</span>
            </div>
            <div class="title-actions-wrapper">
              <h1 class="title">{{ book?.title }}</h1>
              <div class="header-actions">
                <button class="header-action-btn cart-btn" @click="toggleCart">
                  <img :src="inCart ? fullCartIcon : emptyCartIcon" alt="Cart" class="header-action-icon-img" />
                </button>
                <button class="header-action-btn like-btn" @click="toggleLike">
                  <img :src="liked ? fullHeartIcon : emptyHeartIcon" alt="Like" class="header-action-icon-img" />
                </button>
              </div>
            </div>
            <section class="summary">
              <p>{{ book?.summary }}</p>
            </section>
          </div>
        </div>

      <section class="tts-player-section">
        <div class="tts-title-line">
          <img :src="googleLogoIcon" alt="Google logo" class="google-logo-icon" />
          <span class="tts-text">TTS</span>
          <span class="tts-service-name">(Google Text-To-Speech)</span>
        </div>
        <div class="tts-controls-bar">
          <button @click="playPauseTTS" class="tts-play-btn-main">{{ isPlaying ? '❚❚' : '▶' }}</button>
          <div class="tts-progress-bar-container">
            <div class="tts-progress-bar" :style="{ width: progressBarWidth + '%' }"></div>
          </div>
          <span class="tts-time">{{ formatTime(currentTime) }} / {{ formatTime(totalTime) }}</span>
        </div>
      </section>

      <section class="author-info">
        <h2>도서 및 작가 정보</h2>
        <div class="author-info-layout">
          <div class="author-photo-container">
            <img :src="book?.authorPhoto" :alt="book?.author + ' photo'" class="author-avatar" v-if="book?.authorPhoto"/>
            <div class="author-avatar-placeholder" v-else></div>
          </div>
          <div class="author-details-container">
            <div class="info-item">
              <span class="info-label">| 작가명</span>
              <span class="info-value">{{ book?.author }}</span>
            </div>
            <div class="info-item bio-item">
              <span class="info-label">| 작가정보</span>
              <span class="info-value bio-text">{{ book?.authorBio }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">| 출판일</span>
              <span class="info-value">{{ book?.published }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">| 출판사</span>
              <span class="info-value">{{ book?.publisher }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="recommend">
        <h2>이런 책은 어떠세요?</h2>
        <div class="recommend-grid">
          <router-link
            v-for="rec in recommendations"
            :key="rec.id"
            :to="{ name: 'BookDetail', params: { id: rec.id } }"
            custom
            v-slot="{ navigate }"
          >
            <div
              class="rec-item"
              @click="navigate"
              role="link"
              tabindex="0"
              @keypress.enter="navigate"
            >
              <img :src="rec.cover" :alt="rec.title + ' cover'" class="rec-cover-img" v-if="rec.cover"/>
              <div class="rec-cover" v-else></div>
              <div class="rec-title">{{ rec.title }}</div>
              <div class="rec-author">{{ rec.author }}</div>
            </div>
          </router-link>
        </div>
      </section>

      <section class="reviews">
        <div class="section-header">
          <h2>「{{ book?.title }}」의 감상평({{ reviews.length }})</h2>
          <button class="btn-edit-list" @click="openReviewModal">✏️</button>
        </div>
        <hr />
        <div v-if="isLoadingReviews" class="loading-placeholder"><p>감상평을 불러오는 중입니다...</p></div>
        <div v-else-if="reviews.length === 0" class="no-reviews">
          <p>아직 작성된 감상평이 없습니다. 첫 번째 감상평을 남겨보세요!</p>
        </div>
        <div v-for="rev in reviews" :key="rev.id" class="review-item">
          <div class="review-clickable-area">
            <h3 class="rev-title" @click="goToReviewDetail(rev.id)">“{{ rev.title }}”
              <small @click.stop="goToUserProfile(rev.user?.id || rev.userId)" style="cursor: pointer; text-decoration: underline;">- by. {{ rev.user?.nickname || rev.user?.username || rev.user }}</small>
            </h3>
            <p class="rev-content" @click="goToReviewDetail(rev.id)">{{ rev.content }}</p>
          </div>
          <div class="rev-actions">
            <button class="btn text-btn icon-btn" @click="toggleReviewLike(rev.id)">
              <img :src="rev.is_liked_by_user ? fullHeartIcon : emptyHeartIcon" alt="Like" class="action-icon-small" />
              {{ rev.likes_count || rev.likes }}
            </button>
            <button class="btn text-btn icon-btn">
              <img :src="commentsIcon" alt="Comments" class="action-icon-small" />
              {{ rev.comments_count || rev.comments }}
            </button>
          </div>
        </div>
        <!-- ... (페이지네이션은 일단 생략) ... -->
      </section>

      <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
        <div class="modal-content">
          <h3>감상평 작성하기</h3>
          <input type="text" v-model="newReviewTitle" placeholder="감상평 제목" class="modal-input"/>
          <textarea v-model="newReviewContent" placeholder="감상평 내용" rows="5" class="modal-textarea"></textarea>
          <div class="modal-actions">
            <button @click="submitReview" class="btn-primary">등록</button>
            <button @click="closeReviewModal" class="btn-secondary">취소</button>
          </div>
        </div>
      </div>

      <section class="endings">
        <div class="section-header">
          <h2>「{{ book?.title }}」의 열린 결말({{ endings.length }})</h2>
          <button class="btn-edit-list" @click="openEndingModal">✏️</button>
        </div>
        <hr />
        <div v-if="isLoadingEndings" class="loading-placeholder"><p>열린결말을 불러오는 중입니다...</p></div>
        <div v-else-if="endings.length === 0" class="no-reviews">
          <p>아직 작성된 열린 결말이 없습니다. 첫 번째 열린 결말을 남겨보세요!</p>
        </div>
        <div v-for="end_item in endings" :key="end_item.id" class="ending-item">
           <div class="ending-clickable-area">
            <h3 class="end-title" @click="goToEndingDetail(end_item.id)">“{{ end_item.title }}”
              <small @click.stop="goToUserProfile(end_item.user?.id || end_item.userId)" style="cursor: pointer; text-decoration: underline;">- by. {{ end_item.user?.nickname || end_item.user?.username || end_item.user }}</small>
            </h3>
            <p class="end-content" @click="goToEndingDetail(end_item.id)">{{ end_item.content }}</p>
          </div>
          <div class="end-actions">
            <button class="btn text-btn icon-btn" @click="toggleEndingLike(end_item.id)">
              <img :src="end_item.is_liked_by_user ? fullHeartIcon : emptyHeartIcon" alt="Like" class="action-icon-small" />
              {{ end_item.likes_count || end_item.likes }}
            </button>
            <button class="btn text-btn icon-btn">
              <img :src="commentsIcon" alt="Comments" class="action-icon-small" />
              {{ end_item.comments_count || end_item.comments }}
            </button>
          </div>
        </div>
        <!-- ... (페이지네이션은 일단 생략) ... -->
      </section>

      <div v-if="showEndingModal" class="modal-overlay" @click.self="closeEndingModal">
        <div class="modal-content">
          <h3>열린 결말 작성하기</h3>
          <input type="text" v-model="newEndingTitle" placeholder="열린 결말 제목" class="modal-input"/>
          <textarea v-model="newEndingContent" placeholder="열린 결말 내용" rows="5" class="modal-textarea"></textarea>
          <div class="modal-actions">
            <button @click="submitEnding" class="btn-primary">등록</button>
            <button @click="closeEndingModal" class="btn-secondary">취소</button>
          </div>
        </div>
      </div>

      <!-- AI 이미지 생성 로딩 모달 -->
      <div v-if="showAiLoadingModal" class="modal-overlay ai-loading-modal">
        <div class="modal-content">
          <h3>AI 이미지 생성 중</h3>
          <p>작성하신 감상평에 맞는 이미지를 생성 중입니다...</p>
          <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
          </div>
        </div>
      </div>

      </div> <!-- main-content -->
      <div class="sidebar">
        <!-- ... (기존 사이드바 HTML 동일) ... -->
        <div class="stats-card">
          <div class="stat-item rating-stat">
            <img :src="starIcon" alt="Rating" class="stat-icon rating-icon" />
            <span class="stat-value rating-value">{{ typeof book?.rating === 'number' ? book.rating.toFixed(1) : 'N/A' }}</span>
            <span class="stat-label rating-label">도서 평점</span>
          </div>
          <div class="user-stats-grid">
            <div class="stat-item">
              <img :src="penIcon" alt="Reviews" class="stat-icon review-icon" />
              <span class="stat-value review-count">{{ reviews.length }}</span>
              <span class="stat-label review-label">작성된 감상평</span>
            </div>
            <div class="stat-item">
              <img :src="openDoorIcon" alt="Endings" class="stat-icon ending-icon" />
              <span class="stat-value ending-count">{{ endings.length }}</span>
              <span class="stat-label ending-label">작성된 열린결말</span>
            </div>
          </div>
        </div>
      </div> <!-- sidebar -->
    </div> <!-- book-detail-page -->
  </div> <!-- book-detail-container-wrapper -->
</template>

<script setup>
  import { ref, onMounted, computed, watch, onBeforeUnmount, getCurrentInstance } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import emptyHeartIcon from '@/assets/icons/empty_heart.png'
  import fullHeartIcon from '@/assets/icons/full_heart.png'
  import emptyCartIcon from '@/assets/icons/empty_cart.png'
  import fullCartIcon from '@/assets/icons/full_cart.png'
  import starIcon from '@/assets/icons/star.png'
  import penIcon from '@/assets/icons/pen.png'
  import openDoorIcon from '@/assets/icons/open_door.png'
  import commentsIcon from '@/assets/icons/comments.png'
  import googleLogoIcon from '@/assets/icons/google_logo.png'

  const app = getCurrentInstance();
  const $api = app.appContext.config.globalProperties.$api;

  const route = useRoute();
  const router = useRouter();
  const bookId = computed(() => {
    const id = parseInt(route.params.id, 10);
    return isNaN(id) ? null : id;
  });

  const book = ref(null);
  const recommendations = ref([]);
  const isLoading = ref(true);
  const liked = ref(false);
  const inCart = ref(false);

  const reviews = ref([]);
  const isLoadingReviews = ref(false);
  const endings = ref([]);
  const isLoadingEndings = ref(false);

  // TTS (이전과 동일)
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const totalTime = ref(0);
  let ttsInterval = null;
  let utterance = null;
  const progressBarWidth = computed(() => totalTime.value > 0 ? (currentTime.value / totalTime.value) * 100 : 0);
  function formatTime(seconds) { const minutes = Math.floor(seconds / 60); const remainingSeconds = Math.floor(seconds % 60); return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`; }
  function speakText() { if (!book.value || !book.value.description) return; if (speechSynthesis.speaking) { speechSynthesis.cancel(); } utterance = new SpeechSynthesisUtterance(book.value.description); utterance.lang = 'ko-KR'; utterance.rate = 1; utterance.pitch = 1; utterance.onstart = () => { isPlaying.value = true; totalTime.value = Math.max(1, Math.floor(book.value.description.length / 10)); currentTime.value = 0; if(ttsInterval) clearInterval(ttsInterval); ttsInterval = setInterval(() => { if (currentTime.value < totalTime.value && isPlaying.value) { currentTime.value++; } else if (currentTime.value >= totalTime.value) { isPlaying.value = false; } }, 1000); }; utterance.onend = () => { isPlaying.value = false; clearInterval(ttsInterval); }; utterance.onerror = (event) => { console.error('SpeechSynthesisUtterance.onerror', event); isPlaying.value = false; clearInterval(ttsInterval); }; speechSynthesis.speak(utterance); }
  function playPauseTTS() { if (isPlaying.value) { speechSynthesis.pause(); if(ttsInterval) clearInterval(ttsInterval); isPlaying.value = false; } else { if (speechSynthesis.paused && utterance) { speechSynthesis.resume(); isPlaying.value = true; if(ttsInterval) clearInterval(ttsInterval); ttsInterval = setInterval(() => { if (currentTime.value < totalTime.value && isPlaying.value) { currentTime.value++; } else if (currentTime.value >= totalTime.value) { isPlaying.value = false; } }, 1000); } else { speakText(); } } }
  watch(isPlaying, (newValue) => { if (!newValue && ttsInterval) clearInterval(ttsInterval); });
  onBeforeUnmount(() => { if (speechSynthesis.speaking || speechSynthesis.paused) speechSynthesis.cancel(); if (ttsInterval) clearInterval(ttsInterval); });
  // TTS 끝

  function toggleLike() { liked.value = !liked.value; /* TODO: API */ }

  async function toggleCart() {
    if (!bookId.value) return;
    const newState = !inCart.value;
    try {
      if (newState) await $api.post(`/accounts/cart/add/${bookId.value}/`);
      else await $api.delete(`/accounts/cart/remove/${bookId.value}/`);
      inCart.value = newState;
    } catch (error) { console.error(`Error updating cart status for book ${bookId.value}:`, error); }
  }

  const showReviewModal = ref(false);
  const newReviewTitle = ref('');
  const newReviewContent = ref('');

  const isCreatingThread = ref(false); // 감상평(Thread) 생성 및 AI 이미지 생성 진행 상태
  const showAiLoadingModal = ref(false); // AI 이미지 생성 로딩 모달 표시 여부

  function openReviewModal() { showReviewModal.value = true; }
  function closeReviewModal() {
    showReviewModal.value = false;
    newReviewTitle.value = '';
    newReviewContent.value = '';
  }

  async function submitReview() {
    if (!newReviewTitle.value.trim() || !newReviewContent.value.trim()) {
      alert('감상평 제목과 내용을 모두 입력해주세요.'); return;
    }
    if (!bookId.value) {
        alert('오류: 책 ID를 찾을 수 없습니다.'); return;
    }

    // API로 전송할 데이터를 먼저 지역 변수에 저장
    const reviewData = {
      title: newReviewTitle.value,
      content: newReviewContent.value,
    };

    closeReviewModal(); // 이제 작성 모달을 닫아도 reviewData는 안전합니다.
    isCreatingThread.value = true;
    showAiLoadingModal.value = true;

    try {
      // 저장된 reviewData를 사용
      const response = await $api.post(`/books/${bookId.value}/thread/create/`, reviewData);

      // AI 이미지 생성이 백엔드에서 동기적으로 완료된다고 가정
      // 응답에서 새로 생성된 감상평(thread)의 ID를 가져옵니다.
      const newThreadId = response.data.id;

      // AI 로딩 모달 닫기 전에 잠시 대기 (선택 사항, 사용자 경험을 위해)
      // await new Promise(resolve => setTimeout(resolve, 1000));

      showAiLoadingModal.value = false;
      alert('감상평이 등록되었고, AI 이미지가 생성되었습니다.'); // 또는 이미지 생성 완료 메시지

      // 상세 페이지로 이동
      router.push({
        name: 'ReviewDetail',
        params: { bookId: bookId.value, reviewId: newThreadId }
      });

      // 현재 페이지의 감상평 목록도 새로고침 (선택 사항)
      // await fetchBookReviews();
      // 상세 페이지로 이동하므로, 현재 페이지 새로고침은 필수는 아닐 수 있음

    } catch (error) {
      showAiLoadingModal.value = false;
      console.error('감상평 등록 또는 AI 이미지 생성 실패:', error.response?.data || error.message);
      let errorMessage = '감상평 등록 중 오류가 발생했습니다.';
      if (error.response && error.response.data) {
        const errors = error.response.data;
        if (typeof errors === 'object' && errors !== null) {
          const firstErrorKey = Object.keys(errors)[0];
          if (firstErrorKey && Array.isArray(errors[firstErrorKey]) && errors[firstErrorKey].length > 0) {
            errorMessage += `\n오류: ${firstErrorKey} - ${errors[firstErrorKey][0]}`;
          } else {
            errorMessage += `\n상세 오류: ${JSON.stringify(errors)}`;
          }
        } else if (typeof errors === 'string') {
          errorMessage += `\n상세 오류: ${errors}`;
        }
      } else if (error.message) {
        errorMessage += `\n메시지: ${error.message}`;
      }
      alert(errorMessage);
    }
  }

  const showEndingModal = ref(false);
  const newEndingTitle = ref('');
  const newEndingContent = ref('');

  function openEndingModal() { showEndingModal.value = true; }
  function closeEndingModal() { showEndingModal.value = false; newEndingTitle.value = ''; newEndingContent.value = ''; }

  async function submitEnding() {
    if (!newEndingTitle.value.trim() || !newEndingContent.value.trim()) {
      alert('열린 결말 제목과 내용을 모두 입력해주세요.'); return;
    }
     if (!bookId.value) {
        alert('오류: 책 ID를 찾을 수 없습니다.'); return;
    }
    console.log('Submitting ending for book ID:', bookId.value); // ID 값 확인 로그
    try {
      const response = await $api.post(`/books/${bookId.value}/open-endings/`, {
        title: newEndingTitle.value,
        content: newEndingContent.value,
      });
      await fetchBookEndings();
      alert('열린 결말이 등록되었습니다.');
      closeEndingModal();
    } catch (error) {
      console.error('열린 결말 등록 실패:', error.response?.data || error.message);
      let errorMessage = '열린 결말 등록에 실패했습니다.';
      if (error.response && error.response.data) {
        const errors = error.response.data;
         if (typeof errors === 'object' && errors !== null) {
          const firstErrorKey = Object.keys(errors)[0];
          if (firstErrorKey && Array.isArray(errors[firstErrorKey]) && errors[firstErrorKey].length > 0) {
            errorMessage += `\n오류: ${firstErrorKey} - ${errors[firstErrorKey][0]}`;
          } else {
            errorMessage += `\n상세 오류: ${JSON.stringify(errors)}`;
          }
        } else if (typeof errors === 'string') {
          errorMessage += `\n상세 오류: ${errors}`;
        }
      } else if (error.message) {
        errorMessage += `\n메시지: ${error.message}`;
      }
      alert(errorMessage);
    }
  }

  async function fetchBookReviews() {
    if (!bookId.value) return;
    isLoadingReviews.value = true;
    try {
      const response = await $api.get(`/books/${bookId.value}/threads/`);
      reviews.value = response.data;
    } catch (error) {
      console.error(`Error fetching reviews for book ${bookId.value}:`, error);
      reviews.value = [];
    } finally {
      isLoadingReviews.value = false;
    }
  }

  async function fetchBookEndings() {
    if (!bookId.value) return;
    isLoadingEndings.value = true;
    try {
      const response = await $api.get(`/books/${bookId.value}/endingslist/`);
      endings.value = response.data;
    } catch (error) {
      console.error(`Error fetching endings for book ${bookId.value}:`, error);
      endings.value = [];
    } finally {
      isLoadingEndings.value = false;
    }
  }

  async function fetchBookDetails() {
    if (bookId.value === null) { isLoading.value = false; book.value = null; recommendations.value = []; return; }
    isLoading.value = true;
    try {
      const bookResponse = await $api.get(`books/${bookId.value}/`);
      const fetchedBook = bookResponse.data;
      if (!fetchedBook || !fetchedBook.title) { book.value = null; recommendations.value = []; isLoading.value = false; return; }
      book.value = {
        id: fetchedBook.id, title: fetchedBook.title, author: fetchedBook.author,
        rating: fetchedBook.customer_review_rank !== undefined ? fetchedBook.customer_review_rank / 2 : 0,
        summary: fetchedBook.description, published: fetchedBook.pub_date, publisher: fetchedBook.publisher,
        authorBio: fetchedBook.author_info, themeLabel: fetchedBook.category ? fetchedBook.category.name : '미분류',
        cover: fetchedBook.cover, authorPhoto: fetchedBook.author_photo, description: fetchedBook.description,
      };
      if (bookId.value) {
        try {
          const cartStatusResponse = await $api.get(`/accounts/cart/status/${bookId.value}/`);
          if (cartStatusResponse.data && typeof cartStatusResponse.data.inCart === 'boolean') inCart.value = cartStatusResponse.data.inCart;
        } catch (error) {
          if (error.response && error.response.status === 401) inCart.value = false;
          else console.warn(`Could not fetch cart status for book ${bookId.value}:`, error);
          inCart.value = false;
        }
      } else { inCart.value = false; }
      await fetchBookReviews();
      await fetchBookEndings();
    } catch (error) { console.error(`Error fetching book details for bookId ${bookId.value}:`, error); book.value = null; }
    finally {
      isLoading.value = false;
      if (book.value && book.value.id) fetchRecommendations(book.value.id);
    }
  }

  async function fetchRecommendations(currentBookId) {
    if (!currentBookId) return;
    try {
      const recResponse = await $api.get(`books/${currentBookId}/recommendations/`, { timeout: 20000 }); // 타임아웃 20초로 늘림
      recommendations.value = recResponse.data.map(rec => ({
        id: rec.id, title: rec.title, author: rec.author, cover: rec.cover,
      }));
    } catch (recError) {
      console.error(`Error fetching recommendations for bookId ${currentBookId}:`, recError);
      recommendations.value = [];
    }
  }

  onMounted(() => { fetchBookDetails(); });

  watch(bookId, (newBookId, oldBookId) => {
    fetchBookDetails();
    if (speechSynthesis.speaking || speechSynthesis.paused) speechSynthesis.cancel();
    isPlaying.value = false; currentTime.value = 0; totalTime.value = 0;
    if(ttsInterval) clearInterval(ttsInterval);
  });

  function toggleReviewLike(reviewId) { /* ... API 연동 필요 ... */ alert(`Review ${reviewId} like toggle - API 연동 필요`); }
  function goToReviewDetail(reviewId) { if (book.value && book.value.id) router.push({ name: 'ReviewDetail', params: { bookId: book.value.id, reviewId: reviewId } }); }
  function toggleEndingLike(endingId) { /* ... API 연동 필요 ... */ alert(`Ending ${endingId} like toggle - API 연동 필요`); }
  function goToEndingDetail(endingId) { if (book.value && book.value.id) router.push({ name: 'EndingDetail', params: { bookId: book.value.id, endingId: endingId } }); }
  function goToUserProfile(userId) { if (userId) router.push({ name: 'UserProfile', params: { userId: userId } }); }
</script>

<style scoped>
/* ... (기존 스타일과 동일) ... */
.book-detail-page { display: flex; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; color: #333; gap: 30px; }
.main-content { flex-grow: 1; max-width: calc(100% - 310px); }
.sidebar { width: 280px; flex-shrink: 0; }
.review-clickable-area, .ending-clickable-area { cursor: pointer; }
.review-clickable-area:hover .rev-title, .ending-clickable-area:hover .end-title { text-decoration: underline; }
.no-reviews { text-align: center; padding: 2rem; color: #777; }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background-color: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 500px; display: flex; flex-direction: column; gap: 15px; }
.modal-content h3 { margin-top: 0; margin-bottom: 10px; font-size: 1.5rem; color: #333; }
.modal-input, .modal-textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
.modal-textarea { resize: vertical; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.modal-actions .btn-primary, .modal-actions .btn-secondary { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; font-weight: bold; }
.modal-actions .btn-primary { background-color: #007bff; color: white; }
.modal-actions .btn-primary:hover { background-color: #0056b3; }
.modal-actions .btn-secondary { background-color: #6c757d; color: white; }
.modal-actions .btn-secondary:hover { background-color: #545b62; }
.detail-header { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
.cover-section { flex-shrink: 0; }
.cover-placeholder, .cover-image { width: 160px; height: 240px; background-color: #f0f0f0; border: 1px solid #e0e0e0; border-radius: 4px; object-fit: cover; display: flex; align-items: center; justify-content: center; color: #aaa; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.info-section { display: flex; flex-direction: column; flex-grow: 1; }
.badges { display: flex; gap: 8px; margin-bottom: 10px; }
.badge { padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: normal; border: 1px solid transparent; }
.badge-popular { background-color: #fff3cd; color: #856404; border-color: #ffeeba; }
.badge-theme { background-color: #f0f0f0; color: #555; border-color: #e0e0e0; }
.title-actions-wrapper { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.title { font-size: 2rem; font-weight: bold; margin: 0; color: #222; flex-grow: 1; }
.header-actions { display: flex; gap: 10px; flex-shrink: 0; }
.header-action-btn { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; }
.header-action-icon-img { width: 24px; height: 24px; }
.stats-card { padding: 20px; background-color: #ffffff; border: 1px solid #e9e9e9; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); text-align: center; }
.stat-item { display: flex; flex-direction: column; align-items: center; margin-bottom: 15px; }
.stat-item:last-child { margin-bottom: 0; }
.rating-stat { margin-bottom: 20px; flex-direction: row; justify-content: center; align-items: center; }
.stat-icon { width: 24px; height: 24px; margin-bottom: 5px; }
.rating-icon { width: 32px; height: 32px; margin-right: 8px; margin-bottom: 0; }
.stat-value { font-size: 1.6rem; font-weight: bold; }
.rating-value { color: #ffb300; font-size: 2rem; }
.review-count { color: #66bb6a; }
.ending-count { color: #42a5f5; }
.stat-label { font-size: 0.85rem; color: #000000; margin-top: 2px; }
.rating-label { margin-left: 8px; }
.user-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 15px; border-top: 1px solid #f0f0f0; margin-top: 15px; }
.user-stats-grid .stat-item { margin-bottom: 0; }
section { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; }
section:last-child { border-bottom: none; margin-bottom: 0; }
section .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
section h2 { font-size: 1.4rem; font-weight: bold; color: #333; margin: 0; }
.btn-edit-list { background: transparent; border: 1px solid #ddd; border-radius: 50%; width: 32px; height: 32px; font-size: 1rem; color: #666; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-edit-list:hover { background-color: #f5f5f5; }
.summary p { line-height: 1.7; color: #555; }
.tts-player-section { border-top: 1px solid #e0e0e0; border-bottom: 1px solid #e0e0e0; padding: 15px 0; margin-bottom: 2.5rem; display: flex; flex-direction: column; }
.tts-title-line { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.google-logo-icon { width: auto; height: 20px; margin-right: 0px;}
.tts-text { font-weight: bold; font-size: 1rem; color: #333; margin-left: -2px; }
.tts-service-name { font-size: 0.85rem; color: #777; }
.tts-controls-bar { display: flex; align-items: center; gap: 10px; }
.tts-play-btn-main { background: none; border: none; font-size: 1.6rem; color: #555; cursor: pointer; padding: 0; line-height: 1; width: 30px; text-align: center; }
.tts-progress-bar-container { flex-grow: 1; height: 6px; background-color: #e0e0e0; border-radius: 3px; overflow: hidden; }
.tts-progress-bar { height: 100%; background-color: #757575; border-radius: 3px; transition: width 0.1s linear; }
.tts-time { font-size: 0.8rem; color: #555; min-width: 70px; text-align: right; }
.author-info .author-info-layout { display: flex; gap: 25px; align-items: flex-start; }
.author-info .author-photo-container { flex-shrink: 0; }
.author-info .author-avatar, .author-info .author-avatar-placeholder { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; background-color: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #aaa; font-size: 0.9rem; }
.author-info .author-details-container { flex-grow: 1; display: flex; flex-direction: column; gap: 10px; }
.author-info .info-item { display: flex; align-items: flex-start; font-size: 0.95rem; line-height: 1.6; }
.author-info .info-label { font-weight: bold; color: #333; min-width: 90px; flex-shrink: 0; margin-right: 10px; }
.author-info .info-value { color: #555; }
.author-info .bio-text { white-space: pre-line; }
.recommend h2 { margin-bottom: 1rem; }
.recommend-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 15px; }
.rec-item { text-align: left; cursor: pointer; padding: 0; border-radius: 4px; overflow: hidden; }
.rec-cover, .rec-cover-img { width: 100%; height: 160px; background: #f0f0f0; border-radius: 4px; margin-bottom: 8px; object-fit: cover; border: 1px solid #e0e0e0; transition: transform 0.2s ease-in-out; }
.rec-item:hover .rec-cover-img { transform: scale(1.05); }
.rec-title { font-size: 0.9rem; font-weight: bold; color: #444; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rec-author { font-size: 0.8rem; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.reviews hr, .endings hr { border: 0; height: 1px; background-color: #e0e0e0; margin: 0.5rem 0 1.5rem 0; }
.review-item, .ending-item { padding: 1rem 0; border-bottom: 1px solid #f0f0f0; text-decoration: none; display: block; color: inherit; }
.review-item:last-child, .ending-item:last-child { border-bottom: none; }
.rev-title, .end-title { font-size: 1.15rem; font-weight: bold; margin: 0 0 0.5rem 0; color: #333; }
.rev-title small, .end-title small { font-size: 0.85rem; font-weight: normal; color: #777; }
.rev-content, .end-content { font-size: 0.95rem; line-height: 1.6; color: #555; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
.rev-actions, .end-actions { display: flex; align-items: center; gap: 1rem; }
.btn.text-btn { background: none; border: none; color: #777; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; gap: 0.3rem; }
.btn.text-btn:hover { color: #333; }
.action-icon-small { width: 16px; height: 16px; margin-right: 3px; }
.icon-btn { display: inline-flex; align-items: center; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 2rem; }
.page-btn { background-color: transparent; border: 1px solid #ddd; color: #555; padding: 0.5rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.9rem; transition: background-color 0.2s, color 0.2s; }
.page-btn:hover, .page-btn.active { background-color: #555; color: #fff; border-color: #555; }

/* AI 로딩 모달 스타일 */
.ai-loading-modal .modal-content {
  text-align: center;
}

.loading-spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-spinner {
  border: 5px solid #f3f3f3; /* Light grey */
  border-top: 5px solid #555; /* Darker grey for spinner */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
