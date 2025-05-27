<!-- src/components/FollowModal.vue -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="close-button" @click="closeModal">&times;</button>
      <h3>{{ title }}</h3>
      <div v-if="isLoading" class="loading-spinner">
        <p>로딩 중...</p>
      </div>
      <div v-else-if="users && users.length > 0" class="user-list">
        <div v-for="user in users" :key="user.id" class="user-item">
          <img :src="user.avatar || defaultAvatar" alt="User Avatar" class="avatar" />
          <span class="username">{{ user.username }}</span>
          <!-- 필요한 경우 팔로우/언팔로우 버튼 추가 -->
        </div>
      </div>
      <div v-else class="empty-message">
        <p>{{ message || '목록이 비어있습니다.' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, watchEffect } from 'vue'; // watchEffect 추가
import defaultAvatar from '@/assets/avatar.jpg'; // 기본 아바타 이미지 경로

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  users: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  message: { // 팔로잉/팔로워가 없을 때 표시할 메시지
    type: String,
    default: '아직 관련 사용자가 없습니다.'
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  position: relative;
  max-height: 80vh;
  overflow-y: auto;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
  text-align: center;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-item:hover {
  background-color: #f9f9f9;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
  border: 2px solid #ddd;
}

.username {
  font-size: 1rem;
  color: #555;
  font-weight: 500;
}

.loading-spinner p,
.empty-message p {
  text-align: center;
  color: #777;
  font-size: 1rem;
  padding: 20px 0;
}
</style>
