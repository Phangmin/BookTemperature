<!-- src/views/Book/ReviewDetail.vue -->
<template>
    <div class="review-detail-page">
  
      <!-- 1) 배너 영역 (회색 네모로 표시) -->
      <div class="banner">
        <div class="placeholder-box">대표 배너</div>
      </div>
  
      <!-- 2) 리뷰 제목 및 메타 -->
      <section class="review-header">
        <div class="placeholder-box book-cover">책 표지</div>
        <div class="header-text">
          <h1 class="quote">“{{ review.title }}”</h1>
          <p class="meta">
            by {{ review.user }} · {{ review.date }}
            <span class="actions">
              <button @click="review.likes++">❤️ {{ review.likes }}</button>
              <button @click="review.dislikes++">👎 {{ review.dislikes }}</button>
            </span>
          </p>
        </div>
      </section>
  
      <!-- 3) 리뷰 본문 -->
      <section class="review-body">
        <p>{{ review.content }}</p>
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
  
  // URL 파라미터 (예: /book/1/review/42)
  const route = useRoute()
  const reviewId = route.params.reviewId
  
  // ▶ 더미 데이터: 실제 API 호출 결과로 대체하세요.
  const review = ref({
    id: reviewId,
    title: '어둠을 통과한 소년, 빛을 선택하다',
    user: '호랭이 김싸피',
    date: '2025.05.23',
    content: `『7년의 밤』은 한 남자의 잘못된 선택이 어떻게 또 다른 인생을 파괴하고, 
  그 상처가 세대를 넘어 대물림될 수 있는지를 보여주는 강렬한 서사다. ...`
  })
  
  const comments = ref([
    { id: 1, user: '사용자A', date: '2025.05.24', text: '정말 공감되는 리뷰예요!', likes: 2, dislikes: 0 },
    { id: 2, user: '사용자B', date: '2025.05.25', text: '이 부분이 특히 마음에 들었습니다.', likes: 1, dislikes: 0 },
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
  .review-detail-page {
    max-width: 800px;
    margin: 2rem auto;
    font-family: sans-serif;
    color: #333;
  }
  
  /* 공통 회색 네모 플레이스홀더 */
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
  
  /* 2) 리뷰 헤더 */
  .review-header {
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
  
  /* 3) 리뷰 본문 */
  .review-body {
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
  