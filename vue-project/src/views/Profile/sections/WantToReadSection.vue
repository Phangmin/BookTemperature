<template>
  <div class="want-to-read-section">
    <div v-if="isLoading" class="loading-indicator">
      <p>책 목록을 불러오는 중입니다...</p>
    </div>
    <div v-else-if="bookshelf.length === 0" class="empty-bookshelf">
      <p>읽고 싶은 책이 아직 없습니다. 마음에 드는 책을 추가해보세요!</p>
    </div>
    <div v-else class="item-list">
      <div v-for="book in bookshelf" :key="book.id" class="item-card">
        <img :src="book.cover" :alt="book.title + ' cover'" class="cover" v-if="book.cover" @click="goToBookDetail(book.id)"/>
        <div class="cover-placeholder" v-else @click="goToBookDetail(book.id)">표지 없음</div>
        <div class="info" @click="goToBookDetail(book.id)">
          <h3 class="title">{{ book.title }}</h3>
          <p class="author" v-if="book.author">작가: {{ book.author }}</p>
          <p class="desc">{{ book.description || '이 책에 대한 설명이 아직 없습니다.' }}</p>
        </div>
        <div class="actions">
          <button class="btn btn-detail" @click="goToBookDetail(book.id)">도서 상세보기</button>
          <button class="btn btn-action" @click="openModalForReview(book.id)">감상문 작성</button>
          <button class="btn btn-action" @click="openModalForEnding(book.id)">열린 결말 작성</button>
          <button class="btn btn-delete" @click="removeFromBookshelf(book.id)">삭제하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const emit = defineEmits(['update-count', 'open-modal-for-action']); // 'open-modal-for-action' 추가

const app = getCurrentInstance();
const $api = app.appContext.config.globalProperties.$api;
const router = useRouter();

const bookshelf = ref([]);
const isLoading = ref(true);

const fetchBookshelf = async () => {
  isLoading.value = true;
  try {
    const response = await $api.get('/accounts/bookshelf/');
    bookshelf.value = response.data.map(book => ({
      ...book,
      description: book.description || book.summary || '이 책에 대한 설명이 아직 없습니다.'
    }));
    emit('update-count', bookshelf.value.length);
  } catch (error) {
    console.error('읽고 싶은 책 목록을 불러오는데 실패했습니다:', error);
    emit('update-count', 0);
  } finally {
    isLoading.value = false;
  }
};

const goToBookDetail = (bookId) => {
  router.push({ name: 'BookDetail', params: { id: bookId } });
};

const removeFromBookshelf = async (bookId) => {
  if (!confirm('이 책을 읽고 싶은 목록에서 삭제하시겠습니까?')) {
    return;
  }
  try {
    await $api.delete(`/accounts/cart/remove/${bookId}/`);
    const removedBook = bookshelf.value.find(book => book.id === bookId);
    bookshelf.value = bookshelf.value.filter(book => book.id !== bookId);
    if (removedBook) {
      emit('update-count', bookshelf.value.length);
    }
    alert('책이 목록에서 삭제되었습니다.');
  } catch (error) {
    console.error('책 삭제에 실패했습니다:', error);
    alert('책을 삭제하는 중 오류가 발생했습니다.');
  }
};

const openModalForReview = (bookId) => {
  emit('open-modal-for-action', { type: 'review', bookId: bookId });
};

const openModalForEnding = (bookId) => {
  emit('open-modal-for-action', { type: 'ending', bookId: bookId });
};

onMounted(() => {
  fetchBookshelf();
});
</script>

<style scoped>
/* ... 기존 스타일 유지 ... */
.want-to-read-section {
}

.loading-indicator, .empty-bookshelf {
  text-align: center;
  padding: 30px 0;
  color: #777;
  font-size: 1.1rem;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-card {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.item-card:hover {
  /* 호버 효과 없음 */
}

.cover, .cover-placeholder {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1.5rem;
  flex-shrink: 0;
  cursor: pointer;
}

.cover-placeholder {
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-size: 0.9rem;
}

.info {
  flex-grow: 1;
  cursor: pointer;
}

.title {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.author {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.desc {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: calc(1.5em * 2);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
  align-items: flex-start;
  width: 150px;
  flex-shrink: 0;
}

.actions .btn {
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.btn-detail {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ccc;
}
.btn-detail:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: white;
}

.btn-action {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ccc;
}
.btn-action:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: white;
}

.btn-delete {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ccc;
}
.btn-delete:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}
</style>
