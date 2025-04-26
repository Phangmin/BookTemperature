from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import render
from .models import Book
from .serializers import BookListSerializer, BookSerializer
from rest_framework import status

# Create your views here.
@api_view(['GET'])
def book_list(request):
    books = Book.objects.all()
    serializer = BookListSerializer(books, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def book_detail(request, book_pk):
    book = Book.objects.get(pk=book_pk)
    serializer = BookSerializer(book)
    return Response(serializer.data)

@api_view(['POST'])
def book_create(request):
    if request.method == "POST":
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['DELETE'])
def book_delete(request, book_pk):
    book = Book.objects.get(pk=book_pk)
    if request.method == "DELETE":
        book.delete()
        data = {
            'delete': f'도서 고유 번호 {book.isbn}번의 {book.title}을 삭제하였습니다.'
        }
        return Response(data, status=status.HTTP_200_OK)