javascript

// Логика для типа "Геоточка"
let map = null;
let marker = null;
let markerCoordinates = null;

function initMap() {
    // Инициализация карты с определением местоположения пользователя
    map = L.map('map');
    
    // Добавление слоя карты OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Пытаемся определить местоположение пользователя
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                map.setView([userLat, userLng], 13);
                
                // Добавляем маркер текущего местоположения
                L.marker([userLat, userLng])
                    .addTo(map)
                    .bindPopup('Ваше текущее местоположение')
                    .openPopup();
                    
            },
            function(error) {
                // Если не удалось определить местоположение, используем Москву по умолчанию
                console.warn('Не удалось определить местоположение:', error);
                map.setView([55.7558, 37.6173], 13);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        // Геолокация не поддерживается
        map.setView([55.7558, 37.6173], 13);
    }
    
    // Обработчик клика по карте
    map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        
        // Удаляем существующую метку, если есть
        if (marker) {
            map.removeLayer(marker);
        }
        
        // Создаем новую метку с возможностью перетаскивания
        marker = L.marker([lat, lng], {draggable: true}).addTo(map);
        
        // Обновляем координаты при перемещении метки
        marker.on('dragend', function() {
            const position = marker.getLatLng();
            updateCoordinatesDisplay(position.lat, position.lng);
        });
        
        // Обновляем отображение координат
        updateCoordinatesDisplay(lat, lng);
        
        // Сохраняем координаты
        markerCoordinates = { lat, lng };
        
        // Активируем кнопку отправки
        document.getElementById('send-geo-btn').disabled = false;
    });
}

function updateCoordinatesDisplay(lat, lng) {
    const coordinatesElement = document.getElementById('coordinates');
    coordinatesElement.textContent = `Координаты: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function getGeoData() {
    return {
        type: 'geo',
        coordinates: markerCoordinates,
        completionMessage: document.getElementById('geo-completion-text').value.trim() || null,
        timestamp: new Date().toISOString()
    };
}

// Обработчики для формы "Гео точка"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('send-geo-btn').addEventListener('click', () => {
        const data = getGeoData();
        sendData(data);
    });
});
