from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin



# -----------------------------
# 1. MODEL UŻYTKOWNIKA
# -----------------------------

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError('Użytkownik musi mieć email')
        user = self.model(username=username, email=self.normalize_email(email))
        user.set_password(password)  # haszowanie
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password):
        user = self.create_user(username, email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

# -----------------------------
# 2. MODEL URZĄDZENIA (ROŚLINKI)
# -----------------------------

class Device(models.Model):
    device_id = models.CharField(max_length=100, unique=True)  # np. ESP32-XYZ123
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=100, blank=True)  # np. "Bazylia z kuchni"
    min_wilgotnosc = models.FloatField(default=0.0)  # próg, poniżej którego podlewać
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or self.device_id} (ID: {self.device_id})"

# -----------------------------
# 3. MODEL POMIARU
# -----------------------------

class Pomiar(models.Model):
    device = models.ForeignKey(Device, on_delete=models.CASCADE)
    temperatura = models.FloatField()
    wilgotnosc_powietrza = models.FloatField()
    wilgotnosc_gleby = models.FloatField()
    naslonecznienie = models.FloatField()
    czas = models.DateTimeField(auto_now_add=True)
    czy_podlewane = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.device.device_id} @ {self.czas.strftime('%Y-%m-%d %H:%M:%S')}"

