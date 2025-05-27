<template>
  <div class="reviews-section">
    <div v-if="isLoading" class="loading-indicator">
      <p>감상문 목록을 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!reviews || reviews.length === 0" class="empty-list">
      <p>작성한 감상문이 아직 없습니다.</p>
    </div>
    <div v-else class="item-list">
      <div v-for="review in reviews" :key="review.id" class="item-card">
        <img :src="review.book?.cover || review.cover" :alt="review.title + ' cover'" class="cover" v-if="review.book?.cover || review.cover" @click="navigateToBookDetail(review.book?.id || review.book_id)"/>
        <div class="cover-placeholder" v-else @click="navigateToBookDetail(review.book?.id || review.book_id)">표지 없음</div>

        <div class="info" @click="navigateToReviewDetail(review)">
          <h3 class="title">{{ review.title }}</h3>
          <p class="book-title" v-if="review.book?.title">도서: {{ review.book.title }}</p>
          <p class="desc">{{ review.content || review.desc }}</p>
        </div>

        <div class="actions">
          <button class="btn btn-detail" @click="navigateToReviewDetail(review)">상세보기</button>
          <button class="btn btn-action" @click="editReview(review)">수정하기</button>
          <button class="btn btn-delete" @click="deleteReview(review.id)">삭제하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  reviews: {
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

const navigateToReviewDetail = (review) => {
  // UserProfile에서 ReviewDetail로 이동하는 로직이 이미 있을 수 있으므로,
  // 여기서는 간단히 bookId와 reviewId를 emit하여 UserProfile에서 처리하도록 할 수 있습니다.
  // 또는 직접 라우팅합니다. 여기서는 직접 라우팅으로 가정합니다.
  if (review.book?.id && review.id) {
    router.push({ name: 'ReviewDetail', params: { bookId: review.book.id, reviewId: review.id } });
  } else if (review.book_id && review.id) { // book_id 필드를 사용할 경우
     router.push({ name: 'ReviewDetail', params: { bookId: review.book_id, reviewId: review.id } });
  } else {
    console.warn('ReviewDetail로 이동하기 위한 정보 부족:', review);
  }
};

const editReview = (review) => {
  emit('edit-item', { type: 'review', item: review });
};

const deleteReview = (reviewId) => {
  if (confirm('이 감상문을 삭제하시겠습니까?')) {
    emit('delete-item', { type: 'review', id: reviewId });
  }
};
</script>

<style scoped>
/* WantToReadSection.vue와 유사한 스타일 적용 */
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
