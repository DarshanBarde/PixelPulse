from django.db import models
from django.contrib.auth.models import AbstractUser
    

class CustomUser(AbstractUser):
    email = models.EmailField(max_length=255, unique=True, blank=False, null=False, db_index=True)
    username = models.CharField(max_length=50, unique=True, blank=False, null=False)
    full_name = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email_verification_code = models.CharField(max_length=6, null=True, blank=True)
    email_verification_expires = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.full_name if self.full_name else self.username


    def save(self, *args, **kwargs):
        if self.email:
            self.email = self.email.lower()
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]