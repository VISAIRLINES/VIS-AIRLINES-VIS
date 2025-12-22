// === DANE LOTNISK ===
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

// === INICJALIZACJA - FIX DLA SAFARI ===
window.onload = function() {
console.log(‘Strona załadowana!’);
initModals();
initAuth();
initAirportSearch();
initCalendar();
initPassengerCounter();
initTripType();
initSearchButton();
};

// === OBSŁUGA MODALI ===
function initModals() {
console.log(‘Inicjalizacja modali…’);


// Otwieranie modali - FIX: dodany addEventListener bezpośrednio
const userBtn = document.getElementById('userBtn');
const fromBtn = document.getElementById('fromBtn');
const toBtn = document.getElementById('toBtn');
const dateBtn = document.getElementById('dateBtn');
const passengerBtn = document.getElementById('passengerBtn');

if (userBtn) {
    userBtn.onclick = function() {
        console.log('Kliknięto user');
        openModal('authModal');
    };
}

if (fromBtn) {
    fromBtn.onclick = function(e) {
        e.preventDefault();
        console.log('Kliknięto skąd');
        openModal('fromModal');
    };
}

if (toBtn) {
    toBtn.onclick = function(e) {
        e.preventDefault();
        console.log('Kliknięto dokąd');
        openModal('toModal');
    };
}

if (dateBtn) {
    dateBtn.onclick = function(e) {
        e.preventDefault();
        console.log('Kliknięto datę');
        openModal('dateModal');
    };
}

if (passengerBtn) {
    passengerBtn.onclick = function(e) {
        e.preventDefault();
        console.log('Kliknięto pasażerów');
        openModal('passengerModal');
    };
}

// Zamykanie modali
const closeButtons = document.querySelectorAll('.close-btn');
closeButtons.forEach(function(btn) {
    btn.onclick = function() {
        const modalId = this.getAttribute('data-modal');
        closeModal(modalId);
    };
});

// Zamykanie po kliknięciu w tło
const modals = document.querySelectorAll('.modal');
modals.forEach(function(modal) {
    modal.onclick = function(e) {
        if (e.target === this) {
            closeModal(this.id);
        }
    };
});


}

function openModal(modalId) {
console.log(‘Otwieranie:’, modalId);
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.add(‘active’);
document.body.style.overflow = ‘hidden’;
} else {
console.error(‘Nie znaleziono modala:’, modalId);
}
}

function closeModal(modalId) {
console.log(‘Zamykanie:’, modalId);
const modal = document.getElementById(modalId);
if (modal) {
modal.classList.remove(‘active’);
document.body.style.overflow = ‘auto’;
}
}

// === SYSTEM LOGOWANIA/REJESTRACJI ===
function initAuth() {
let authMode = ‘login’;


const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const switchAuthBtn = document.getElementById('switchAuthMode');
const nameGroup = document.getElementById('nameGroup');
const confirmGroup = document.getElementById('confirmGroup');
const authForm = document.getElementById('authForm');

if (switchAuthBtn) {
    switchAuthBtn.onclick = function() {
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
    };
}

if (authForm) {
    authForm.onsubmit = function(e) {
        e.preventDefault();
        alert(authMode === 'login' ? 'Logowanie...' : 'Rejestracja...');
        closeModal('authModal');
    };
}


}

// === WYSZUKIWARKA LOTNISK ===
function initAirportSearch() {
renderAirports(‘fromAirportList’, ‘from’);
renderAirports(‘toAirportList’, ‘to’);


const searchFrom = document.getElementById('searchFrom');
const searchTo = document.getElementById('searchTo');

if (searchFrom) {
    searchFrom.oninput = function() {
        filterAirports(this.value, 'fromAirportList');
    };
}

if (searchTo) {
    searchTo.oninput = function() {
        filterAirports(this.value, 'toAirportList');
    };
}


}

function renderAirports(containerId, type) {
const container = document.getElementById(containerId);
if (!container) return;


container.innerHTML = '';

for (const country in airports) {
    const airportList = airports[country];
    
    const countryGroup = document.createElement('div');
    countryGroup.className = 'country-group';
    countryGroup.setAttribute('data-country', country);

    const countryTitle = document.createElement('div');
    countryTitle.className = 'country-title';
    countryTitle.textContent = country;
    countryGroup.appendChild(countryTitle);

    for (let i = 0; i < airportList.length; i++) {
        const airport = airportList[i];
        const airportItem = document.createElement('div');
        airportItem.className = 'airport-item';
        const searchText = (airport.city + ' ' + airport.name + ' ' + airport.code).toLowerCase();
        airportItem.setAttribute('data-search', searchText);
        
        airportItem.innerHTML = '<div class="airport-name">' + airport.city + '</div>' +
                               '<div class="airport-code">' + airport.name + ' (' + airport.code + ')</div>';

        airportItem.onclick = function() {
            selectAirport(airport, type);
        };
        
        countryGroup.appendChild(airportItem);
    }

    container.appendChild(countryGroup);
}


}

function selectAirport(airport, type) {
const displayText = airport.city + ’ (’ + airport.code + ‘)’;


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
if (!container) return;


const term = searchTerm.toLowerCase();
const countryGroups = container.querySelectorAll('.country-group');

for (let i = 0; i < countryGroups.length; i++) {
    const group = countryGroups[i];
    const items = group.querySelectorAll('.airport-item');
    let visibleCount = 0;

    for (let j = 0; j < items.length; j++) {
        const item = items[j];
        const searchText = item.getAttribute('data-search');
        if (searchText.indexOf(term) !== -1) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    }

    group.style.display = visibleCount > 0 ? 'block' : 'none';
}


}

// === KALENDARZ ===
function initCalendar() {
renderCalendar();
}

function renderCalendar() {
const calendar = document.getElementById(‘calendar’);
if (!calendar) return;


calendar.innerHTML = '';

const today = new Date();
today.setHours(0, 0, 0, 0);

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
const monthNames = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 
                   'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
monthTitle.textContent = monthNames[date.getMonth()] + ' ' + date.getFullYear();
monthDiv.appendChild(monthTitle);

const grid = document.createElement('div');
grid.className = 'calendar-grid';

const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
for (let i = 0; i < dayNames.length; i++) {
    const dayName = document.createElement('div');
    dayName.className = 'calendar-day-name';
    dayName.textContent = dayNames[i];
    grid.appendChild(dayName);
}

const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

let startPadding = firstDay.getDay();
startPadding = startPadding === 0 ? 6 : startPadding - 1;

for (let i = 0; i < startPadding; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    grid.appendChild(emptyDay);
}

for (let day = 1; day <= lastDay.getDate(); day++) {
    const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;

    if (dayDate < today) {
        dayDiv.classList.add('disabled');
    } else {
        dayDiv.onclick = function() {
            selectDate(dayDate, this);
        };
    }

    grid.appendChild(dayDiv);
}

monthDiv.appendChild(grid);
return monthDiv;


}

function selectDate(date, element) {
state.departureDate = date;
const monthNames = [‘stycznia’, ‘lutego’, ‘marca’, ‘kwietnia’, ‘maja’, ‘czerwca’,
‘lipca’, ‘sierpnia’, ‘września’, ‘października’, ‘listopada’, ‘grudnia’];
const formatted = date.getDate() + ’ ’ + monthNames[date.getMonth()] + ’ ’ + date.getFullYear();
document.getElementById(‘dateText’).textContent = formatted;


const allDays = document.querySelectorAll('.calendar-day');
for (let i = 0; i < allDays.length; i++) {
    allDays[i].classList.remove('selected');
}
element.classList.add('selected');

closeModal('dateModal');


}

// === PASAŻEROWIE I KLASA ===
function initPassengerCounter() {
const counters = document.querySelectorAll(’.counter-btn’);


for (let i = 0; i < counters.length; i++) {
    const btn = counters[i];
    btn.onclick = function() {
        const action = this.getAttribute('data-action');
        const type = this.getAttribute('data-type');
        
        if (action === 'increase') {
            state.passengers[type]++;
        } else if (action === 'decrease' && state.passengers[type] > 0) {
            if (type === 'adults' && state.passengers[type] === 1) return;
            state.passengers[type]--;
        }
        
        updatePassengerDisplay();
    };
}

const classRadios = document.querySelectorAll('input[name="class"]');
for (let i = 0; i < classRadios.length; i++) {
    classRadios[i].onchange = function() {
        state.flightClass = this.value;
        updatePassengerDisplay();
    };
}

const confirmBtn = document.getElementById('confirmPassenger');
if (confirmBtn) {
    confirmBtn.onclick = function() {
        closeModal('passengerModal');
    };
}


}

function updatePassengerDisplay() {
document.getElementById(‘adultsCount’).textContent = state.passengers.adults;
document.getElementById(‘childrenCount’).textContent = state.passengers.children;
document.getElementById(‘infantsCount’).textContent = state.passengers.infants;


const total = state.passengers.adults + state.passengers.children + state.passengers.infants;
const passengerText = total + ' ' + (total === 1 ? 'Pasażer' : total < 5 ? 'Pasażerów' : 'Pasażerów');

const classText = state.flightClass === 'economy' ? 'Ekonomiczna' : 
                  state.flightClass === 'business' ? 'Biznes' : 'Pierwsza';

document.getElementById('passengerText').textContent = passengerText + ', ' + classText;


}

// === TYP PODRÓŻY ===
function initTripType() {
const tripRadios = document.querySelectorAll(‘input[name=“tripType”]’);
for (let i = 0; i < tripRadios.length; i++) {
tripRadios[i].onchange = function() {
state.tripType = this.value;
console.log(‘Typ podróży:’, state.tripType);
};
}
}

// === PRZYCISK SZUKAJ ===
function initSearchButton() {
const searchBtn = document.querySelector(’.search-btn’);
if (searchBtn) {
searchBtn.onclick = function() {
console.log(‘Wyszukiwanie lotów:’, state);


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
        
        alert('Szukam lotów...\n\nZ: ' + state.from.city + '\nDo: ' + state.to.city + '\nData: ' + state.departureDate.toLocaleDateString('pl-PL'));
    };
}


}