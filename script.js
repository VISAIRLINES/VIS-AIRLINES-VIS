document.addEventListener('DOMContentLoaded', () => {
    initCustomSelects();
    initCalendar();
    initReturnCalendar();
    initLanguageSelector();
    initAccountMenu();
    initPassengerPanel();
    initTripType();
    initFormHandler();
});

// ========== CUSTOM SELECT DROPDOWNS ==========
const airports = [
    { value: 'CPK', name: 'CPK', country: 'Polska' },
    { value: 'GDN', name: 'Gdańsk', country: 'Polska' },
    { value: 'NCE', name: 'Nicea', country: 'Francja' }
];

let currentSelectType = null; // 'from' lub 'to'

function initCustomSelects() {
    const fromSelect = document.getElementById('fromSelect');
    const toSelect = document.getElementById('toSelect');
    const airportModal = document.getElementById('airportModal');
    const airportModalClose = document.getElementById('airportModalClose');

    initSingleSelect(fromSelect, 'from');
    initSingleSelect(toSelect, 'to');

    // Zamknij modal
    airportModalClose.addEventListener('click', () => {
        airportModal.classList.add('hidden');
    });

    airportModal.addEventListener('click', (e) => {
        if (e.target === airportModal) {
            airportModal.classList.add('hidden');
        }
    });
}

function initSingleSelect(selectElement, inputId) {
    const header = selectElement.querySelector('.select-header');
    const airportModal = document.getElementById('airportModal');
    const airportModalTitle = document.getElementById('airportModalTitle');
    const airportList = document.getElementById('airportList');

    header.addEventListener('click', (e) => {
        e.stopPropagation();
        currentSelectType = inputId;
        
        // Ustaw tytuł modala
        airportModalTitle.textContent = inputId === 'from' ? 'Wybierz lotnisko wylotu' : 'Wybierz lotnisko przylotu';
        
        // Wypełnij listę lotnisk
        renderAirportList(airportList, inputId);
        
        // Otwórz modal
        airportModal.classList.remove('hidden');
    });
}

function renderAirportList(container, inputId) {
    const countries = {};
    
    // Grupuj lotniska według kraju
    airports.forEach(airport => {
        if (!countries[airport.country]) {
            countries[airport.country] = [];
        }
        countries[airport.country].push(airport);
    });
    
    // Wyczyść kontener
    container.innerHTML = '';
    
    // Sortuj kraje alfabetycznie
    const sortedCountries = Object.keys(countries).sort();
    
    // Renderuj grupy krajów
    sortedCountries.forEach(country => {
        const group = document.createElement('div');
        group.className = 'airport-country-group';
        
        const label = document.createElement('div');
        label.className = 'airport-country-label';
        label.textContent = country;
        group.appendChild(label);
        
        countries[country].forEach(airport => {
            const option = document.createElement('div');
            option.className = 'airport-option';
            option.textContent = airport.name;
            option.setAttribute('data-value', airport.value);
            
            option.addEventListener('click', () => {
                selectAirport(airport.value, airport.name, inputId);
            });
            
            group.appendChild(option);
        });
        
        container.appendChild(group);
    });
}

function selectAirport(value, name, inputId) {
    const selectElement = document.getElementById(inputId === 'from' ? 'fromSelect' : 'toSelect');
    const valueSpan = selectElement.querySelector('.select-value');
    const hiddenInput = document.getElementById(inputId);
    
    // Ustaw wartość
    valueSpan.textContent = name;
    valueSpan.classList.remove('placeholder');
    hiddenInput.value = value;
    
    // Zamknij modal
    document.getElementById('airportModal').classList.add('hidden');
}

// ========== MENU KONTA ==========
function initAccountMenu() {
    const accountBtn = document.getElementById('accountBtn');
    const loginModal = document.getElementById('loginModal');
    const loginModalClose = document.getElementById('loginModalClose');
    const loginModalTitle = document.getElementById('loginModalTitle');
    const switchToRegister = document.getElementById('switchToRegister');
    const loginForm = document.getElementById('loginForm');

    if (!accountBtn) return;

    // Kliknięcie w ikonę konta otwiera od razu modal
    accountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        loginModalTitle.textContent = 'Zaloguj się';
        switchToRegister.textContent = 'Nie masz konta? Zarejestruj się';
        loginForm.querySelector('button[type="submit"]').textContent = 'Zaloguj się';
        loginModal.classList.remove('hidden');
    });

    // Zamknij modal
    loginModalClose.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    // Przełączanie między logowaniem a rejestracją
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginModalTitle.textContent === 'Zaloguj się') {
            loginModalTitle.textContent = 'Zarejestruj się';
            switchToRegister.textContent = 'Masz już konto? Zaloguj się';
            loginForm.querySelector('button[type="submit"]').textContent = 'Zarejestruj się';
        } else {
            loginModalTitle.textContent = 'Zaloguj się';
            switchToRegister.textContent = 'Nie masz konta? Zarejestruj się';
            loginForm.querySelector('button[type="submit"]').textContent = 'Zaloguj się';
        }
    });

    // Obsługa formularza
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Funkcja będzie dostępna wkrótce!');
        loginModal.classList.add('hidden');
    });
}

// ========== WYBÓR RODZAJU PODRÓŻY ==========
function initTripType() {
    const tripTypeInputs = document.querySelectorAll('input[name="tripType"]');
    const returnDateGroup = document.getElementById('returnDateGroup');

    tripTypeInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (e.target.value === 'roundtrip') {
                returnDateGroup.style.display = 'block';
            } else {
                returnDateGroup.style.display = 'none';
            }
        });
    });
}

// ========== KALENDARZ WYLOTU ==========
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initCalendar() {
    const dateDisplay = document.getElementById('dateDisplay');
    const calendarDropdown = document.getElementById('calendarDropdown');

    dateDisplay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        calendarDropdown.classList.toggle('hidden');
        
        if (!calendarDropdown.classList.contains('hidden')) {
            renderCalendar();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group') || e.target.closest('#returnDateGroup')) {
            calendarDropdown.classList.add('hidden');
        }
    });

    const today = new Date();
    selectDate(today.getFullYear(), today.getMonth(), today.getDate());
}

function renderCalendar() {
    const calendarDropdown = document.getElementById('calendarDropdown');
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let calendarHTML = `
        <div class="calendar-header">
            <h3>${monthNames[currentMonth]} ${currentYear}</h3>
            <div class="calendar-nav">
                <button type="button" class="cal-prev">&lt;</button>
                <button type="button" class="cal-next">&gt;</button>
            </div>
        </div>
        <div class="calendar-weekdays">
            <div class="calendar-weekday">Pn</div>
            <div class="calendar-weekday">Wt</div>
            <div class="calendar-weekday">Śr</div>
            <div class="calendar-weekday">Cz</div>
            <div class="calendar-weekday">Pt</div>
            <div class="calendar-weekday">So</div>
            <div class="calendar-weekday">Nd</div>
        </div>
        <div class="calendar-days">
    `;

    for (let i = firstDayIndex; i > 0; i--) {
        calendarHTML += `<button type="button" class="calendar-day empty"></button>`;
    }

    for (let day = 1; day <= lastDayDate; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isPast = date < today;
        const isToday = date.getTime() === today.getTime();
        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
        
        let classes = 'calendar-day';
        if (isPast) classes += ' disabled';
        if (isToday) classes += ' today';
        if (isSelected) classes += ' selected';

        calendarHTML += `<button type="button" class="${classes}" 
            data-year="${currentYear}" data-month="${currentMonth}" data-day="${day}"
            ${isPast ? 'disabled' : ''}>${day}</button>`;
    }

    calendarHTML += '</div>';
    calendarDropdown.innerHTML = calendarHTML;

    const prevBtn = calendarDropdown.querySelector('.cal-prev');
    const nextBtn = calendarDropdown.querySelector('.cal-next');
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeMonth(-1);
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeMonth(1);
    });

    const dayBtns = calendarDropdown.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
    dayBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const year = parseInt(btn.getAttribute('data-year'));
            const month = parseInt(btn.getAttribute('data-month'));
            const day = parseInt(btn.getAttribute('data-day'));
            selectDate(year, month, day);
        });
    });
}

function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    document.getElementById('date').value = dateStr;
    document.getElementById('dateDisplay').value = formatDateDisplay(selectedDate);
    document.getElementById('calendarDropdown').classList.add('hidden');
}

function formatDateDisplay(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
}

// ========== KALENDARZ POWROTU ==========
let selectedReturnDate = null;
let returnCurrentMonth = new Date().getMonth();
let returnCurrentYear = new Date().getFullYear();

function initReturnCalendar() {
    const returnDateDisplay = document.getElementById('returnDateDisplay');
    const returnCalendarDropdown = document.getElementById('returnCalendarDropdown');

    if (!returnDateDisplay) return;

    returnDateDisplay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        returnCalendarDropdown.classList.toggle('hidden');
        
        if (!returnCalendarDropdown.classList.contains('hidden')) {
            renderReturnCalendar();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#returnDateGroup')) {
            returnCalendarDropdown.classList.add('hidden');
        }
    });
}

function renderReturnCalendar() {
    const returnCalendarDropdown = document.getElementById('returnCalendarDropdown');
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    
    const firstDay = new Date(returnCurrentYear, returnCurrentMonth, 1);
    const lastDay = new Date(returnCurrentYear, returnCurrentMonth + 1, 0);
    
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const lastDayDate = lastDay.getDate();
    
    const minDate = selectedDate ? new Date(selectedDate.getTime() + 86400000) : new Date();
    minDate.setHours(0, 0, 0, 0);

    let calendarHTML = `
        <div class="calendar-header">
            <h3>${monthNames[returnCurrentMonth]} ${returnCurrentYear}</h3>
            <div class="calendar-nav">
                <button type="button" class="ret-cal-prev">&lt;</button>
                <button type="button" class="ret-cal-next">&gt;</button>
            </div>
        </div>
        <div class="calendar-weekdays">
            <div class="calendar-weekday">Pn</div>
            <div class="calendar-weekday">Wt</div>
            <div class="calendar-weekday">Śr</div>
            <div class="calendar-weekday">Cz</div>
            <div class="calendar-weekday">Pt</div>
            <div class="calendar-weekday">So</div>
            <div class="calendar-weekday">Nd</div>
        </div>
        <div class="calendar-days">
    `;

    for (let i = firstDayIndex; i > 0; i--) {
        calendarHTML += `<button type="button" class="calendar-day empty"></button>`;
    }

    for (let day = 1; day <= lastDayDate; day++) {
        const date = new Date(returnCurrentYear, returnCurrentMonth, day);
        const isPast = date < minDate;
        const isSelected = selectedReturnDate && date.getTime() === selectedReturnDate.getTime();
        
        let classes = 'calendar-day';
        if (isPast) classes += ' disabled';
        if (isSelected) classes += ' selected';

        calendarHTML += `<button type="button" class="${classes}" 
            data-year="${returnCurrentYear}" data-month="${returnCurrentMonth}" data-day="${day}"
            ${isPast ? 'disabled' : ''}>${day}</button>`;
    }

    calendarHTML += '</div>';
    returnCalendarDropdown.innerHTML = calendarHTML;

    const prevBtn = returnCalendarDropdown.querySelector('.ret-cal-prev');
    const nextBtn = returnCalendarDropdown.querySelector('.ret-cal-next');
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeReturnMonth(-1);
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        changeReturnMonth(1);
    });

    const dayBtns = returnCalendarDropdown.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
    dayBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const year = parseInt(btn.getAttribute('data-year'));
            const month = parseInt(btn.getAttribute('data-month'));
            const day = parseInt(btn.getAttribute('data-day'));
            selectReturnDate(year, month, day);
        });
    });
}

function changeReturnMonth(direction) {
    returnCurrentMonth += direction;
    if (returnCurrentMonth < 0) {
        returnCurrentMonth = 11;
        returnCurrentYear--;
    } else if (returnCurrentMonth > 11) {
        returnCurrentMonth = 0;
        returnCurrentYear++;
    }
    renderReturnCalendar();
}

function selectReturnDate(year, month, day) {
    selectedReturnDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    document.getElementById('returnDate').value = dateStr;
    document.getElementById('returnDateDisplay').value = formatDateDisplay(selectedReturnDate);
    document.getElementById('returnCalendarDropdown').classList.add('hidden');
}

// ========== SELEKTOR JĘZYKA ==========
function initLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');

    if (!langBtn) return;

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
        // Zamknij też menu konta
        const accountDropdown = document.getElementById('accountDropdown');
        if (accountDropdown && !accountDropdown.classList.contains('hidden')) {
            accountDropdown.classList.add('hidden');
        }
    });

    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Funkcja tłumaczenia będzie dostępna wkrótce!');
        });
    });
}

// ========== PANEL PASAŻERÓW ==========
let passengers = {
    adult: 1,
    teen: 0,
    child: 0,
    disabled: 0
};

function initPassengerPanel() {
    const passengerBtn = document.getElementById('passengerBtn');
    const passengerPanel = document.getElementById('passengerPanel');
    const doneBtn = document.getElementById('doneBtn');

    passengerBtn.addEventListener('click', () => {
        passengerPanel.classList.toggle('hidden');
    });

    doneBtn.addEventListener('click', () => {
        passengerPanel.classList.add('hidden');
        updatePassengerSummary();
    });

    const counters = document.querySelectorAll('.btn-counter');
    counters.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const action = btn.getAttribute('data-action');
            updateCounter(type, action);
        });
    });

    const classInputs = document.querySelectorAll('input[name="class"]');
    classInputs.forEach(input => {
        input.addEventListener('change', updatePassengerSummary);
    });
}

function updateCounter(type, action) {
    const countElement = document.getElementById(`${type}Count`);
    let currentValue = passengers[type];

    if (action === 'plus') {
        if (getTotalPassengers() < 9) {
            passengers[type]++;
        }
    } else if (action === 'minus') {
        if (currentValue > 0) {
            if (type === 'adult' && currentValue === 1) {
                alert('Musi być przynajmniej 1 dorosły pasażer');
                return;
            }
            passengers[type]--;
        }
    }

    countElement.textContent = passengers[type];
    updatePassengerSummary();
}

function getTotalPassengers() {
    return passengers.adult + passengers.teen + passengers.child + passengers.disabled;
}

function updatePassengerSummary() {
    const selectedClass = document.querySelector('input[name="class"]:checked').value;
    const classNames = {
        economy: 'Ekonomiczna',
        premium: 'Premium',
        business: 'Biznes',
        first: 'Pierwsza'
    };

    const parts = [];
    if (passengers.adult > 0) parts.push(`${passengers.adult} Dorosły(ch)`);
    if (passengers.teen > 0) parts.push(`${passengers.teen} Nastolatek/Nastolatków`);
    if (passengers.child > 0) parts.push(`${passengers.child} Dziecko/Dzieci`);
    if (passengers.disabled > 0) parts.push(`${passengers.disabled} Osoba niepełnosprawna`);

    const passengerText = parts.join(', ');
    document.getElementById('passengerSummary').textContent = 
        `${passengerText}, ${classNames[selectedClass]}`;
}

// ========== OBSŁUGA FORMULARZA ==========
function initFormHandler() {
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleSubmit);
}

function handleSubmit(e) {
    e.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const tripType = document.querySelector('input[name="tripType"]:checked').value;
    const returnDate = tripType === 'roundtrip' ? document.getElementById('returnDate').value : null;
    const travelClass = document.querySelector('input[name="class"]:checked').value;

    if (!date) {
        alert('Proszę wybrać datę wylotu');
        return;
    }

    if (tripType === 'roundtrip' && !returnDate) {
        alert('Proszę wybrać datę powrotu');
        return;
    }

    if (from === to) {
        alert('Miasto wylotu i przylotu muszą być różne!');
        return;
    }

    const searchData = {
        from,
        to,
        date,
        tripType,
        returnDate,
        class: travelClass,
        passengers: { ...passengers }
    };

    localStorage.setItem('searchData', JSON.stringify(searchData));
    window.location.href = 'results.html';
}
