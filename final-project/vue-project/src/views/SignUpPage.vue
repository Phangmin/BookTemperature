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
            <input id="userId" v-model="userId" type="text" required />
            <button type="button" class="btn-check" @click="checkId">중복검사</button>
            <p v-if="idAvailable===true" class="msg success" style="margin-left:70px; margin-top:0.25rem;">
              ✔ 입력하신 아이디를 사용할 수 있습니다.
            </p>
            <p v-else-if="idAvailable===false" class="msg error" style="margin-left:70px; margin-top:0.25rem;">
              ✘ 이미 등록된 아이디입니다.
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
            <p v-if="confirm && password===confirm" class="msg success">
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
            <input id="nickname" v-model="nickname" type="text" required />
            <button type="button" class="btn-check" @click="checkNickname">중복검사</button>
            <p v-if="nickAvailable===true" class="msg success" style="margin-left:70px; margin-top:0.25rem;">
              ✔ 사용 가능한 닉네임입니다.
            </p>
            <p v-else-if="nickAvailable===false" class="msg error" style="margin-left:70px; margin-top:0.25rem;">
              ✘ 이미 사용 중인 닉네임입니다.
            </p>
          </div>

          <!-- 연락처 -->
          <div class="field">
            <label for="phone">연락처</label>
            <input
            id="phone"
            v-model="phone"
            type="tel"
            required
            @input="formatPhone"/>
          </div>

          <!-- 이메일 -->
          <div class="field">
            <label for="email">이메일</label>
            <input id="email" v-model="email" type="email" required />
          </div>

          <!-- 선호 카테고리 -->
          <div class="field categories">
            <label>선호 도서 카테고리 <small>(복수 선택 가능)</small></label>
            <div class="category-list">
              <button
                v-for="cat in categoryList"
                :key="cat.id"
                type="button"
                class="btn-category"
                :class="{ selected: selectedCats.includes(cat.id) }"
                @click="toggleCategory(cat.id)"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- 제출 버튼 -->
          <button type="submit" class="btn-submit" :disabled="!formValid">
            회원가입
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// form state
const userId = ref('')
const idAvailable = ref(null)
const password = ref('')
const confirm = ref('')
const name = ref('')
const nickname = ref('')
const nickAvailable = ref(null)
const phone = ref('')
const email = ref('')
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

// fake duplication checks
function checkId() {
  idAvailable.value = userId.value.length >= 4
}
function checkNickname() {
  nickAvailable.value = nickname.value.length >= 2
}

function toggleCategory(id) {
  selectedCats.value = selectedCats.value.includes(id)
    ? selectedCats.value.filter(x => x !== id)
    : [...selectedCats.value, id]
}

const formValid = computed(() => {
  return (
    idAvailable.value &&
    password.value &&
    password.value === confirm.value &&
    name.value &&
    nickAvailable.value &&
    phone.value &&
    email.value &&
    selectedCats.value.length > 0
  )
})

// 입력된 값을 실시간으로 010-1234-5678 형태로 포맷팅
function formatPhone() {
  // 숫자 이외 문자 제거
  let digits = phone.value.replace(/\D/g, '')
  // 3자리 이하
  if (digits.length <= 3) {
    phone.value = digits
  }
  // 4~7자리 (010-1234 까지)
  else if (digits.length <= 7) {
    phone.value = digits.slice(0, 3) + '-' + digits.slice(3)
  }
  // 그 이상 (010-1234-5678)
  else {
    phone.value =
      digits.slice(0, 3) +
      '-' +
      digits.slice(3, 7) +
      '-' +
      digits.slice(7, 11)
  }
}

function handleSubmit() {
  if (!formValid.value) return
  // TODO: 실제 API 호출
  console.log('가입 정보', {
    userId: userId.value,
    password: password.value,
    name: name.value,
    nickname: nickname.value,
    phone: phone.value,
    email: email.value,
    categories: selectedCats.value
  })

  // 모달 띄우기
  showWelcome.value = true

  // 3초 뒤 홈으로 이동
  setTimeout(() => {
    router.push('/')
  }, 3000)
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
.msg.success { color: #2a9d8f; }
.msg.error   { color: #e76f51; }

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
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
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
