<template>
  <div class="endings-section">
    <div v-if="isLoading" class="loading-indicator">
      <p>열린 결말 목록을 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!endings || endings.length === 0" class="empty-list">
      <p>작성한 열린 결말이 아직 없습니다.</p>
    </div>
    <div v-else class="item-list">
      <div v-for="ending in endings" :key="ending.id" class="item-card">
        <img :src="ending.book?.cover || ending.cover" :alt="ending.title + ' cover'" class="cover" v-if="ending.book?.cover || ending.cover" @click="navigateToBookDetail(ending.book?.id || ending.book_id)"/>
        <div class="cover-placeholder" v-else @click="navigateToBookDetail(ending.book?.id || ending.book_id)">표지 없음</div>

        <div class="info" @click="navigateToEndingDetail(ending)">
          <h3 class="title">{{ ending.title }}</h3>
          <p class="book-title" v-if="ending.book?.title">도서: {{ ending.book.title }}</p>
          <p class="desc">{{ ending.content || ending.desc }}</p>
        </div>

        <div class="actions">
          <button class="btn btn-detail" @click="navigateToEndingDetail(ending)">상세보기</button>
          <button class="btn btn-action" @click="editEnding(ending)">수정하기</button>
          <button class="btn btn-delete" @click="deleteEnding(ending.id)">삭제하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  endings: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit-item', 'delete-item', 'navigate-to-book']);

const router = useRouter();

const navigateToBookDetail = (bookId) => {
  if (bookId) {
    emit('navigate-to-book', bookId);
  }
};

const navigateToEndingDetail = (ending) => {
  if (ending.book?.id && ending.id) {
    router.push({ name: 'EndingDetail', params: { bookId: ending.book.id, endingId: ending.id } });
  } else if (ending.book_id && ending.id) {
     router.push({ name: 'EndingDetail', params: { bookId: ending.book_id, endingId: ending.id } });
  } else {
    console.warn('EndingDetail로 이동하기 위한 정보 부족:', ending);
  }
};

const editEnding = (ending) => {
  emit('edit-item', { type: 'ending', item: ending });
};

const deleteEnding = (endingId) => {
  if (confirm('이 열린 결말을 삭제하시겠습니까?')) {
    emit('delete-item', { type: 'ending', id: endingId });
  }
};
</script>

<style scoped>
/* ReviewsSection.vue와 동일한 스타일 적용 */
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
.book-title {
  font-size: 0.85rem;
  color: #777;
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
