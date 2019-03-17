from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    nickname = models.CharField(max_length=30, blank=True)

    class Meta(AbstractUser.Meta):
        pass