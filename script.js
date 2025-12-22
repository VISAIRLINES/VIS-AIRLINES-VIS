// === DANE LOTNISK ===
// Możesz łatwo dodawać nowe kraje i lotniska
const airports = {
‘Polska’: [
{ code: ‘GDN’, name: ‘Lotnisko Gdańsk’, city: ‘Gdańsk’ }
]
};

// === STAN APLIKACJI ===
let state = {
tripType: ‘oneWay’,
from: null,
to: null,
departureDate: null,
passengers: {
adults: 1,
children: 0,
infants: 0
},
flightClass: ‘economy’
};

// === INICJALIZACJA ===
document.addEventListener(‘DOMContentLoaded’, function() {
initModals();
initAuth();
initAirportSearch();
initCalendar();
initPassengerCounter();
initTripType();
});

// === OBSŁUGA MODALI ===
function initModals() {
// Otwieranie modali
document.getElementById(‘userBtn’).addEventListener(‘click’, () => openModal(‘authModal’));
document.getElementById(‘fromBtn’).addEventListener(‘click’, () => openModal(‘fromModal’));
document.getElementById(‘toBtn’).addEventListener(‘click’, () => openModal(‘toModal’));
document.getElementById(‘dateBtn’).addEventListener(‘click’, () => openModal(‘dateModal’));
document.getElementById(‘passengerBtn’).addEventListener(‘click’, () => openModal(‘passengerModal’));


// Zamykanie modali
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        closeModal(this.dataset.modal);
    });
});

// Zamykanie po kliknięciu w tło
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    });
});


}

function openModal(modalId) {
document.getElementById(modalId).classList.add(‘active’);
document.body.style.overflow = ‘hidden’;
}

function closeModal(modalId) {
document.getElementById(modalId).classList.remove(‘active’);
document.body.style.overflow = ‘auto’;
}

// === SYSTEM LOGOWANIA/REJESTRACJI ===
function initAuth() {
let authMode = ‘login’; // ‘login’ lub ‘register’


const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const switchAuthBtn = document.getElementById('switchAuthMode');
const nameGroup = document.getElementById('nameGroup');
const confirmGroup = document.getElementById('confirmGroup');

switchAuthBtn.addEventListener('click', function() {
    authMode = authMode === 'login' ? 'register' : 'login';
    
    if (authMode === 'login') {
        authTitle.textContent = 'Zaloguj się';
        authSubmitBtn.textContent = 'Zaloguj się';
        switchAuthBtn.textContent = 'Nie masz konta? Zarejestruj się';
        nameGroup.style.display = 'none';
        confirmGroup.style.display = 'none';
    } else {
        authTitle.textContent = 'Zarejestruj się';
        authSubmitBtn.textContent = 'Zarejestruj się';
        switchAuthBtn.textContent = 'Masz już konto? Zaloguj się';
        nameGroup.style.display = 'block';
        confirmGroup.style.display = 'block';
    }
});

document.getElementById('authForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert(authMode === 'login' ? 'Logowanie...' : 'Rejestracja...');
    closeModal('authModal');
});


}

// === WYSZUKIWARKA LOTNISK ===
function initAirportSearch() {
renderAirports(‘fromAirportList’, ‘from’);
renderAirports(‘toAirportList’, ‘to’);


// Wyszukiwanie dla "Skąd"
document.getElementById('searchFrom').addEventListener('input', function(e) {
    filterAirports(e.target.value, 'fromAirportList');
});

// Wyszukiwanie dla "Dokąd"
document.getElementById('searchTo').addEventListener('input', function(e) {
    filterAirports(e.target.value, 'toAirportList');
});


}

function renderAirports(containerId, type) {
const container = document.getElementById(containerId);
container.innerHTML = ‘’;


Object.entries(airports).forEach(([country, airportList]) => {
    const countryGroup = document.createElement('div');
    countryGroup.className = 'country-group';
    countryGroup.dataset.country = country;

    const countryTitle = document.createElement('div');
    countryTitle.className = 'country-title';
    countryTitle.textContent = country;
    countryGroup.appendChild(countryTitle);

    airportList.forEach(airport => {
        const airportItem = document.createElement('div');
        airportItem.className = 'airport-item';
        airportItem.dataset.search = `${airport.city} ${airport.name} ${airport.code}`.toLowerCase();
        
        airportItem.innerHTML = `
            <div class="airport-name">${airport.city}</div>
            <div class="airport-code">${airport.name} (${airport.code})</div>
        `;

        airportItem.addEventListener('click', () => selectAirport(airport, type));
        countryGroup.appendChild(airportItem);
    });

    container.appendChild(countryGroup);
});


}

function selectAirport(airport, type) {
const displayText = `${airport.city} (${airport.code})`;


if (type === 'from') {
    state.from = airport;
    document.getElementById('fromText').textContent = displayText;
    closeModal('fromModal');
} else {
    state.to = airport;
    document.getElementById('toText').textContent = displayText;
    closeModal('toModal');
}


}

function filterAirports(searchTerm, containerId) {
const container = document.getElementById(containerId);
const term = searchTerm.toLowerCase();


const countryGroups = container.querySelectorAll('.country-group');

countryGroups.forEach(group => {
    const items = group.querySelectorAll('.airport-item');
    let visibleCount = 0;

    items.forEach(item => {
        const searchText = item.dataset.search;
        if (searchText.includes(term)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    // Ukryj kraj jeśli nie ma żadnych pasujących lotnisk
    group.style.display = visibleCount > 0 ? 'block' : 'none';
});


}

// === KALENDARZ ===
function initCalendar() {
renderCalendar();
}

function renderCalendar() {
const calendar = document.getElementById(‘calendar’);
calendar.innerHTML = ‘’;


const today = new Date();
today.setHours(0, 0, 0, 0);

// Renderuj 12 miesięcy do przodu
for (let i = 0; i < 12; i++) {
    const currentDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    calendar.appendChild(createMonthCalendar(currentDate, today));
}


}

function createMonthCalendar(date, today) {
const monthDiv = document.createElement(‘div’);
monthDiv.className = ‘month-calendar’;


const monthTitle = document.createElement('div');
monthTitle.className = 'month-title';
monthTitle.textContent = date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
monthDiv.appendChild(monthTitle);

const grid = document.createElement('div');
grid.className = 'calendar-grid';

// Dni tygodnia
const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
dayNames.forEach(name => {
    const dayName = document.createElement('div');
    dayName.className = 'calendar-day-name';
    dayName.textContent = name;
    grid.appendChild(dayName);
});

// Dni miesiąca
const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

// Poniedziałek = 1, Niedziela = 0 -> zmieniamy na 7
let startPadding = firstDay.getDay();
startPadding = startPadding === 0 ? 6 : startPadding - 1;

// Puste komórki przed pierwszym dniem
for (let i = 0; i < startPadding; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    grid.appendChild(emptyDay);
}

// Dni miesiąca
for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;

    if (dayDate < today) {
        dayDiv.classList.add('disabled');
    } else {
        dayDiv.addEventListener('click', () => selectDate(dayDate));
    }

    grid.appendChild(dayDiv);
}

monthDiv.appendChild(grid);
return monthDiv;


}

function selectDate(date) {
state.departureDate = date;
const formatted = date.toLocaleDateString(‘pl-PL’, {
day: ‘numeric’,
month: ‘long’,
year: ‘numeric’
});
document.getElementById(‘dateText’).textContent = formatted;


// Oznacz wybrany dzień
document.querySelectorAll('.calendar-day').forEach(day => {
    day.classList.remove('selected');
});
event.target.classList.add('selected');

closeModal('dateModal');


}

// === PASAŻEROWIE I KLASA ===
function initPassengerCounter() {
const counters = document.querySelectorAll(’.counter-btn’);


counters.forEach(btn => {
    btn.addEventListener('click', function() {
        const action = this.dataset.action;
        const type = this.dataset.type;
        
        if (action === 'increase') {
            state.passengers[type]++;
        } else if (action === 'decrease' && state.passengers[type] > 0) {
            // Dorośli muszą być minimum 1
            if (type === 'adults' && state.passengers[type] === 1) return;
            state.passengers[type]--;
        }
        
        updatePassengerDisplay();
    });
});

// Klasa lotu
document.querySelectorAll('input[name="class"]').forEach(radio => {
    radio.addEventListener('change', function() {
        state.flightClass = this.value;
        updatePassengerDisplay();
    });
});

// Przycisk potwierdzenia
document.getElementById('confirmPassenger').addEventListener('click', () => {
    closeModal('passengerModal');
});


}

function updatePassengerDisplay() {
// Aktualizuj liczniki w modalu
document.getElementById(‘adultsCount’).textContent = state.passengers.adults;
document.getElementById(‘childrenCount’).textContent = state.passengers.children;
document.getElementById(‘infantsCount’).textContent = state.passengers.infants;


// Aktualizuj tekst na przycisku
const total = state.passengers.adults + state.passengers.children + state.passengers.infants;
const passengerText = `${total} ${total === 1 ? 'Pasażer' : total < 5 ? 'Pasażerów' : 'Pasażerów'}`;

const classText = state.flightClass === 'economy' ? 'Ekonomiczna' : 
                  state.flightClass === 'business' ? 'Biznes' : 'Pierwsza';

document.getElementById('passengerText').textContent = `${passengerText}, ${classText}`;


}

// === TYP PODRÓŻY ===
function initTripType() {
document.querySelectorAll(‘input[name=“tripType”]’).forEach(radio => {
radio.addEventListener(‘change’, function() {
state.tripType = this.value;
console.log(‘Typ podróży:’, state.tripType);
});
});
}

// === PRZYCISK SZUKAJ ===
document.querySelector(’.search-btn’).addEventListener(‘click’, function() {
console.log(‘Wyszukiwanie lotów:’, state);


// Walidacja
if (!state.from) {
    alert('Wybierz lotnisko wylotu');
    return;
}
if (!state.to) {
    alert('Wybierz lotnisko przylotu');
    return;
}
if (!state.departureDate) {
    alert('Wybierz datę wylotu');
    return;
}

// Tutaj będzie przekierowanie do strony wyników
alert('Szukam lotów...\n\n' + 
      'Z: ' + state.from.city + '\n' +
      'Do: ' + state.to.city + '\n' +
      'Data: ' + state.departureDate.toLocaleDateString('pl-PL'));


});