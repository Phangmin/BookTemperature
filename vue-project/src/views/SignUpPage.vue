<!-- src/views/SignUpPage.vue -->
<template>
  <div class="signup-page">
    <!-- 가입 폼 -->
    <main class="content">
      <div class="form-wrapper">
        <h2>회원가입</h2>
        <form @submit.prevent="handleSubmit">
          <!-- 아이디 + 중복검사 -->
          <div class="field with-check">
            <label for="userId" style="margin-right:1rem;">아이디</label>
            <input id="userId" v-model="userId" type="text" required @input="idCheckMessage = ''" />
            <button type="button" class="btn-check" @click="checkId">중복검사</button>
            <p v-if="idCheckMessage" :class="['msg', idAvailable === true ? 'success' : 'error']" style="margin-left:70px; margin-top:0.25rem;">
              {{ idCheckMessage }}
            </p>
          </div>

          <!-- 비밀번호 -->
          <div class="field">
            <label for="password">비밀번호</label>
            <input id="password" v-model="password" type="password" required />
            <small class="hint">* 영문 대/소문자 구분, 숫자 조합</small>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="field">
            <label for="confirm">비밀번호 확인</label>
            <input id="confirm" v-model="confirm" type="password" required />
            <p v-if="confirm && password === confirm" class="msg success">
              ✔ 비밀번호가 일치합니다.
            </p>
            <p v-else-if="confirm" class="msg error">
              ✘ 비밀번호가 일치하지 않습니다.
            </p>
          </div>

          <!-- 이름 -->
          <div class="field">
            <label for="name">이름</label>
            <input id="name" v-model="name" type="text" required />
          </div>

          <!-- 닉네임 + 중복검사 -->
          <div class="field with-check">
            <label for="nickname" style="margin-right:1rem;">닉네임</label>
            <input id="nickname" v-model="nickname" type="text" required @input="nickCheckMessage = ''" />
            <button type="button" class="btn-check" @click="checkNickname">중복검사</button>
            <p v-if="nickCheckMessage" :class="['msg', nickAvailable === true ? 'success' : 'error']" style="margin-left:70px; margin-top:0.25rem;">
              {{ nickCheckMessage }}
            </p>
          </div>

          <!-- 연락처 -->
          <div class="field">
            <label for="phone">연락처</label>
            <input id="phone" v-model="phone" type="tel" required @input="formatPhone" />
          </div>

          <!-- 이메일 + 중복검사 -->
          <div class="field with-check">
            <label for="email" style="margin-right:1rem;">이메일</label>
            <input id="email" v-model="email" type="email" required @input="emailCheckMessage = ''" />
            <button type="button" class="btn-check" @click="checkEmail">중복검사</button>
            <p v-if="emailCheckMessage" :class="['msg', emailAvailable === true ? 'success' : 'error']" style="margin-left:70px; margin-top:0.25rem;">
              {{ emailCheckMessage }}
            </p>
          </div>

          <!-- 선호 카테고리 -->
          <div class="field categories">
            <label>선호 도서 카테고리 <small>(복수 선택 가능)</small></label>
            <div class="category-list">
              <button v-for="cat in categoryList" :key="cat.id" type="button" class="btn-category"
                :class="{ selected: selectedCats.includes(cat.id) }" @click="toggleCategory(cat.id)">
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- 제출 버튼 -->
          <button type="submit" class="btn-submit" :disabled="!formValid">
            회원가입 완료
          </button>
        </form>
      </div>
    </main>

    <!-- 가입 완료 팝업 -->
    <div v-if="showWelcome" class="welcome-modal">
      <div class="modal-content">
        <!-- 이미지 자리 (회색 네모) -->
        <div class="modal-image"> </div>
        <h2>{{ name }}님 가입을 환영합니다!</h2>
        <p>당신의 책 이야기를 기다리고 있었어요.</p>
        <p>이곳은 책을 사랑하는 사람들이 서로의 온기를 나누는 공간입니다.</p>
        <p>감동적인 한 줄, 인상 깊은 장면, 마음속 작은 떨림까지 함께 나눠주세요.</p>
        <p>지금부터, 당신의 서재에 온도를 더해볼까요?</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // Pinia 스토어 import

const app = getCurrentInstance()
const $api = app.appContext.config.globalProperties.$api
const router = useRouter()
const userStore = useUserStore() // Pinia 스토어 사용

// form state
const userId = ref('')
const idAvailable = ref(null)
const idCheckMessage = ref('')
const password = ref('')
const confirm = ref('')
const name = ref('')
const nickname = ref('')
const nickAvailable = ref(null)
const nickCheckMessage = ref('') // 닉네임 검사 메시지
const phone = ref('')
const email = ref('')
const emailAvailable = ref(null)
const emailCheckMessage = ref('')
const categoryList = [
  { id: 1, label: '소설/시/희곡' },
  { id: 2, label: '경제/경영' },
  { id: 3, label: '자기개발' },
  { id: 4, label: '인문/교양' },
  { id: 5, label: '취미/실용' },
  { id: 6, label: '어린이/청소년' },
  { id: 7, label: '과학' },
]
const selectedCats = ref([])

const showWelcome = ref(false)

async function checkId() {
  idCheckMessage.value = '';
  if (!userId.value) {
    idAvailable.value = null;
    idCheckMessage.value = '아이디를 입력해주세요.';
    return;
  }
  try {
    const response = await $api.get('/auth/check-username/', { params: { username: userId.value } }); // '/accounts/' -> '/auth/'로 변경
    idAvailable.value = response.data.available;
    if (response.data.available) {
      idCheckMessage.value = '✔ 입력하신 아이디를 사용할 수 있습니다.';
    } else {
      idCheckMessage.value = '✘ 이미 등록된 아이디입니다.';
    }
  } catch (error) {
    console.error("아이디 중복 검사 실패:", error);
    idAvailable.value = null;
    idCheckMessage.value = '✘ 아이디 중복 검사 중 오류가 발생했습니다.';
  }
}

async function checkNickname() {
  nickCheckMessage.value = ''; // 메시지 초기화
  if (!nickname.value) {
    nickAvailable.value = null;
    nickCheckMessage.value = '닉네임을 입력해주세요.';
    return;
  }
  try {
    const response = await $api.get('/auth/check-nickname/', { params: { nickname: nickname.value } }); // '/accounts/' -> '/auth/'로 변경
    nickAvailable.value = response.data.available;
    if (response.data.available) {
      nickCheckMessage.value = '✔ 사용 가능한 닉네임입니다.';
    } else {
      nickCheckMessage.value = '✘ 이미 사용 중인 닉네임입니다.';
    }
  } catch (error) {
    console.error("닉네임 중복 검사 실패:", error);
    nickAvailable.value = null;
    nickCheckMessage.value = '✘ 닉네임 중복 검사 중 오류가 발생했습니다.';
  }
}

async function checkEmail() {
  emailCheckMessage.value = ''; // 메시지 초기화
  if (!email.value) {
    emailAvailable.value = null;
    emailCheckMessage.value = '이메일을 입력해주세요.';
    return;
  }
  // 간단한 이메일 형식 유효성 검사 (정규식 사용)
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value)) {
    emailAvailable.value = null;
    emailCheckMessage.value = '✘ 올바른 이메일 형식이 아닙니다.';
    return;
  }
  try {
    const response = await $api.get('/auth/check-email/', { params: { email: email.value } }); // '/accounts/' -> '/auth/'로 변경
    emailAvailable.value = response.data.available;
    if (response.data.available) {
      emailCheckMessage.value = '✔ 사용 가능한 이메일입니다.';
    } else {
      emailCheckMessage.value = '✘ 이미 등록된 이메일입니다.';
    }
  } catch (error) {
    console.error("이메일 중복 검사 실패:", error);
    emailAvailable.value = null;
    emailCheckMessage.value = '✘ 이메일 중복 검사 중 오류가 발생했습니다.';
  }
}

function toggleCategory(id) {
  selectedCats.value = selectedCats.value.includes(id)
    ? selectedCats.value.filter(x => x !== id)
    : [...selectedCats.value, id]
}

const formValid = computed(() => {
  return (
    idAvailable.value === true &&
    password.value &&
    password.value === confirm.value &&
    name.value &&
    nickAvailable.value === true &&
    emailAvailable.value === true && // 이메일 사용 가능 여부 추가
    phone.value &&
    email.value &&
    selectedCats.value.length > 0
  )
})

// 입력된 값을 실시간으로 010-1234-5678 형태로 포맷팅
function formatPhone() {
  let digits = phone.value.replace(/\D/g, '')
  if (digits.length <= 3) {
    phone.value = digits
  } else if (digits.length <= 7) {
    phone.value = digits.slice(0, 3) + '-' + digits.slice(3)
  } else {
    phone.value =
      digits.slice(0, 3) +
      '-' +
      digits.slice(3, 7) +
      '-' +
      digits.slice(7, 11)
  }
}

async function handleSubmit() {
  if (!formValid.value) {
    if (idAvailable.value !== true) {
        idCheckMessage.value = idCheckMessage.value || '아이디 중복 검사를 완료해주세요.';
    }
    if (nickAvailable.value !== true) {
        nickCheckMessage.value = nickCheckMessage.value || '닉네임 중복 검사를 완료해주세요.';
    }
    if (emailAvailable.value !== true) {
        emailCheckMessage.value = emailCheckMessage.value || '이메일 중복 검사를 완료해주세요.';
    }
    return;
  }

  const payload = {
    username: userId.value,
    password1: password.value,
    password2: confirm.value,
    email: email.value,
    name: name.value,
    phone_number: phone.value.replace(/\D/g, ''),
    nickname: nickname.value,
    favorite_categories: selectedCats.value.map(id => categoryList.find(cat => cat.id === id)?.label)
  };

  try {
    const response = await $api.post('/auth/signup/', payload); // '/accounts/' -> '/auth/'로 변경
    console.log('회원가입 성공:', response.data);

    if (response.data && response.data.key) {
      const token = response.data.key;
      userStore.setToken(token);
      await userStore.fetchUser();

      showWelcome.value = true;
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } else {
      console.warn('회원가입은 성공했으나 응답에서 토큰을 찾을 수 없습니다. 백엔드 응답 확인 필요:', response.data);
      alert('회원가입은 성공했으나, 자동 로그인 처리 중 문제가 발생했습니다. 다시 로그인해주세요.');
      router.push('/login');
    }

  } catch (error) {
    console.error('회원가입 또는 로그인 실패:', error.response ? error.response.data : error);
    let errorMessage = '회원가입 중 오류가 발생했습니다.';
    if (error.response && error.response.data) {
      const errors = error.response.data;
      if (errors.username) errorMessage = `아이디: ${errors.username.join(', ')}`;
      else if (errors.email) errorMessage = `이메일: ${errors.email.join(', ')}`;
      else if (errors.nickname) errorMessage = `닉네임: ${errors.nickname.join(', ')}`;
      else if (errors.password) errorMessage = `비밀번호: ${errors.password.join(', ')}`;
      else if (errors.non_field_errors) errorMessage = errors.non_field_errors.join(', ');
    }
    alert(errorMessage);
  }
}
</script>

<style scoped>
/* ── 레이아웃 ───────────────────────────────────── */
.signup-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem 1rem;
}

.form-wrapper {
  background: #fff;
  padding: 2.5rem 2rem;
  width: 600px;
  border-radius: 8px;
}

.form-wrapper h2 {
  margin: 0 0 1rem;
  font-size: 1.6rem;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.5rem;
}

/* 입력 필드 */
.field {
  margin-bottom: 1.5rem;
  position: relative;
}

.field .msg {
  position: static;
  margin-top: 0.25rem;
  font-size: 0.8rem;
}

.field.with-check {
  position: relative;
  padding-bottom: 1.8rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.field.with-check .msg {
  width: 100%;
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
}

.field.with-check input {
  flex: 1;
}

.field.with-check .btn-check {
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f4a261;
  border: none;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #555;
}

.field input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.field input:focus {
  border-color: #ffc93c;
}

.field .hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #999;
}

/* 중복검사 메시지 */
.msg {
  /* position: absolute; */
  left: 4rem;
  bottom: -1.2rem;
  font-size: 0.8rem;
}

.msg.success {
  color: #2a9d8f;
}

.msg.error {
  color: #e76f51;
}

/* 카테고리 */
.categories .category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-category {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-category.selected {
  background: #ffc93c;
  border-color: #ffc93c;
  color: #fff;
}

/* 제출 버튼 */
.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background: #d3d3d3;
  color: #fff;
  font-size: 1rem;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-submit:not(:disabled):hover {
  background: #ffb700;
}

/* ── 가입 완료 모달 ───────────────────────────── */
.welcome-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.modal-image {
  width: 120px;
  height: 120px;
  background: #ddd;
  margin: 0 auto 1rem;
  border-radius: 8px;
}

.modal-content h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.modal-content p {
  margin: 0.5rem 0;
  color: #555;
  font-size: 0.95rem;
}
</style>
