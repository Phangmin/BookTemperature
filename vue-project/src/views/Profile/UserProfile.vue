<!-- src/views/Profile/UserProfile.vue -->
<template>
  <div class="user-profile">
    <aside class="sidebar">
      <div class="avatar-wrapper">
        <img class="avatar" :src="userProfile.profile_image || defaultAvatar" alt="유저 아바타" />
        <h2 class="username">{{ userProfile.nickname || userProfile.username }}</h2>
        <button v-if="isCurrentUserProfile" class="btn edit-btn" @click="goToEditProfile">회원 정보 수정</button>
        <button v-else @click="toggleFollow" :class="['btn', isFollowing ? 'following-btn' : 'follow-btn']">
          {{ isFollowing ? '팔로잉' : '팔로우' }}
        </button>
      </div>
      <div class="stats">
        <div class="stat" @click="openFollowingModal" style="cursor: pointer;">
          <span class="number">{{ userProfile.following_count }}</span>
          <span class="label">팔로잉</span>
        </div>
        <div class="stat" @click="openFollowersModal" style="cursor: pointer;">
          <span class="number">{{ userProfile.followers_count }}</span>
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

    <section class="main-content">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.key" :class="{ active: currentTab === tab.key }"
          @click="currentTab = tab.key">
          {{ tab.label }} ({{ tab.count }})
        </button>
      </div>

      <div class="tab-panel">
        <ReviewsSection
          v-if="currentTab === 'reviews'"
          :reviews="reviews"
          :isLoading="isLoadingSectionData"
          @edit-item="handleEditItem"
          @delete-item="handleDeleteItem"
          @navigate-to-book="navigateToBookDetail"
        />
        <EndingsSection
          v-if="currentTab === 'endings'"
          :endings="endings"
          :isLoading="isLoadingSectionData"
          @edit-item="handleEditItem"
          @delete-item="handleDeleteItem"
          @navigate-to-book="navigateToBookDetail"
        />
        <WantToReadSection
          v-if="currentTab === 'wantToRead'"
          :books="wantToReadBooks"
          :isLoading="isLoadingSectionData"
          @update-count="updateWantToReadCount"
          @open-modal-for-action="handleWantToReadActionModal"
          @book-removed="handleBookRemovedFromWantToRead"
          @navigate-to-book="navigateToBookDetail"
        />
        <ReadBooksSection
          v-if="currentTab === 'read'"
          :books="readBooks"
          :isLoading="isLoadingSectionData"
          @open-modal-for-action="handleReadBooksActionModal"
          @navigate-to-book="navigateToBookDetail"
        />
      </div>
    </section>

    <FollowModal :show="showFollowingModal" title="팔로잉" :users="followingList" :isLoading="isLoadingFollowing" :message="'아직 팔로우하는 사람이 없습니다.'" @close="closeModal('following')" />
    <FollowModal :show="showFollowersModal" title="팔로워" :users="followersList" :isLoading="isLoadingFollowers" :message="'아직 팔로워가 없습니다.'" @close="closeModal('followers')" />

    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-content">
        <h3>{{ editingReview ? '감상평 수정하기' : '감상평 작성하기' }}</h3>
        <input type="text" v-model="newReviewTitle" placeholder="감상평 제목" class="modal-input"/>
        <textarea v-model="newReviewContent" placeholder="감상평 내용" rows="5" class="modal-textarea"></textarea>
        <div class="modal-actions">
          <button @click="submitReview" class="btn-primary">{{ editingReview ? '수정' : '등록' }}</button>
          <button @click="closeReviewModal" class="btn-secondary">취소</button>
        </div>
      </div>
    </div>

    <div v-if="showEndingModal" class="modal-overlay" @click.self="closeEndingModal">
      <div class="modal-content">
        <h3>{{ editingEnding ? '열린 결말 수정하기' : '열린 결말 작성하기' }}</h3>
        <input type="text" v-model="newEndingTitle" placeholder="열린 결말 제목" class="modal-input"/>
        <textarea v-model="newEndingContent" placeholder="열린 결말 내용" rows="5" class="modal-textarea"></textarea>
        <div class="modal-actions">
          <button @click="submitEnding" class="btn-primary">{{ editingEnding ? '수정' : '등록' }}</button>
          <button @click="closeEndingModal" class="btn-secondary">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, getCurrentInstance, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import FollowModal from '@/components/FollowModal.vue';
  import WantToReadSection from './sections/WantToReadSection.vue';
  import ReviewsSection from './sections/ReviewsSection.vue';
  import EndingsSection from './sections/EndingsSection.vue';
  import ReadBooksSection from './sections/ReadBooksSection.vue';
  import defaultAvatar from '@/assets/avatar.jpg';

  const app = getCurrentInstance();
  const $api = app.appContext.config.globalProperties.$api;
  const route = useRoute();
  const router = useRouter();
  const userStore = useUserStore();

  const profileUserId = ref(null);
  const loggedInUser = computed(() => userStore.user);
  const isFollowing = ref(false);
  const isLoadingSectionData = ref(false);

  const showFollowingModal = ref(false);
  const showFollowersModal = ref(false);
  const followingList = ref([]);
  const followersList = ref([]);
  const isLoadingFollowing = ref(false);
  const isLoadingFollowers = ref(false);
  const userProfile = ref({ id: null, username: '사용자', profile_image: null, following_count: 0, followers_count: 0 });

  const wantToReadCount = ref(0);
  const wantToReadBooks = ref([]);
  const reviews = ref([]);
  const endings = ref([]);
  const readBooks = ref([]);

  const isCurrentUserProfile = computed(() => profileUserId.value && loggedInUser.value?.id?.toString() === profileUserId.value);
  const temp = ref(75);

  const showReviewModal = ref(false);
  const newReviewTitle = ref('');
  const newReviewContent = ref('');
  const currentBookIdForModal = ref(null);
  const editingReview = ref(null);

  const showEndingModal = ref(false);
  const newEndingTitle = ref('');
  const newEndingContent = ref('');
  const editingEnding = ref(null);

  function getBookIdFromItem(item) {
    if (typeof item === 'object' && item !== null) {
      return item.book_id || item.book?.id || item.id;
    }
    return item; // item 자체가 ID인 경우
  }

  function handleOpenReviewModal(bookIdOrItem) {
    const bookId = getBookIdFromItem(bookIdOrItem);
    if (!bookId) {
      console.error("유효한 책 ID를 찾을 수 없습니다.", bookIdOrItem);
      alert("오류: 책 정보를 찾을 수 없습니다.");
      return;
    }
    currentBookIdForModal.value = bookId;
    editingReview.value = null;
    newReviewTitle.value = '';
    newReviewContent.value = '';
    showReviewModal.value = true;
  }

  function openReviewModalForEdit(reviewItem) {
    editingReview.value = reviewItem;
    currentBookIdForModal.value = getBookIdFromItem(reviewItem.book || reviewItem); // 감상평 객체에서 책 ID 추출
    newReviewTitle.value = reviewItem.title;
    newReviewContent.value = reviewItem.content;
    showReviewModal.value = true;
  }
  function closeReviewModal() { showReviewModal.value = false; editingReview.value = null; }

  async function submitReview() {
    // ... (이전과 동일, API 경로 수정됨)
    if (!newReviewTitle.value.trim() || !newReviewContent.value.trim()) {
      alert('감상평 제목과 내용을 모두 입력해주세요.'); return;
    }
    if (!currentBookIdForModal.value && !editingReview.value) {
      alert('오류: 책 ID가 지정되지 않았습니다.'); return;
    }
    const payload = { title: newReviewTitle.value, content: newReviewContent.value };
    try {
      if (editingReview.value) {
        alert('감상평 수정 API 연동 필요');
      } else {
        await $api.post(`/books/${currentBookIdForModal.value}/thread/create/`, payload);
      }
      alert(editingReview.value ? '감상평이 수정되었습니다.' : '감상평이 등록되었습니다.');
      await fetchMyData();
      if (!editingReview.value) moveBookToRead(currentBookIdForModal.value);
      closeReviewModal();
    } catch (error) {
      console.error('감상평 처리 실패:', error.response?.data || error.message);
      alert(`감상평 처리에 실패했습니다: ${error.response?.data?.detail || error.message}`);
    }
  }

  function handleOpenEndingModal(bookIdOrItem) {
    const bookId = getBookIdFromItem(bookIdOrItem);
     if (!bookId) {
      console.error("유효한 책 ID를 찾을 수 없습니다.", bookIdOrItem);
      alert("오류: 책 정보를 찾을 수 없습니다.");
      return;
    }
    currentBookIdForModal.value = bookId;
    editingEnding.value = null;
    newEndingTitle.value = '';
    newEndingContent.value = '';
    showEndingModal.value = true;
  }
  function openEndingModalForEdit(endingItem) {
    editingEnding.value = endingItem;
    currentBookIdForModal.value = getBookIdFromItem(endingItem.book || endingItem);
    newEndingTitle.value = endingItem.title;
    newEndingContent.value = endingItem.content;
    showEndingModal.value = true;
  }
  function closeEndingModal() { showEndingModal.value = false; editingEnding.value = null; }

  async function submitEnding() {
    // ... (이전과 동일, API 경로 수정됨)
    if (!newEndingTitle.value.trim() || !newEndingContent.value.trim()) {
      alert('열린 결말 제목과 내용을 모두 입력해주세요.'); return;
    }
    if (!currentBookIdForModal.value && !editingEnding.value) {
      alert('오류: 책 ID가 지정되지 않았습니다.'); return;
    }
    const payload = { title: newEndingTitle.value, content: newEndingContent.value };
    try {
      if (editingEnding.value) {
         alert('열린결말 수정 API 연동 필요');
      } else {
        await $api.post(`/books/${currentBookIdForModal.value}/open-endings/`, payload);
      }
      alert(editingEnding.value ? '열린 결말이 수정되었습니다.' : '열린 결말이 등록되었습니다.');
      await fetchMyData();
      if (!editingEnding.value) moveBookToRead(currentBookIdForModal.value);
      closeEndingModal();
    } catch (error) {
      console.error('열린 결말 처리 실패:', error.response?.data || error.message);
      alert(`열린 결말 처리에 실패했습니다: ${error.response?.data?.detail || error.message}`);
    }
  }

  function moveBookToRead(bookId) {
    const bookIndex = wantToReadBooks.value.findIndex(book => getBookIdFromItem(book) === bookId);
    if (bookIndex > -1) {
      const bookToMove = wantToReadBooks.value.splice(bookIndex, 1)[0];
      updateWantToReadCount(wantToReadBooks.value.length);
      if (!readBooks.value.find(book => getBookIdFromItem(book) === bookId)) {
        readBooks.value.push(bookToMove);
      }
    }
  }

  const handleWantToReadActionModal = (payload) => {
    if (payload.type === 'review') handleOpenReviewModal(payload.bookId);
    else if (payload.type === 'ending') handleOpenEndingModal(payload.bookId);
  };
  const handleReadBooksActionModal = (payload) => {
    if (payload.type === 'review') handleOpenReviewModal(payload.bookId);
    else if (payload.type === 'ending') handleOpenEndingModal(payload.bookId);
  };

  async function fetchMyReviews() { /* ... */ }
  async function fetchMyEndings() { /* ... */ }
  async function fetchWantToReadBooksData() { /* ... */ }
  async function fetchReadBooks() { /* ... */ }
  async function fetchMyData() { /* ... */ }
  const handleBookRemovedFromWantToRead = (bookId) => { /* ... */ };

  const tabs = computed(() => [
    { key: 'reviews', label: '나의 감상문', count: reviews.value.length },
    { key: 'endings', label: '나의 열린 결말', count: endings.value.length },
    { key: 'wantToRead', label: '읽고 싶은 책', count: wantToReadCount.value },
    { key: 'read', label: '다 읽은 책', count: readBooks.value.length },
  ]);
  const currentTab = ref('reviews');
  const updateWantToReadCount = (count) => { wantToReadCount.value = count; };

  // itemsMap은 이제 각 Section 컴포넌트가 자체적으로 데이터를 관리하므로 UserProfile에서 직접 사용하지 않음.
  // const itemsMap = computed(() => ({}));

  const navigateToBookDetail = (bookId) => { if (bookId) router.push({ name: 'BookDetail', params: { id: bookId } }); };

  const handleDeleteItem = async (itemOrId, tabKeyOrType) => {
    // ... (삭제 로직은 API 연동 후 구체화 필요) ...
    alert(`삭제 기능 구현 필요: ${tabKeyOrType} - ID: ${getBookIdFromItem(itemOrId)}`);
  };

  const handleEditItem = (payload) => {
    if (payload.type === 'review') openReviewModalForEdit(payload.item);
    else if (payload.type === 'ending') openEndingModalForEdit(payload.item);
  };

  async function checkFollowStatus() { /* ... */ }
  async function toggleFollow() { /* ... */ }
  onMounted(async () => { /* ... */ });
  watch(() => route.params.userId, async (newRouteUserId) => { /* ... */ });
  watch(loggedInUser, async (newUser) => { /* ... */ }, { immediate: true });
  async function loadProfileData() { /* ... */ }
  async function fetchUserProfileFromAPI(userIdToFetch) { /* ... */ }
  const openFollowingModal = async () => { /* ... */ };
  const openFollowersModal = async () => { /* ... */ };
  const closeModal = (type) => { /* ... */ };
  const goToEditProfile = () => router.push({ name: 'UserEditProfile' });

</script>

<style scoped>
/* ... (기존 스타일과 동일) ... */
.user-profile { display: flex; min-height: 100vh; background: #faf9f5; }
.sidebar { width: 280px; background: #fff; padding: 2rem 1.5rem; border-right: 1px solid #e0e0e0; }
.avatar-wrapper { text-align: center; margin-bottom: 2rem; }
.avatar { width: 160px; height: 160px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; }
.username { margin: 0; font-size: 1.25rem; font-weight: 600; }
.edit-btn, .follow-btn, .following-btn { margin-top: 0.75rem; padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 4px; font-size: 0.9rem; cursor: pointer; width: 100%; box-sizing: border-box; }
.edit-btn { background: #f0f0f0; color: #333; }
.follow-btn { background: #007bff; color: white; border-color: #007bff; }
.follow-btn:hover { background: #0056b3; }
.following-btn { background: #6c757d; color: white; border-color: #6c757d; }
.following-btn:hover { background: #545b62; }
.stats { display: flex; justify-content: space-around; margin: 2rem 0; }
.stat .number { display: block; font-size: 1.25rem; font-weight: bold; }
.stat .label { color: #666; }
.temperature { margin-top: 1rem; }
.temperature .label { display: block; font-size: 0.9rem; margin-bottom: 0.5rem; color: #333; }
.temp-bar { position: relative; width: 100%; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
.temp-bar .fill { height: 100%; background: #ffc93c; }
.temp-bar .temp-marker { position: absolute; top: -12px; transform: translateX(-50%); font-size: 1rem; }
.temp-value { text-align: center; margin-top: 0.25rem; font-size: 0.9rem; color: #333; }
.main-content { flex: 1; padding: 0 2rem 2rem; background-color: #fff; }
.tabs { display: flex; border-bottom: 2px solid #e67e22; margin-bottom: 0; }
.tabs button { background-color: #f0f2f5; border: 1px solid #dcdfe6; border-bottom: none; padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; border-top-left-radius: 8px; border-top-right-radius: 8px; color: #606266; margin-right: -1px; position: relative; transition: all 0.3s ease; }
.tabs button.active { background-color: #fff; color: #303133; border-left-color: #e67e22; border-right-color: #e67e22; border-top: 3px solid #e67e22; border-bottom-color: #fff; z-index: 1; margin-bottom: -2px; padding-bottom: calc(0.75rem + 2px); }
.tab-panel { background: #fff; padding: 1.5rem; border-radius: 0 0 8px 8px; }
.item-list { display: flex; flex-direction: column; gap: 1rem; }
.item-card { display: flex; align-items: flex-start; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; transition: none; }
.item-card:hover { /* 호버 효과 없음 */ }
.cover { width: 60px; height: 90px; object-fit: cover; border-radius: 4px; margin-right: 1rem; cursor: pointer; }
.info { flex: 1; cursor: pointer; }
.title { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; }
.desc { margin: 0; font-size: 0.9rem; color: #555; line-height: 1.4; }
.actions { display: flex; flex-direction: column; gap: 0.5rem; margin-left: 1rem; align-items: flex-start; width: 150px; flex-shrink: 0; }
.actions .btn { padding: 0.5rem 0.8rem; border-radius: 4px; font-size: 0.85rem; cursor: pointer; width: 100%; text-align: center; transition: background-color 0.2s, border-color 0.2s, color 0.2s; border: 1px solid #ccc; }
.btn-detail, .actions .btn-action { background-color: #f8f9fa; color: #333; border: 1px solid #ccc; }
.btn-detail:hover, .actions .btn-action:hover { background-color: #ffc107; border-color: #ffc107; color: white; }
.btn-delete { background-color: #f8f9fa; color: #333; border: 1px solid #ccc; }
.btn-delete:hover { background-color: #dc3545; border-color: #dc3545; color: white; }
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
</style>
