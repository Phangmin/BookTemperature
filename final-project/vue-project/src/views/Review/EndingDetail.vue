<!-- src/views/Book/EndingDetail.vue -->
<template>
    <div class="ending-detail-page">
  
      <!-- 1) 배너 영역 (회색 네모) -->
      <div class="banner">
        <div class="placeholder-box">대표 배너</div>
      </div>
  
      <!-- 2) 제목 및 메타 -->
      <section class="ending-header">
        <div class="placeholder-box book-cover">책 표지</div>
        <div class="header-text">
          <h1 class="quote">“{{ ending.title }}”</h1>
          <p class="meta">
            - by {{ ending.user }} · {{ ending.date }}
            <span class="actions">
              <button @click="ending.likes++">❤️ {{ ending.likes }}</button>
              <button @click="ending.dislikes++">👎 {{ ending.dislikes }}</button>
            </span>
          </p>
        </div>
      </section>
  
      <!-- 3) 열린결말 본문 -->
      <section class="ending-body">
        <p>{{ ending.content }}</p>
      </section>
  
      <!-- 4) 댓글 영역 -->
      <section class="comments-section">
        <h2>댓글 ({{ comments.length }})</h2>
        <ul class="comment-list">
          <li v-for="c in comments" :key="c.id" class="comment-item">
            <p class="comment-text">{{ c.text }}</p>
            <div class="comment-meta">
              <span class="comment-user">{{ c.user }}</span>
              <span class="comment-date">{{ c.date }}</span>
              <button @click="c.likes++">👍 {{ c.likes }}</button>
              <button @click="c.dislikes++">👎 {{ c.dislikes }}</button>
            </div>
          </li>
        </ul>
  
        <!-- 5) 댓글 입력창 -->
        <div class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="댓글을 입력하세요..."
            rows="3"
          ></textarea>
          <button class="btn-submit" @click="addComment">등록</button>
        </div>
      </section>
  
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  
  // URL 파라미터로부터 열린결말 ID 가져오기
  const route = useRoute()
  const endingId = route.params.endingId
  
  // ▶ 더미 데이터: 실제 API 데이터로 교체하세요.
  const ending = ref({
    id: endingId,
    title: '호수는 모든 걸 기억하고 있었다',
    user: '호랭이 신싸피',
    date: '2025.05.23',
    content: `7년이 지난 후, 최서원은 조용히 세월호로 돌아온다. 
  이름을 바꾸고, 얼굴을 감추며 살아왔던 시간들. 하지만 세월은 아무것도 잊지 않았고, 
  서원의 마음 역시 여전히 무거운 짐을 끌고 있었다. ...`
  , likes: 4, dislikes: 2
  })
  
  const comments = ref([
    { id: 1, user: '사용자C', date: '2025.05.24', text: '이 결말 정말 뜻깊네요.', likes: 1, dislikes: 0 },
    { id: 2, user: '사용자D', date: '2025.05.25', text: '다른 시각으로 생각해보게 됩니다.', likes: 0, dislikes: 0 },
  ])
  
  const newComment = ref('')
  
  function addComment() {
    const text = newComment.value.trim()
    if (!text) return
    comments.value.push({
      id: Date.now(),
      user: '로그인 사용자',
      date: new Date().toISOString().slice(0, 10),
      text,
      likes: 0,
      dislikes: 0,
    })
    newComment.value = ''
  }
  </script>
  
  <style scoped>
  .ending-detail-page {
    max-width: 800px;
    margin: 2rem auto;
    font-family: sans-serif;
    color: #333;
  }
  
  /* 회색 네모 플레이스홀더 */
  .placeholder-box {
    background: #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 0.9rem;
  }
  
  /* 1) 배너 */
  .banner {
    height: 200px;
    margin-bottom: 2rem;
  }
  .banner .placeholder-box {
    width: 100%;
    height: 100%;
  }
  
  /* 2) 열린결말 헤더 */
  .ending-header {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .book-cover {
    width: 120px;
    height: 180px;
  }
  .header-text .quote {
    margin: 0;
    font-size: 1.5rem;
  }
  .meta {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }
  .meta .actions {
    margin-left: 1rem;
  }
  .meta button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
    font-size: 0.9rem;
  }
  
  /* 3) 열린결말 본문 */
  .ending-body {
    line-height: 1.6;
    margin-bottom: 2.5rem;
  }
  
  /* 4) 댓글 영역 */
  .comments-section {
    border-top: 1px solid #ddd;
    padding-top: 1.5rem;
  }
  .comment-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }
  .comment-item {
    padding: 1rem 0;
    border-bottom: 1px solid #eee;
  }
  .comment-text {
    margin: 0 0 0.75rem 0;
  }
  .comment-meta {
    font-size: 0.85rem;
    color: #555;
  }
  .comment-meta span {
    margin-right: 1rem;
  }
  .comment-meta button {
    background: none;
    border: none;
    cursor: pointer;
    margin-left: 0.5rem;
  }
  
  /* 5) 댓글 입력폼 */
  .comment-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .comment-form textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }
  .btn-submit {
    align-self: flex-end;
    padding: 0.5rem 1rem;
    background: #ffc93c;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: #fff;
  }
  </style>
  