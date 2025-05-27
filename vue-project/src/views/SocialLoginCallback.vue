<template>
  <div class="callback-page">
    <p>소셜 로그인 콜백 페이지입니다. 현재는 기능이 비활성화되어 있습니다.</p>
    <p>홈으로 이동합니다...</p>
    <!--
    <p v-if="processing">소셜 로그인 처리 중...</p>
    <p v-if="error" class="error-message">오류: {{ error }}</p>
    -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // useRoute는 현재 사용 안 함
// import { useUserStore } from '@/stores/user'; // Pinia 스토어 현재 사용 안 함

const router = useRouter();
// const route = useRoute();
// const userStore = useUserStore();

// const processing = ref(true);
// const error = ref(null);

onMounted(() => {
  // 현재 소셜 로그인 로직을 사용하지 않으므로, 바로 홈으로 리다이렉트하거나 메시지만 표시합니다.
  console.log('SocialLoginCallback.vue: 소셜 로그인 기능 비활성화 상태입니다.');
  setTimeout(() => {
    router.replace('/'); // 잠시 후 홈으로 리다이렉트
  }, 3000); // 3초 후 이동

  /*
  const accessToken = route.query.access_token;
  const refreshToken = route.query.refresh_token;

  if (accessToken) {
    userStore.setTokens(accessToken, refreshToken);
    userStore.fetchUser();
    router.replace('/');
    processing.value = false;
  } else {
    console.warn('소셜 로그인 콜백: access_token이 쿼리 파라미터에 없습니다.');
    userStore.fetchUser().then(() => {
      if (userStore.isLoggedIn) {
        router.replace('/');
      } else {
        error.value = '소셜 로그인에 실패했습니다. 토큰을 받지 못했습니다.';
        processing.value = false;
      }
    }).catch(err => {
      error.value = `소셜 로그인 처리 중 오류 발생: ${err.message}`;
      processing.value = false;
    });
  }
  */
});
</script>

<style scoped>
.callback-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
}
.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
