from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path("api/accounts/", include("accounts.urls")), # 'api/auth/'에서 'api/accounts/'로 변경
    # path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path("api/auth/", include("allauth.socialaccount.urls")), # 이 부분은 소셜 로그인이므로 그대로 둡니다.
    path('accounts/', include('allauth.urls')),
    path('api/books/', include('books.urls')), # Added books app urls, added trailing slash
]
