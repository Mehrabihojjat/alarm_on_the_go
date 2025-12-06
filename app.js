// Global Variables
let map;
let currentLocationMarker;
let selectedLocationMarker;
let alarmCircle;
let userLocation = null;
let alarms = [];
let trackingInterval = null;
let alarmAudio = null;
let isAlarmRinging = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadAlarms();
    requestLocationPermission();
    setupEventListeners();
    createAlarmSound();
});

// Initialize Leaflet Map
function initMap() {
    // Default center (Tehran)
    map = L.map('map').setView([35.6892, 51.3890], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Click on map to set alarm location
    map.on('click', onMapClick);
}

// Handle map click
function onMapClick(e) {
    const { lat, lng } = e.latlng;

    // Remove previous selected marker
    if (selectedLocationMarker) {
        map.removeLayer(selectedLocationMarker);
    }

    // Add new marker
    selectedLocationMarker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    selectedLocationMarker.bindPopup('مقصد انتخاب شده').openPopup();

    // Update form
    document.getElementById('alarm-name').focus();
}

// Request location permission
function requestLocationPermission() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Center map on user location
                map.setView([userLocation.lat, userLocation.lng], 15);

                // Add user location marker
                if (currentLocationMarker) {
                    map.removeLayer(currentLocationMarker);
                }

                currentLocationMarker = L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    })
                }).addTo(map);

                currentLocationMarker.bindPopup('موقعیت شما');

                // Start tracking
                startLocationTracking();

                updateStatusDisplay();
            },
            (error) => {
                alert('برای استفاده از این اپلیکیشن، لطفاً دسترسی به موقعیت مکانی را فعال کنید.');
                console.error('Location error:', error);
            },
            {
                enableHighAccuracy: true
            }
        );
    } else {
        alert('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند.');
    }
}

// Start tracking user location
function startLocationTracking() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }

    // Update location every 10 seconds
    trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Update marker position
                if (currentLocationMarker) {
                    currentLocationMarker.setLatLng([userLocation.lat, userLocation.lng]);
                }

                // Check alarms
                checkAlarms();

                updateStatusDisplay();
            },
            (error) => {
                console.error('Tracking error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, 10000);
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Check if user is near any alarm
function checkAlarms() {
    if (!userLocation || alarms.length === 0) return;

    alarms.forEach(alarm => {
        if (!alarm.active) return;

        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            alarm.lat,
            alarm.lng
        );

        // If within radius, trigger alarm
        if (distance <= alarm.radius && !alarm.triggered) {
            triggerAlarm(alarm);
        }
    });
}

// Trigger alarm
function triggerAlarm(alarm) {
    if (isAlarmRinging) return;

    isAlarmRinging = true;
    alarm.triggered = true;
    saveAlarms();

    // Show modal
    const modal = document.getElementById('alarm-modal');
    const message = document.getElementById('alarm-message');
    message.textContent = `به ${alarm.name} رسیدید!`;
    modal.classList.remove('hidden');

    // Play sound
    if (alarmAudio) {
        alarmAudio.loop = true;
        alarmAudio.play().catch(err => console.error('Audio error:', err));
    }

    // Vibrate (if supported)
    if ('vibrate' in navigator) {
        navigator.vibrate([1000, 500, 1000, 500, 1000]);
    }

    // Send notification
    sendNotification(alarm.name);

    // Keep screen awake (if supported)
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(err => console.error('Wake lock error:', err));
    }

    updateAlarmsDisplay();
}

// Stop alarm
function stopAlarm() {
    isAlarmRinging = false;

    // Hide modal
    document.getElementById('alarm-modal').classList.add('hidden');

    // Stop sound
    if (alarmAudio) {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
    }

    // Stop vibration
    if ('vibrate' in navigator) {
        navigator.vibrate(0);
    }
}

// Send notification
function sendNotification(name) {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('آلارم در حرکت', {
                body: `به ${name} رسیدید!`,
                icon: 'icon-192.png',
                vibrate: [200, 100, 200]
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('آلارم در حرکت', {
                        body: `به ${name} رسیدید!`,
                        icon: 'icon-192.png'
                    });
                }
            });
        }
    }
}

// Create alarm sound
function createAlarmSound() {
    // Create AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create a simple beep sound
    const duration = 0.5;
    const frequency = 800;

    alarmAudio = document.createElement('audio');

    // Create a simple alarm tone using data URI
    const sampleRate = 44100;
    const samples = duration * sampleRate;
    const buffer = audioContext.createBuffer(1, samples, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
        channel[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    }

    // Fallback: use a simple beep
    alarmAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUajk77RgGgU7k9n0yXkpBSd5yPLaizsKFV6169t8MgUue8rx3I4+CRZftuva5BpVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUajk77RgGgU7k9n0yXkpBSd5yPLaizsKFV6169t8MgUue8rx3I4+CRZftuva5BpVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUajk77RgGgU7k9n0yXkpBSd5yPLaizsKFV6169t8MgUue8rx3I4+CRZftuva5BpVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUajk77RgGgU7k9n0yXkpBSd5yPLaizsKFV6169t8MgUue8rx3I4+CRZftuva5BpVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUajk77RgGgU7k9n0yXkpBSd5yPLaizsKFV6169t8MgUue8rx3I4+CRZftuva5BpVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUajk77RgGgU7k9n0yXkpBSd5yPLaizsKFV6169t8MgUue8rx3I4+CRZftuva';
}

// Setup event listeners
function setupEventListeners() {
    // Save alarm button
    document.getElementById('save-alarm').addEventListener('click', saveNewAlarm);

    // Stop alarm button
    document.getElementById('stop-alarm').addEventListener('click', stopAlarm);

    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Save new alarm
function saveNewAlarm() {
    if (!selectedLocationMarker) {
        alert('لطفاً ابتدا روی نقشه کلیک کنید و مقصد را انتخاب کنید.');
        return;
    }

    const name = document.getElementById('alarm-name').value.trim();
    const radius = parseInt(document.getElementById('radius').value);

    if (!name) {
        alert('لطفاً نام مقصد را وارد کنید.');
        return;
    }

    const location = selectedLocationMarker.getLatLng();

    const alarm = {
        id: Date.now(),
        name: name,
        lat: location.lat,
        lng: location.lng,
        radius: radius,
        active: true,
        triggered: false
    };

    alarms.push(alarm);
    saveAlarms();
    updateAlarmsDisplay();

    // Clear form
    document.getElementById('alarm-name').value = '';

    // Remove selected marker
    if (selectedLocationMarker) {
        map.removeLayer(selectedLocationMarker);
        selectedLocationMarker = null;
    }

    // Add alarm marker and circle
    addAlarmToMap(alarm);

    alert(`آلارم "${name}" با موفقیت ذخیره شد!`);
}

// Add alarm to map
function addAlarmToMap(alarm) {
    // Add marker
    const marker = L.marker([alarm.lat, alarm.lng], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);

    marker.bindPopup(`<b>${alarm.name}</b><br>شعاع: ${alarm.radius} متر`);

    // Add circle
    const circle = L.circle([alarm.lat, alarm.lng], {
        color: 'green',
        fillColor: '#90EE90',
        fillOpacity: 0.2,
        radius: alarm.radius
    }).addTo(map);

    alarm.marker = marker;
    alarm.circle = circle;
}

// Load alarms from localStorage
function loadAlarms() {
    const saved = localStorage.getItem('alarms');
    if (saved) {
        alarms = JSON.parse(saved);
        alarms.forEach(alarm => {
            addAlarmToMap(alarm);
        });
        updateAlarmsDisplay();
    }
}

// Save alarms to localStorage
function saveAlarms() {
    // Remove marker and circle objects before saving
    const toSave = alarms.map(alarm => ({
        id: alarm.id,
        name: alarm.name,
        lat: alarm.lat,
        lng: alarm.lng,
        radius: alarm.radius,
        active: alarm.active,
        triggered: alarm.triggered
    }));
    localStorage.setItem('alarms', JSON.stringify(toSave));
}

// Update alarms display
function updateAlarmsDisplay() {
    const container = document.getElementById('alarms-list');

    if (alarms.length === 0) {
        container.innerHTML = '<p class="no-alarms">هیچ آلارمی تنظیم نشده است</p>';
        return;
    }

    container.innerHTML = '';

    alarms.forEach(alarm => {
        const div = document.createElement('div');
        div.className = `alarm-item ${alarm.active ? 'active' : ''} ${alarm.triggered ? 'triggered' : ''}`;

        let distance = '---';
        if (userLocation) {
            const dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                alarm.lat,
                alarm.lng
            );
            distance = dist < 1000 ? `${Math.round(dist)} متر` : `${(dist / 1000).toFixed(1)} کیلومتر`;
        }

        div.innerHTML = `
            <h4>${alarm.name}</h4>
            <p>📏 فاصله: ${distance}</p>
            <p>🎯 شعاع: ${alarm.radius} متر</p>
            <p>وضعیت: ${alarm.triggered ? '✅ فعال شده' : alarm.active ? '🟢 فعال' : '⭕ غیرفعال'}</p>
            <button class="btn btn-danger" onclick="deleteAlarm(${alarm.id})">حذف</button>
        `;

        container.appendChild(div);
    });
}

// Delete alarm
function deleteAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
        if (alarm.marker) map.removeLayer(alarm.marker);
        if (alarm.circle) map.removeLayer(alarm.circle);
    }

    alarms = alarms.filter(a => a.id !== id);
    saveAlarms();
    updateAlarmsDisplay();
}

// Update status display
function updateStatusDisplay() {
    if (userLocation) {
        document.getElementById('current-location').textContent =
            `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
    }

    if (alarms.length > 0 && userLocation) {
        let nearestAlarm = null;
        let minDistance = Infinity;

        alarms.forEach(alarm => {
            if (!alarm.active) return;

            const dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                alarm.lat,
                alarm.lng
            );

            if (dist < minDistance) {
                minDistance = dist;
                nearestAlarm = alarm;
            }
        });

        if (nearestAlarm) {
            document.getElementById('nearest-alarm').textContent = nearestAlarm.name;
            const distText = minDistance < 1000 ?
                `${Math.round(minDistance)} متر` :
                `${(minDistance / 1000).toFixed(1)} کیلومتر`;
            document.getElementById('distance').textContent = distText;
        }
    } else {
        document.getElementById('nearest-alarm').textContent = '---';
        document.getElementById('distance').textContent = '---';
    }
}

// Keep screen awake
if ('wakeLock' in navigator) {
    let wakeLock = null;
    const requestWakeLock = async () => {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.error('Wake lock error:', err);
        }
    };
    requestWakeLock();
}
