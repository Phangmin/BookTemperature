<template>
  <div class="user-edit-profile-container">
    <!-- 사이드바 (기존 UserProfile과 유사하게 유지 또는 수정) -->
    <aside class="sidebar">
      <div class="avatar-wrapper">
        <img class="avatar" :src="profileImageUrl || defaultAvatar" alt="유저 아바타" />
        <h2 class="username">{{ userData.nickname || '사용자 이름' }}</h2>
      </div>
      <div class="stats">
        <div class="stat">
          <span class="number">{{ userData.followingCount || 0 }}</span>
          <span class="label">팔로잉</span>
        </div>
        <div class="stat">
          <span class="number">{{ userData.followerCount || 0 }}</span>
          <span class="label">팔로워</span>
        </div>
      </div>
      <div class="temperature">
        <label class="label">내 서재 온도</label>
        <div class="temp-bar">
          <div class="fill" :style="{ width: userTempPercent + '%' }"></div>
          <span class="temp-marker" :style="{ left: userTempPercent + '%' }">🌡️</span>
        </div>
        <div class="temp-value">{{ userTemp }}°C</div>
      </div>
    </aside>

    <!-- 메인 컨텐츠 -->
    <section class="main-content">
      <div class="content-header">
        <h1>회원정보수정</h1>
        <div class="header-buttons">
          <button class="btn btn-danger" @click="showDeleteModal = true">회원탈퇴</button>
          <button class="btn btn-secondary" @click="goBack">돌아가기</button>
          <button class="btn btn-primary" @click="showPhotoModal = true">사진등록</button>
          <button class="btn btn-success" @click="submitProfileUpdate">수정완료</button>
        </div>
      </div>

      <form @submit.prevent="submitProfileUpdate" class="profile-form">
        <div class="form-group">
          <label for="userId">아이디</label>
          <input type="text" id="userId" :value="userData.username" readonly />
        </div>

        <div class="form-group">
          <label for="userName">이름</label>
          <input type="text" id="userName" :value="userData.name" readonly />
        </div>

        <div class="form-group">
          <label for="password">비밀번호 변경</label>
          <input type="password" id="password" v-model="form.newPassword" placeholder="새 비밀번호 입력" />
        </div>

        <div class="form-group">
          <label for="passwordConfirm">변경된 비밀번호 확인</label>
          <input type="password" id="passwordConfirm" v-model="form.passwordConfirm" placeholder="새 비밀번호 다시 입력" @input="checkPasswordMatch"/>
          <p v-if="passwordMessage" :class="{ 'text-success': passwordsMatch, 'text-danger': !passwordsMatch && passwordMessage }">{{ passwordMessage }}</p>
        </div>

        <div class="form-group">
          <label for="nickname">닉네임</label>
          <div class="input-group">
            <input type="text" id="nickname" v-model="form.nickname" :placeholder="userData.nickname || '닉네임 입력'" @focus="clearPlaceholder('nickname')" @blur="restorePlaceholder('nickname')" />
            <button type="button" class="btn btn-check-duplicate" @click="checkNickname">중복확인</button>
          </div>
          <p v-if="nicknameMessage" :class="{ 'text-success': isNicknameAvailable, 'text-danger': !isNicknameAvailable && nicknameMessage }">{{ nicknameMessage }}</p>
        </div>

        <div class="form-group">
          <label for="email">이메일</label>
          <div class="input-group">
            <input type="email" id="email" v-model="form.email" :placeholder="userData.email || '이메일 입력'" @focus="clearPlaceholder('email')" @blur="restorePlaceholder('email')" />
            <button type="button" class="btn btn-check-duplicate" @click="checkEmail">중복확인</button>
          </div>
          <p v-if="emailMessage" :class="{ 'text-success': isEmailAvailable, 'text-danger': !isEmailAvailable && emailMessage }">{{ emailMessage }}</p>
        </div>

        <div class="form-group">
          <label for="phoneNumber">연락처</label>
          <input type="tel" id="phoneNumber" v-model="form.phoneNumber" :placeholder="userData.phoneNumber || '연락처 입력 (- 없이 숫자만)'" @input="formatPhoneNumber" @focus="clearPlaceholder('phoneNumber')" @blur="restorePlaceholder('phoneNumber')" />
        </div>

        <div class="form-group">
          <label>선호 도서 카테고리</label>
          <div class="category-buttons">
            <button
              v-for="category in allCategories"
              :key="category.id"
              type="button"
              :class="{ 'btn-category': true, 'active': form.preferredCategories.includes(category.id) }"
              @click="toggleCategory(category.id)"
            >
              {{ category.name }}
            </button>
          </div>
        </div>
      </form>
    </section>

    <!-- 회원탈퇴 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <h3>회원 탈퇴</h3>
        <p>회원 탈퇴를 진행하면 계정을 다시 돌이킬 수 없습니다. 정말 회원탈퇴를 진행하시겠습니까?</p>
        <div class="modal-actions">
          <button class="btn btn-danger" @click="confirmDeleteAccount">탈퇴</button>
          <button class="btn btn-secondary" @click="showDeleteModal = false">취소</button>
        </div>
      </div>
    </div>

    <!-- 사진등록 모달 -->
    <div v-if="showPhotoModal" class="modal-overlay">
      <div class="modal-content">
        <h3>프로필 사진 등록</h3>
        <input type="file" @change="onFileChange" accept="image/*" />
        <img v-if="photoPreviewUrl" :src="photoPreviewUrl" alt="사진 미리보기" class="photo-preview" />
        <div class="modal-actions">
          <button class="btn btn-primary" @click="uploadProfilePhoto" :disabled="!selectedFile">등록</button>
          <button class="btn btn-secondary" @click="closePhotoModal">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user'; // useUserStore import 추가
import defaultAvatar from '@/assets/avatar.jpg'; // 기본 아바타 이미지

const router = useRouter();
const app = getCurrentInstance();
const $api = app.appContext.config.globalProperties.$api;
// $store는 Pinia v2에서 globalProperties에 직접 주입되지 않으므로, useUserStore()를 사용합니다.
const userStore = useUserStore(); // userStore 인스턴스 생성


// --- 상태 변수 ---
const userData = ref({ // 실제 사용자 데이터 (API로부터 받아올 예정)
  username: 'gwangmin03', // 예시: 아이디
  name: '천광민',       // 예시: 이름
  nickname: '기존닉네임',
  email: 'user@example.com',
  phoneNumber: '010-1234-5678',
  profileImage: '', // 프로필 이미지 URL
  followingCount: 10,
  followerCount: 20,
  temperature: 75, // 서재 온도 (0-100 값)
  preferredCategories: [1, 3] // 예시: 사용자가 선택한 카테고리 ID 목록
});

const form = reactive({
  newPassword: '',
  passwordConfirm: '',
  nickname: '',
  email: '',
  phoneNumber: '',
  preferredCategories: [], // 사용자가 선택/수정하는 카테고리
});

const allCategories = ref([ // 전체 카테고리 목록 (API로부터 받아올 수 있음)
  { id: 1, name: '소설/시/희곡' },
  { id: 2, name: '경제/경영' },
  { id: 3, name: '자기계발' },
  { id: 4, name: '인문/교양' },
  { id: 5, name: '취미/실용' },
  { id: 6, name: '어린이/청소년' },
  { id: 7, name: '과학' },
]);

const passwordMessage = ref('');
const passwordsMatch = ref(false);
const nicknameMessage = ref('');
const isNicknameAvailable = ref(null); // null: 아직 확인 안함, true: 사용 가능, false: 사용 불가
const emailMessage = ref('');
const isEmailAvailable = ref(null);

const showDeleteModal = ref(false);
const showPhotoModal = ref(false);
const selectedFile = ref(null);
const photoPreviewUrl = ref(''); // 사진 미리보기 URL
const profileImageUrl = ref(userData.value.profileImage || defaultAvatar); // 최종 프로필 이미지 URL

// --- Computed 속성 ---
const userTempPercent = computed(() => userData.value.temperature || 0);
const userTemp = computed(() => ((userData.value.temperature || 0) * 0.36 + 5).toFixed(1));


// --- 초기화 ---
onMounted(() => {
  const currentUser = userStore.user; // Pinia 스토어에서 직접 사용자 정보 가져오기

  if (currentUser && currentUser.id) {
    console.log("[UserEditProfile] Current user from store:", JSON.parse(JSON.stringify(currentUser)));
    userData.value = {
      username: currentUser.username || '',
      name: currentUser.name || '', // 스토어에 'name' 필드가 있다고 가정 (없으면 API 응답에 맞게 수정)
      nickname: currentUser.nickname || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phone_number || '', // 스토어에 'phone_number' 필드가 있다고 가정
      profileImage: currentUser.profile_image || currentUser.avatar || '', // 스토어 필드명에 따라 조정
      followingCount: currentUser.following_count || 0, // 스토어에 이 필드들이 있다고 가정
      followerCount: currentUser.followers_count || 0,   // 스토어에 이 필드들이 있다고 가정
      temperature: currentUser.temperature || 75,       // 스토어에 없다면 기본값 또는 다른 필드 사용
      // favorite_categories는 API 응답이 이름 배열이므로, form 초기화 시 ID로 변환
    };

    // 폼 초기값 설정
    form.nickname = userData.value.nickname;
    form.email = userData.value.email;
    form.phoneNumber = userData.value.phoneNumber ? formatPhoneNumberOnLoad(userData.value.phoneNumber) : '';

    // 스토어의 favorite_categories (이름 배열)를 ID 배열로 변환하여 form에 할당
    if (currentUser.favorite_categories && Array.isArray(currentUser.favorite_categories)) {
      form.preferredCategories = currentUser.favorite_categories
        .map(favCategoryName => {
          const foundCategory = allCategories.value.find(cat => cat.name === favCategoryName);
          return foundCategory ? foundCategory.id : null;
        })
        .filter(id => id !== null);
    } else {
      form.preferredCategories = [];
    }

    profileImageUrl.value = userData.value.profileImage || defaultAvatar;

  } else {
    console.error("[UserEditProfile] Failed to load current user data from store or user is not logged in.");
    // 사용자에게 알림 또는 로그인 페이지로 리다이렉트 등의 처리
    // alert('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
    // router.push({ name: 'Login' }); // Login 라우트가 있다고 가정
  }

  // 전체 카테고리 목록은 현재 ref에 하드코딩되어 있으므로 별도 API 호출은 생략합니다.
  // 만약 API로 가져와야 한다면 여기에 로직 추가
});

// --- 메소드 ---
const goBack = () => {
  router.go(-1);
};

const checkPasswordMatch = () => {
  if (!form.newPassword && !form.passwordConfirm) {
    passwordMessage.value = '';
    passwordsMatch.value = false;
    return;
  }
  if (form.newPassword === form.passwordConfirm) {
    passwordMessage.value = '비밀번호가 일치합니다.';
    passwordsMatch.value = true;
  } else {
    passwordMessage.value = '비밀번호가 일치하지 않습니다.';
    passwordsMatch.value = false;
  }
};

const clearPlaceholder = (field) => {
  if (field === 'nickname' && form.nickname === userData.value.nickname) {
    form.nickname = '';
  } else if (field === 'email' && form.email === userData.value.email) {
    form.email = '';
  } else if (field === 'phoneNumber' && form.phoneNumber === formatPhoneNumberOnLoad(userData.value.phoneNumber)) {
     form.phoneNumber = '';
  }
};

const restorePlaceholder = (field) => {
  if (field === 'nickname' && form.nickname === '') {
    form.nickname = userData.value.nickname;
  } else if (field === 'email' && form.email === '') {
    form.email = userData.value.email;
  } else if (field === 'phoneNumber' && form.phoneNumber === '') {
    form.phoneNumber = formatPhoneNumberOnLoad(userData.value.phoneNumber);
  }
};

const formatPhoneNumberOnLoad = (numberStr) => {
  if (!numberStr) return '';
  const cleaned = ('' + numberStr).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3,4})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return numberStr;
};

const formatPhoneNumber = () => {
  const cleaned = ('' + form.phoneNumber).replace(/\D/g, '');
  if (cleaned.length <= 3) {
    form.phoneNumber = cleaned;
  } else if (cleaned.length <= 7) {
    form.phoneNumber = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  } else {
    form.phoneNumber = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
};

const checkNickname = async () => {
  if (!form.nickname || form.nickname === userData.value.nickname) {
    nicknameMessage.value = '';
    isNicknameAvailable.value = null;
    return;
  }
  try {
    // 실제 API 엔드포인트로 수정 필요
    const response = await $api.post('/check-nickname/', { nickname: form.nickname }); // '/auth' 제거
    if (response.data.is_available) {
      nicknameMessage.value = '사용 가능한 닉네임입니다.';
      isNicknameAvailable.value = true;
    } else {
      nicknameMessage.value = '이미 사용 중인 닉네임입니다.';
      isNicknameAvailable.value = false;
    }
  } catch (error) {
    console.error("닉네임 중복 확인 실패:", error);
    nicknameMessage.value = '닉네임 확인 중 오류가 발생했습니다.';
    isNicknameAvailable.value = false;
  }
};

const checkEmail = async () => {
  if (!form.email || form.email === userData.value.email) {
    emailMessage.value = '';
    isEmailAvailable.value = null;
    return;
  }
  try {
    // 실제 API 엔드포인트로 수정 필요
    const response = await $api.post('/check-email/', { email: form.email }); // '/auth' 제거
    if (response.data.is_available) {
      emailMessage.value = '사용 가능한 이메일입니다.';
      isEmailAvailable.value = true;
    } else {
      emailMessage.value = '이미 사용 중인 이메일입니다.';
      isEmailAvailable.value = false;
    }
  } catch (error) {
    console.error("이메일 중복 확인 실패:", error);
    emailMessage.value = '이메일 확인 중 오류가 발생했습니다.';
    isEmailAvailable.value = false;
  }
};

const toggleCategory = (categoryId) => {
  const index = form.preferredCategories.indexOf(categoryId);
  if (index > -1) {
    form.preferredCategories.splice(index, 1);
  } else {
    form.preferredCategories.push(categoryId);
  }
};

const submitProfileUpdate = async () => {
  // 비밀번호 유효성 검사 (새 비밀번호 입력 시 확인 필수)
  if (form.newPassword && form.newPassword !== form.passwordConfirm) {
    alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    return;
  }
  // 닉네임 유효성 검사 (변경 시 중복 확인 완료 여부)
  if (form.nickname !== userData.value.nickname && isNicknameAvailable.value !== true) {
      alert('닉네임 중복 확인을 해주세요 또는 사용 불가능한 닉네임입니다.');
      return;
  }
  // 이메일 유효성 검사 (변경 시 중복 확인 완료 여부)
  if (form.email !== userData.value.email && isEmailAvailable.value !== true) {
      alert('이메일 중복 확인을 해주세요 또는 사용 불가능한 이메일입니다.');
      return;
  }

  const payload = {
    // 아이디, 이름은 변경 불가하므로 보내지 않음
    nickname: form.nickname,
    email: form.email,
    phone_number: form.phoneNumber.replace(/-/g, ''), // 하이픈 제거 후 전송
    preferred_categories: form.preferredCategories,
  };

  if (form.newPassword) {
    payload.password = form.newPassword;
  }

  try {
    await $api.patch('/userinfo/', payload); // '/auth' 제거
    alert('회원 정보가 성공적으로 수정되었습니다.');
    // 필요하다면 사용자 정보 다시 로드 또는 스토어 업데이트
    // 예: await $store.dispatch('fetchUser');
    router.push('/profile'); // 수정 후 프로필 페이지로 이동 또는 다른 페이지
  } catch (error) {
    console.error("회원 정보 수정 실패:", error);
    alert('회원 정보 수정에 실패했습니다. 오류: ' + (error.response?.data?.detail || error.message));
  }
};

const confirmDeleteAccount = async () => {
  try {
    await $api.delete('/delete/'); // '/auth/userinfo/' 에서 '/delete/' 로 변경 (urls.py 기반)
    alert('회원 탈퇴가 완료되었습니다.');
    // 로그아웃 처리
    // 예: await $store.dispatch('logout');
    router.push('/'); // 홈으로 이동
  } catch (error) {
    console.error("회원 탈퇴 실패:", error);
    alert('회원 탈퇴 처리 중 오류가 발생했습니다.');
  }
  showDeleteModal.value = false;
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    // 미리보기 URL 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      photoPreviewUrl.value = event.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    selectedFile.value = null;
    photoPreviewUrl.value = '';
  }
};

const uploadProfilePhoto = async () => {
  if (!selectedFile.value) {
    alert('사진 파일을 선택해주세요.');
    return;
  }
  const formData = new FormData();
  formData.append('profile_image', selectedFile.value);

  try {
    // 실제 프로필 사진 업로드 API 엔드포인트
    const response = await $api.patch('/userinfo/', formData, { // '/auth' 제거
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    alert('프로필 사진이 성공적으로 등록되었습니다.');
    profileImageUrl.value = response.data.profile_image_url; // API 응답에서 새 이미지 URL 받아오기
    userData.value.profileImage = response.data.profile_image_url; // 사용자 데이터도 업데이트
    closePhotoModal();
  } catch (error) {
    console.error("프로필 사진 업로드 실패:", error);
    alert('프로필 사진 업로드에 실패했습니다.');
  }
};

const closePhotoModal = () => {
  showPhotoModal.value = false;
  selectedFile.value = null;
  photoPreviewUrl.value = '';
};

</script>

<style scoped>
.user-edit-profile-container {
  display: flex;
  min-height: 100vh;
  background: #faf9f5; /* 기존 UserProfile과 유사한 배경색 */
}

/* --- 사이드바 (UserProfile.vue 스타일 일부 가져옴) --- */
.sidebar {
  width: 280px;
  background: #fff;
  padding: 2rem 1.5rem;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가운데 정렬 추가 */
}
.avatar-wrapper {
  text-align: center;
  margin-bottom: 2rem;
}
.avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #eee; /* 테두리 추가 */
}
.username {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}
.stats {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0; /* 간격 조정 */
  width: 100%; /* 너비 채우도록 */
}
.stat .number {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
}
.stat .label {
  color: #666;
  font-size: 0.9rem; /* 폰트 크기 조정 */
}
.temperature {
  margin-top: 1rem;
  width: 100%; /* 너비 채우도록 */
}
.temperature .label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #333;
  text-align: center; /* 가운데 정렬 */
}
.temp-bar {
  position: relative;
  width: 80%; /* 너비 조정 */
  margin: 0 auto; /* 가운데 정렬 */
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.temp-bar .fill {
  height: 100%;
  background: #ffc93c;
}
.temp-bar .temp-marker {
  position: absolute;
  top: -12px; /* 아이콘 위치 조정 */
  transform: translateX(-50%);
  font-size: 1rem;
}
.temp-value {
  text-align: center;
  margin-top: 0.5rem; /* 간격 조정 */
  font-size: 0.9rem;
  color: #333;
}

/* --- 메인 컨텐츠 --- */
.main-content {
  flex: 1;
  padding: 2rem 3rem; /* 패딩 조정 */
  background-color: #fff; /* 흰색 배경 */
  border-left: 1px solid #e0e0e0; /* 왼쪽 경계선 추가 */
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ffc93c; /* 주황색 구분선 */
}
.content-header h1 {
  font-size: 1.8rem; /* 제목 크기 조정 */
  font-weight: 600;
  color: #333;
}
.header-buttons .btn {
  margin-left: 0.75rem;
  padding: 0.6rem 1.2rem; /* 버튼 패딩 조정 */
  font-size: 0.9rem;
  border-radius: 6px; /* 버튼 모서리 둥글게 */
  cursor: pointer;
  transition: background-color 0.2s ease;
}

/* --- 폼 스타일 --- */
.profile-form {
  max-width: 700px; /* 폼 최대 너비 */
  margin: 0 auto; /* 가운데 정렬 */
}
.form-group {
  margin-bottom: 1.5rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}
.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"],
.form-group input[type="tel"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 0.95rem;
}
.form-group input[readonly] {
  background-color: #f0f0f0;
  cursor: not-allowed;
}
.input-group {
  display: flex;
  align-items: center;
}
.input-group input {
  flex-grow: 1;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.btn-check-duplicate {
  padding: 0.75rem 1rem;
  background-color: #6c757d; /* 회색 계열 */
  color: white;
  border: 1px solid #6c757d;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}
.btn-check-duplicate:hover {
  background-color: #5a6268;
}

.text-success {
  color: green;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}
.text-danger {
  color: red;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

/* 카테고리 버튼 */
.category-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.btn-category {
  padding: 0.6rem 1rem;
  border: 1px solid #ccc;
  border-radius: 20px; /* 타원형 버튼 */
  background-color: #f8f9fa;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}
.btn-category.active {
  background-color: #ffc93c; /* 활성 상태 주황색 */
  color: white;
  border-color: #ffc93c;
}
.btn-category:hover:not(.active) {
  background-color: #e9ecef;
}


/* --- 버튼 스타일 --- */
.btn {
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.btn:hover {
  opacity: 0.85;
}
.btn-primary { background-color: #007bff; color: white; }
.btn-secondary { background-color: #6c757d; color: white; }
.btn-success { background-color: #28a745; color: white; }
.btn-danger { background-color: #dc3545; color: white; }
.btn-warning { background-color: #ffc107; color: #212529; }


/* --- 모달 스타일 --- */
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
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 450px; /* 모달 최대 너비 */
  text-align: center; /* 내용 가운데 정렬 */
}
.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}
.modal-content p {
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
}
.modal-actions {
  display: flex;
  justify-content: center; /* 버튼 가운데 정렬 */
  gap: 1rem;
}
.modal-actions .btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
}
.photo-preview {
  max-width: 100%;
  max-height: 200px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
