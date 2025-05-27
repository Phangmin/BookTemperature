from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    # User 모델에 profile_image, followers_count, following_count 필드가 있다고 가정하고 추가합니다.
    # 만약 필드명이 다르거나 Profile 모델 등으로 분리되어 있다면 그에 맞게 수정해야 합니다.
    # followers_count = serializers.IntegerField(source='followers.count', read_only=True) # 예시: 팔로워 수를 계산하는 경우
    # following_count = serializers.IntegerField(source='following.count', read_only=True) # 예시: 팔로잉 수를 계산하는 경우
    # profile_image = serializers.ImageField(read_only=True) # 예시: User 모델에 profile_image 필드가 있는 경우

    class Meta:
        model = User
        fields = [
            'id', # id 필드 추가
            'username',
            'email',
            'name',
            'nickname',
            'phone_number',
            'favorite_categories',
            # 'profile_image', # User 모델에 해당 필드가 있다면 주석 해제
            # 'followers_count', # User 모델 또는 SerializerMethodField로 정의했다면 주석 해제
            # 'following_count', # User 모델 또는 SerializerMethodField로 정의했다면 주석 해제
        ]


class CustomRegisterSerializer(RegisterSerializer):
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True)
    phone_number = serializers.CharField(required=True)
    nickname = serializers.CharField(required=True)
    favorite_categories = serializers.ListField(child=serializers.CharField(), required=True)

    def save(self, request):
        user = super().save(request)
        user.email = self.validated_data['email']
        user.name = self.validated_data['name']
        user.phone_number = self.validated_data['phone_number']
        user.nickname = self.validated_data['nickname']
        user.favorite_categories = self.validated_data['favorite_categories']
        user.save()
        return user


class FollowingUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'name']

class FollowerUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'nickname', 'name']
