<template>
  <div class="read-books-section">
    <div v-if="isLoading" class="loading-indicator">
      <p>다 읽은 책 목록을 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!books || books.length === 0" class="empty-list">
      <p>다 읽은 책이 아직 없습니다.</p>
    </div>
    <div v-else class="item-list">
      <div v-for="book in books" :key="book.id" class="item-card">
        <img :src="book.cover" :alt="book.title + ' cover'" class="cover" v-if="book.cover" @click="navigateToBookDetail(book.id)"/>
        <div class="cover-placeholder" v-else @click="navigateToBookDetail(book.id)">표지 없음</div>

        <div class="info" @click="navigateToBookDetail(book.id)">
          <h3 class="title">{{ book.title }}</h3>
          <p class="author" v-if="book.author">작가: {{ book.author }}</p>
          <p class="desc">{{ book.description || book.summary || '이 책에 대한 설명이 아직 없습니다.' }}</p>
        </div>

        <div class="actions">
          <button class="btn btn-detail" @click="navigateToBookDetail(book.id)">도서 상세보기</button>
          <button class="btn btn-action" @click="openReviewModal(book.id)">감상문 작성</button>
          <button class="btn btn-action" @click="openEndingModal(book.id)">열린 결말 작성</button>
          <!-- <button class="btn btn-delete" @click="removeFromRead(book.id)">목록에서 제거</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
// import { useRouter } from 'vue-router'; // 직접 라우팅 안 할 경우 제거 가능

const props = defineProps({
  books: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['open-modal-for-action', 'navigate-to-book']);
// const router = useRouter(); // 직접 라우팅 안 할 경우 제거 가능

const navigateToBookDetail = (bookId) => {
  if (bookId) {
    emit('navigate-to-book', bookId);
  }
};

const openReviewModal = (bookId) => {
  emit('open-modal-for-action', { type: 'review', bookId: bookId });
};

const openEndingModal = (bookId) => {
  emit('open-modal-for-action', { type: 'ending', bookId: bookId });
};

// const removeFromRead = (bookId) => {
//   if (confirm('이 책을 다 읽은 목록에서 제거하시겠습니까? (감상평/열린결말은 유지됩니다)')) {
//     emit('remove-from-read', bookId);
//   }
// };
</script>

<style scoped>
/* WantToReadSection.vue/ReviewsSection.vue와 동일한 스타일 적용 */
.loading-indicator, .empty-list {
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
  transition: none;
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
  margin: 0 0 0.25rem;
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
  border: 1px solid #ccc;
}
.btn-detail, .actions .btn-action {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ccc;
}
.btn-detail:hover, .actions .btn-action:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: white;
}
/* .btn-delete 스타일은 ReadBooksSection에서는 일단 제외하거나 다르게 처리 */
</style>
