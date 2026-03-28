<h1 align="center">📚 BookTemperature</h1>

<p align="center">
  <b>책에도 온도가 있다 — 독서 기록 & AI 창작 커뮤니티 플랫폼</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Django-REST_Framework-092E20?logo=django&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vuedotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white"/>
</p>

---

## 📌 프로젝트 소개

**BookTemperature**는 책을 좋아하는 사람들을 위한 독서 기록 & AI 창작 커뮤니티 플랫폼입니다.

- 읽은 책에 대한 **독서 스레드(Thread)** 를 작성하고 다른 독자들과 소통할 수 있어요.
- **AI가 독서 스레드 표지 이미지를 자동 생성**하고, **책의 새로운 결말**도 써줘요.
- 사용자들이 직접 **열린 결말(Open Ending)** 을 공유하고 좋아요·댓글로 반응할 수 있어요.
- **콘텐츠 기반 추천 알고리즘**으로 내가 읽은 책과 비슷한 책을 추천해드려요.

---

## 🗂️ 프로젝트 구조

```
BookTemperature/
├── backend/                  # Django 백엔드
│   ├── backend/              # Django 프로젝트 설정 (settings, urls, wsgi)
│   ├── accounts/             # 사용자 인증 & 프로필, 서재
│   ├── books/                # 도서, 스레드, 댓글, 추천, AI 기능
│   │   ├── models.py         # Book, Thread, Comment, OpenEnding 모델
│   │   ├── views.py          # API 뷰 (AI 결말 생성, 이미지 생성, 추천 등)
│   │   ├── recommender.py    # 콘텐츠 기반 도서 추천 (scikit-learn)
│   │   └── utils.py          # OpenAI 이미지 생성 유틸리티
│   ├── media/                # 업로드 이미지 저장
│   ├── manage.py
│   └── requirements.txt
└── vue-project/              # Vue 3 프론트엔드
    ├── src/
    ├── package.json
    └── vite.config.js
```

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|---|---|
| **Backend** | Django 4.2 · Django REST Framework · Simple JWT |
| **Frontend** | Vue 3 · Pinia · Vue Router 4 · Vite 6 · Axios |
| **인증** | JWT (`djangorestframework_simplejwt`) · django-allauth |
| **AI 기능** | OpenAI GPT-4o-mini (대체 결말 생성, 이미지 생성) |
| **추천 알고리즘** | scikit-learn (콘텐츠 기반 필터링) |
| **외부 API** | Wikipedia API · gTTS · Selenium |
| **DB** | SQLite (개발) |

---

## ✨ 주요 기능

### 📖 도서
- 전체 도서 목록 조회 및 카테고리·키워드 필터링
- 도서 상세 정보 확인 (표지, 저자, 출판 정보, 평점 등)
- **서재(Bookshelf)** — 읽고 싶은 책 저장 및 관리

### 🗒️ 독서 스레드 (Thread)
- 책별 독서 기록 스레드 작성 / 수정 / 삭제
- **AI 표지 이미지 자동 생성** — 스레드 제목·내용 기반으로 OpenAI가 이미지 생성
- 스레드 좋아요 · 댓글 (작성 / 수정 / 삭제 / 좋아요)

### 🤖 AI 창작 기능
- **대체 결말 생성** — 책 제목과 바꾸고 싶은 내용을 입력하면 GPT-4o-mini가 새로운 결말을 작성
- **열린 결말(Open Ending) 커뮤니티** — 유저가 직접 창작한 결말 공유, 좋아요·댓글 지원

### 🔍 도서 추천
- 현재 보고 있는 책과 유사한 도서 추천 (scikit-learn 기반 콘텐츠 필터링)
- `top_n` 파라미터로 추천 수 조절 가능

---

## ⚡ 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/Phangmin/BookTemperature.git
cd BookTemperature
```

---

### 2. 백엔드 실행

```bash
cd backend

# 가상환경 생성 & 활성화
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 파일 작성
cp .env .env.local  # 이미 .env가 있으면 값 확인 후 수정
```

**`.env` 필수 항목:**

| 변수 | 설명 |
|---|---|
| `SECRET_KEY` | Django 시크릿 키 |
| `DEBUG` | `True` / `False` |
| `OPENAI_API_KEY` | OpenAI API 키 (AI 기능 필수) |

```bash
# DB 마이그레이션
python manage.py migrate

# (선택) 초기 도서 데이터 로드
python manage.py loaddata books/fixtures/*.json

# 개발 서버 실행
python manage.py runserver
```

백엔드 서버: `http://localhost:8000`

---

### 3. 프론트엔드 실행

```bash
cd vue-project

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드 서버: `http://localhost:5173`

---

## 🔑 환경변수 (.env)

```env
SECRET_KEY=django-insecure-your-secret-key
DEBUG=True
ALLOWED_HOSTS=*
OPENAI_API_KEY=sk-...
```

SECRET_KEY 빠르게 생성:
```bash
python -c "from django.core.management.utils import get_random_secret_key as g; print(g())"
```

---

## 🌐 주요 API 엔드포인트

| 메서드 | URL | 설명 |
|---|---|---|
| `GET` | `/books/` | 전체 도서 목록 |
| `GET` | `/books/<id>/` | 도서 상세 |
| `GET` | `/books/<id>/recommend/` | 유사 도서 추천 |
| `POST` | `/books/<id>/threads/` | 스레드 작성 (AI 이미지 생성 포함) |
| `GET` | `/books/<id>/threads/` | 스레드 목록 |
| `POST` | `/books/alternate-ending/` | AI 대체 결말 생성 |
| `POST` | `/books/<id>/open-endings/` | 열린 결말 작성 |
| `GET` | `/books/<id>/open-endings/` | 책의 열린 결말 목록 |
| `POST` | `/books/bookshelf/<id>/` | 서재 추가/제거 (토글) |
| `POST` | `/accounts/login/` | 로그인 (JWT 발급) |

---

## 📦 주요 패키지

**Backend**
- `djangorestframework-simplejwt` — JWT 인증
- `django-allauth` · `dj-rest-auth` — 소셜 로그인 / 인증 확장
- `openai` — GPT-4o-mini 대체 결말·이미지 생성
- `scikit-learn` · `pandas` · `numpy` — 도서 추천 알고리즘
- `Wikipedia-API` — 도서 정보 보강
- `gTTS` — 텍스트 음성 변환
- `Selenium` — 웹 크롤링

**Frontend**
- `Vue 3` + `Vite 6`
- `Pinia` — 상태 관리
- `Vue Router 4` — 라우팅
- `Axios` — HTTP 클라이언트

---

<p align="center">Made with 📖 & ❤️ by Phangmin</p>
