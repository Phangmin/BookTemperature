from django.urls import path
from . import views


urlpatterns = [
    path('libraries/', views.book_list),
    path('libraries/<int:book_pk>/', views.book_detail),
    path('libraries/create/', views.book_create),
    path('libraries/<int:book_pk>/delete/', views.book_delete),
]
