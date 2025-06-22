from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Device, User, Pomiar

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dodaj_urzadzenie(request):
    data = request.data
    device_id = data.get('device_id')
    name = data.get('name', '')
    min_wilgotnosc = data.get('min_wilgotnosc')

    if not device_id:
        return Response({'error': 'Brak device_id'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        return Response({'error': 'Urządzenie nie istnieje'}, status=status.HTTP_404_NOT_FOUND)

    if device.owner is not None:
        return Response({'error': 'Urządzenie już przypisane'}, status=status.HTTP_400_BAD_REQUEST)

    # WALIDACJA wilgotności
    if min_wilgotnosc in [None, '']:
        min_wilgotnosc = 0.0
    else:
        try:
            min_wilgotnosc = float(min_wilgotnosc)
        except ValueError:
            return Response({'error': 'min_wilgotnosc musi być liczbą'}, status=400)

        if not (0 <= min_wilgotnosc <= 100):
            return Response({'error': 'min_wilgotnosc musi być w zakresie 0–100%'}, status=400)

    device.owner = request.user
    device.name = name
    device.min_wilgotnosc = min_wilgotnosc
    device.save()

    return Response({
        'success': f'Urządzenie {device_id} przypisane do {request.user.username}',
        'device': {
            'id': device.device_id,
            'name': device.name,
            'min_wilgotnosc': device.min_wilgotnosc
        }
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def usun_urzadzenie(request, device_id):
    user = request.user

    try:
        device = Device.objects.get(device_id=device_id, owner=user)
    except Device.DoesNotExist:
        return Response({'error': 'Nie znaleziono przypisanego urządzenia'}, status=404)

    device.owner = None
    device.save()

    return Response({'success': f'Urządzenie {device_id} zostało odłączone'})



@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return Response({'error': 'Wszystkie pola są wymagane'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Użytkownik o takim loginie już istnieje'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Użytkownik o takim e-mailu już istnieje'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)

    return Response({'success': 'Użytkownik utworzony pomyślnie'}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Device

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_device(request):
    user = request.user
    data = request.data
    device_id = data.get('device_id')
    name = data.get('name')
    min_wilgotnosc = data.get('min_wilgotnosc')

    if not device_id:
        return Response({'error': 'Brakuje device_id'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        device = Device.objects.get(device_id=device_id, owner=user)
    except Device.DoesNotExist:
        return Response({'error': 'Nie znaleziono urządzenia przypisanego do użytkownika'}, status=status.HTTP_404_NOT_FOUND)

    if name is not None:
        device.name = name

    if min_wilgotnosc is not None:
        try:
            min_wilgotnosc = float(min_wilgotnosc)
        except ValueError:
            return Response({'error': 'min_wilgotnosc musi być liczbą'}, status=status.HTTP_400_BAD_REQUEST)

        if not (0 <= min_wilgotnosc <= 100):
            return Response({'error': 'min_wilgotnosc musi być w zakresie 0–100%'}, status=status.HTTP_400_BAD_REQUEST)

        device.min_wilgotnosc = min_wilgotnosc

    device.save()

    return Response({
        'success': 'Urządzenie zaktualizowane',
        'device': {
            'device_id': device.device_id,
            'name': device.name,
            'min_wilgotnosc': device.min_wilgotnosc
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def moje_urzadzenia(request):
    user = request.user
    devices = user.device_set.all()

    device_list = [
        {
            'device_id': device.device_id,
            'name': device.name,
            'min_wilgotnosc': device.min_wilgotnosc
        }
        for device in devices
    ]

    return Response({'devices': device_list})

@api_view(['POST'])
def dodaj_pomiar(request):
    data = request.data
    device_id = data.get('device_id')

    if not device_id:
        return Response({'error': 'Brakuje device_id'}, status=400)

    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        return Response({'error': 'Nie znaleziono urządzenia'}, status=404)

    pomiar = Pomiar.objects.create(
        device=device,
        wilgotnosc_powietrza=data.get('wilgotnosc_powietrza'),
        temperatura=data.get('temperatura'),
        naslonecznienie=data.get('naslonecznienie'),
        wilgotnosc_gleby=data.get('wilgotnosc_gleby'),
        czy_podlewane =data.get('czy_podlewane', False)
    )

    return Response({'success': 'Pomiar zapisany'}, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pobierz_pomiary(request, device_id):
    user = request.user

    try:
        device = Device.objects.get(device_id=device_id, owner=user)
    except Device.DoesNotExist:
        return Response({'error': 'Urządzenie nie istnieje lub nie należy do Ciebie'}, status=404)

    pomiary = device.pomiar_set.all().order_by('-czas')[:50]  # ✔ poprawione

    dane = [
        {
            'timestamp': pomiar.czas,
            'temperatura': pomiar.temperatura,
            'wilgotnosc_powietrza': pomiar.wilgotnosc_powietrza,
            'wilgotnosc_gleby': pomiar.wilgotnosc_gleby,
            'naslonecznienie': pomiar.naslonecznienie,
            'czy_podlewane': pomiar.czy_podlewane,
        }
        for pomiar in pomiary
    ]

    return Response({'device_id': device_id, 'pomiary': dane})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def najnowszy_pomiar(request, device_id):
    user = request.user

    try:
        device = Device.objects.get(device_id=device_id, owner=user)
    except Device.DoesNotExist:
        return Response({'error': 'Nie znaleziono urządzenia'}, status=404)

    pomiar = device.pomiar_set.order_by('-czas').first()

    if not pomiar:
        return Response({'error': 'Brak pomiarów dla tego urządzenia'}, status=404)

    return Response({
        'device_id': device.device_id,
        'name': device.name,
        'min_wilgotnosc': device.min_wilgotnosc,
        'czas': pomiar.czas,
        'temperatura': pomiar.temperatura,
        'wilgotnosc_powietrza': pomiar.wilgotnosc_powietrza,
        'wilgotnosc_gleby': pomiar.wilgotnosc_gleby,
        'naslonecznienie': pomiar.naslonecznienie,
        'czy_podlewane': pomiar.czy_podlewane,
    })

@api_view(['GET'])
def pobierz_ustawienia_urzadzenia(request, device_id):
    try:
        device = Device.objects.get(device_id=device_id)
    except Device.DoesNotExist:
        return Response({'error': 'Nie znaleziono urządzenia'}, status=404)

    return Response({
        'device_id': device.device_id,
        'min_wilgotnosc': device.min_wilgotnosc
    })

