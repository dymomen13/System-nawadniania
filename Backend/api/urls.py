from django.urls import path
from . import views  # lub inne widoki

from django.urls import path


urlpatterns = [
    path('dodaj_urzadzenie/', views.dodaj_urzadzenie, name='dodaj_urzadzenie'),
    path('register/', views.register_user, name='register_user'),
    path('me/', views.me_view, name='me_view'),
    path('update_device/', views.update_device, name='update_device'),
    path('moje_urzadzenia/', views.moje_urzadzenia, name='moje_urzadzenia'),
    path('pomiar/', views.dodaj_pomiar, name='dodaj_pomiar'),
    path('pomiary/<str:device_id>/', views.pobierz_pomiary, name='pobierz_pomiary'),
    path('pomiar/<str:device_id>/latest/', views.najnowszy_pomiar, name='najnowszy_pomiar'),
    path('device/<str:device_id>/settings/', views.pobierz_ustawienia_urzadzenia, name='device_settings'),
    path('usun_urzadzenie/<str:device_id>/', views.usun_urzadzenie, name='usun_urzadzenie'),




]