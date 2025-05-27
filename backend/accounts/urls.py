# accounts/urls.py
from django.urls import path
from .views import (
    FollowerListView, FollowingListView, DeleteAccountView, MyBookshelfView,
    CustomRegisterView, check_nickname, check_username, check_email,
    UserInfoView, FollowView, CartStatusView, AddToCartView, RemoveFromCartView # 장바구니 Views 추가
)

urlpatterns = [
    path('signup/', CustomRegisterView.as_view(), name='custom_register'),
    path('check-username/', check_username),
    path('check-nickname/', check_nickname),
    path('check-email/', check_email),
    path('userinfo/', UserInfoView.as_view(), name='user-info'),
    path('<int:user_pk>/follow/', FollowView.as_view(), name='user-follow'),
    path('following/', FollowingListView.as_view(), name='following-list'),
    path('followers/', FollowerListView.as_view(), name='follower-list'),
    path('delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('bookshelf/', MyBookshelfView.as_view()),

    # 장바구니 관련 URL 패턴 추가
    path('cart/status/<int:book_id>/', CartStatusView.as_view(), name='cart-status'),
    path('cart/add/<int:book_id>/', AddToCartView.as_view(), name='cart-add'),
    path('cart/remove/<int:book_id>/', RemoveFromCartView.as_view(), name='cart-remove'),
]
