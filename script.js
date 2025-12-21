// Lista lotnisk
const airports = [
{ value: ‘CPK’, name: ‘CPK’, country: ‘Polska’ },
{ value: ‘GDN’, name: ‘Gdańsk’, country: ‘Polska’ },
{ value: ‘NCE’, name: ‘Nicea’, country: ‘Francja’ },
{ value: ‘JFK’, name: ‘Nowy Jork’, country: ‘USA’ },
{ value: ‘KIV’, name: ‘Kiszyniów’, country: ‘Mołdawia’ }
];

let currentSelectType = null;

document.addEventListener(‘DOMContentLoaded’, function() {
initCustomSelects();
initCalendar();
initReturnCalendar();
initLanguageSelector();
initAccountMenu();
initPassengerPanel();
initTripType();
initFormHandler();
initHamburgerMenu();
});

// ========== CUSTOM SELECT DROPDOWNS ==========
function initCustomSelects() {
const fromSelect = document.getElementById(‘fromSelect’);
const toSelect = document.getElementById(‘toSelect’);
const airportModal = document.getElementById(‘airportModal’);
const airportModalClose = document.getElementById(‘airportModalClose’);

```
if (!fromSelect || !toSelect || !airportModal || !airportModalClose) return;

initSingleSelect(fromSelect, 'from');
initSingleSelect(toSelect, 'to');

airportModalClose.addEventListener('click', function() {
    airportModal.classList.add('hidden');
});

airportModal.addEventListener('click', function(e) {
    if (e.target === airportModal) {
        airportModal.classList.add('hidden');
    }
});
```

}

function initSingleSelect(selectElement, inputId) {
const header = selectElement.querySelector(’.select-header’);

```
if (!header) return;

header.addEventListener('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const airportModal = document.getElementById('airportModal');
    const airportModalTitle = document.getElementById('airportModalTitle');
    const airportList = document.getElementById('airportList');
    
    if (!airportModal || !airportModalTitle || !airportList) return;
    
    currentSelectType = inputId;
    airportModalTitle.textContent = inputId === 'from' ? 'Wybierz lotnisko wylotu' : 'Wybierz lotnisko przylotu';
    
    renderAirportList(airportList, inputId);
    
    airportModal.classList.remove('hidden');
});
```

}

function renderAirportList(container, inputId) {
if (!container) return;

```
const countries = {};

airports.forEach(function(airport) {
    if (!countries[airport.country]) {
        countries[airport.country] = [];
    }
    countries[airport.country].push(airport);
});

container.innerHTML = '';

const sortedCountries = Object.keys(countries).sort();

sortedCountries.forEach(function(country) {
    const group = document.createElement('div');
    group.className = 'airport-country-group';
    
    const label = document.createElement('div');
    label.className = 'airport-country-label';
    label.textContent = country;
    group.appendChild(label);
    
    countries[country].forEach(function(airport) {
        const option = document.createElement('div');
        option.className = 'airport-option';
        option.textContent = airport.name;
        option.setAttribute('data-value', airport.value);
        
        option.addEventListener('click', function() {
            selectAirport(airport.value, airport.name, inputId);
        });
        
        group.appendChild(option);
    });
    
    container.appendChild(group);
});
```

}

function selectAirport(value, name, inputId) {
const selectElement = document.getElementById(inputId === ‘from’ ? ‘fromSelect’ : ‘toSelect’);
const valueSpan = selectElement.querySelector(’.select-value’);
const hiddenInput = document.getElementById(inputId);
const airportModal = document.getElementById(‘airportModal’);

```
valueSpan.textContent = name;
valueSpan.classList.remove('placeholder');
hiddenInput.value = value;

airportModal.classList.add('hidden');
```

}

// ========== MENU KONTA ==========
function initAccountMenu() {
const accountBtn = document.getElementById(‘accountBtn’);
const loginModal = document.getElementById(‘loginModal’);
const loginModalClose = document.getElementById(‘loginModalClose’);
const loginModalTitle = document.getElementById(‘loginModalTitle’);
const switchToRegister = document.getElementById(‘switchToRegister’);
const loginForm = document.getElementById(‘loginForm’);

```
if (!accountBtn || !loginModal) return;

accountBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (loginModalTitle) loginModalTitle.textContent = 'Zaloguj się';
    if (switchToRegister) switchToRegister.textContent = 'Nie masz konta? Zarejestruj się';
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = 'Zaloguj się';
    loginModal.classList.remove('hidden');
});

if (loginModalClose) {
    loginModalClose.addEventListener('click', function() {
        loginModal.classList.add('hidden');
    });
}

loginModal.addEventListener('click', function(e) {
    if (e.target === loginModal) {
        loginModal.classList.add('hidden');
    }
});

if (switchToRegister) {
    switchToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        if (loginModalTitle.textContent === 'Zaloguj się') {
            loginModalTitle.textContent = 'Zarejestruj się';
            switchToRegister.textContent = 'Masz już konto? Zaloguj się';
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Zarejestruj się';
        } else {
            loginModalTitle.textContent = 'Zaloguj się';
            switchToRegister.textContent = 'Nie masz konta? Zarejestruj się';
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Zaloguj się';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Funkcja będzie dostępna wkrótce!');
        loginModal.classList.add('hidden');
    });
}
```

}

// ========== WYBÓR RODZAJU PODRÓŻY ==========
function initTripType() {
const tripTypeInputs = document.querySelectorAll(‘input[name=“tripType”]’);
const returnDateGroup = document.getElementById(‘returnDateGroup’);

```
if (!returnDateGroup) return;

tripTypeInputs.forEach(function(input) {
    input.addEventListener('change', function(e) {
        if (e.target.value === 'roundtrip') {
            returnDateGroup.style.display = 'block';
        } else {
            returnDateGroup.style.display = 'none';
        }
    });
});
```

}

// ========== KALENDARZ WYLOTU ==========
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initCalendar() {
const dateDisplay = document.getElementById(‘dateDisplay’);
const calendarDropdown = document.getElementById(‘calendarDropdown’);

```
if (!dateDisplay || !calendarDropdown) return;

dateDisplay.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Zamknij kalendarz powrotu jeśli jest otwarty
    const returnCalendarDropdown = document.getElementById('returnCalendarDropdown');
    if (returnCalendarDropdown) {
        returnCalendarDropdown.classList.add('hidden');
    }
    
    calendarDropdown.classList.toggle('hidden');
    
    if (!calendarDropdown.classList.contains('hidden')) {
        renderCalendar();
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.date-input-wrapper') && !e.target.closest('#calendarDropdown')) {
        calendarDropdown.classList.add('hidden');
    }
});

const today = new Date();
selectDate(today.getFullYear(), today.getMonth(), today.getDate());
```

}

function renderCalendar() {
const calendarDropdown = document.getElementById(‘calendarDropdown’);
if (!calendarDropdown) return;

```
const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                   'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

const firstDay = new Date(currentYear, currentMonth, 1);
const lastDay = new Date(currentYear, currentMonth + 1, 0);

const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
const lastDayDate = lastDay.getDate();

const today = new Date();
today.setHours(0, 0, 0, 0);

let calendarHTML = '<div class="calendar-header"><h3>' + monthNames[currentMonth] + ' ' + currentYear + '</h3><div class="calendar-nav"><button type="button" class="cal-prev">&lt;</button><button type="button" class="cal-next">&gt;</button></div></div><div class="calendar-weekdays"><div class="calendar-weekday">Pn</div><div class="calendar-weekday">Wt</div><div class="calendar-weekday">Śr</div><div class="calendar-weekday">Cz</div><div class="calendar-weekday">Pt</div><div class="calendar-weekday">So</div><div class="calendar-weekday">Nd</div></div><div class="calendar-days">';

for (let i = firstDayIndex; i > 0; i--) {
    calendarHTML += '<button type="button" class="calendar-day empty"></button>';
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

    calendarHTML += '<button type="button" class="' + classes + '" data-year="' + currentYear + '" data-month="' + currentMonth + '" data-day="' + day + '"' + (isPast ? ' disabled' : '') + '>' + day + '</button>';
}

calendarHTML += '</div>';
calendarDropdown.innerHTML = calendarHTML;

const prevBtn = calendarDropdown.querySelector('.cal-prev');
const nextBtn = calendarDropdown.querySelector('.cal-next');

if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        changeMonth(-1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        changeMonth(1);
    });
}

const dayBtns = calendarDropdown.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
dayBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const year = parseInt(btn.getAttribute('data-year'));
        const month = parseInt(btn.getAttribute('data-month'));
        const day = parseInt(btn.getAttribute('data-day'));
        selectDate(year, month, day);
    });
});
```

}

function changeMonth(direction) {
currentMonth += direction;
if (currentMonth < 0) {
currentMonth = 11;
currentYear–;
} else if (currentMonth > 11) {
currentMonth = 0;
currentYear++;
}
renderCalendar();
}

function selectDate(year, month, day) {
selectedDate = new Date(year, month, day);
const dateStr = year + ‘-’ + String(month + 1).padStart(2, ‘0’) + ‘-’ + String(day).padStart(2, ‘0’);

```
const dateInput = document.getElementById('date');
const dateDisplay = document.getElementById('dateDisplay');
const calendarDropdown = document.getElementById('calendarDropdown');

if (dateInput) dateInput.value = dateStr;
if (dateDisplay) dateDisplay.value = formatDateDisplay(selectedDate);
if (calendarDropdown) calendarDropdown.classList.add('hidden');
```

}

function formatDateDisplay(date) {
const options = { day: ‘numeric’, month: ‘long’, year: ‘numeric’ };
return date.toLocaleDateString(‘pl-PL’, options);
}

// ========== KALENDARZ POWROTU ==========
let selectedReturnDate = null;
let returnCurrentMonth = new Date().getMonth();
let returnCurrentYear = new Date().getFullYear();

function initReturnCalendar() {
const returnDateDisplay = document.getElementById(‘returnDateDisplay’);
const returnCalendarDropdown = document.getElementById(‘returnCalendarDropdown’);

```
if (!returnDateDisplay || !returnCalendarDropdown) return;

returnDateDisplay.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Zamknij kalendarz wylotu jeśli jest otwarty
    const calendarDropdown = document.getElementById('calendarDropdown');
    if (calendarDropdown) {
        calendarDropdown.classList.add('hidden');
    }
    
    returnCalendarDropdown.classList.toggle('hidden');
    
    if (!returnCalendarDropdown.classList.contains('hidden')) {
        renderReturnCalendar();
    }
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('#returnDateGroup') && !e.target.closest('#returnCalendarDropdown')) {
        returnCalendarDropdown.classList.add('hidden');
    }
});
```

}

function renderReturnCalendar() {
const returnCalendarDropdown = document.getElementById(‘returnCalendarDropdown’);
if (!returnCalendarDropdown) return;

```
const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                   'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

const firstDay = new Date(returnCurrentYear, returnCurrentMonth, 1);
const lastDay = new Date(returnCurrentYear, returnCurrentMonth + 1, 0);

const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
const lastDayDate = lastDay.getDate();

const minDate = selectedDate ? new Date(selectedDate.getTime() + 86400000) : new Date();
minDate.setHours(0, 0, 0, 0);

let calendarHTML = '<div class="calendar-header"><h3>' + monthNames[returnCurrentMonth] + ' ' + returnCurrentYear + '</h3><div class="calendar-nav"><button type="button" class="ret-cal-prev">&lt;</button><button type="button" class="ret-cal-next">&gt;</button></div></div><div class="calendar-weekdays"><div class="calendar-weekday">Pn</div><div class="calendar-weekday">Wt</div><div class="calendar-weekday">Śr</div><div class="calendar-weekday">Cz</div><div class="calendar-weekday">Pt</div><div class="calendar-weekday">So</div><div class="calendar-weekday">Nd</div></div><div class="calendar-days">';

for (let i = firstDayIndex; i > 0; i--) {
    calendarHTML += '<button type="button" class="calendar-day empty"></button>';
}

for (let day = 1; day <= lastDayDate; day++) {
    const date = new Date(returnCurrentYear, returnCurrentMonth, day);
    const isPast = date < minDate;
    const isSelected = selectedReturnDate && date.getTime() === selectedReturnDate.getTime();
    
    let classes = 'calendar-day';
    if (isPast) classes += ' disabled';
    if (isSelected) classes += ' selected';

    calendarHTML += '<button type="button" class="' + classes + '" data-year="' + returnCurrentYear + '" data-month="' + returnCurrentMonth + '" data-day="' + day + '"' + (isPast ? ' disabled' : '') + '>' + day + '</button>';
}

calendarHTML += '</div>';
returnCalendarDropdown.innerHTML = calendarHTML;

const prevBtn = returnCalendarDropdown.querySelector('.ret-cal-prev');
const nextBtn = returnCalendarDropdown.querySelector('.ret-cal-next');

if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        changeReturnMonth(-1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        changeReturnMonth(1);
    });
}

const dayBtns = returnCalendarDropdown.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
dayBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const year = parseInt(btn.getAttribute('data-year'));
        const month = parseInt(btn.getAttribute('data-month'));
        const day = parseInt(btn.getAttribute('data-day'));
        selectReturnDate(year, month, day);
    });
});
```

}

function changeReturnMonth(direction) {
returnCurrentMonth += direction;
if (returnCurrentMonth < 0) {
returnCurrentMonth = 11;
returnCurrentYear–;
} else if (returnCurrentMonth > 11) {
returnCurrentMonth = 0;
returnCurrentYear++;
}
renderReturnCalendar();
}

function selectReturnDate(year, month, day) {
selectedReturnDate = new Date(year, month, day);
const dateStr = year + ‘-’ + String(month + 1).padStart(2, ‘0’) + ‘-’ + String(day).padStart(2, ‘0’);

```
const returnDateInput = document.getElementById('returnDate');
const returnDateDisplay = document.getElementById('returnDateDisplay');
const returnCalendarDropdown = document.getElementById('returnCalendarDropdown');

if (returnDateInput) returnDateInput.value = dateStr;
if (returnDateDisplay) returnDateDisplay.value = formatDateDisplay(selectedReturnDate);
if (returnCalendarDropdown) returnCalendarDropdown.classList.add('hidden');
```

}

// ========== SELEKTOR JĘZYKA ==========
function initLanguageSelector() {
const langBtn = document.getElementById(‘langBtn’);
const langDropdown = document.getElementById(‘langDropdown’);

```
if (!langBtn || !langDropdown) return;

langBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    langDropdown.classList.toggle('hidden');
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.language-selector')) {
        if (langDropdown) langDropdown.classList.add('hidden');
    }
});

const langOptions = document.querySelectorAll('.lang-option');
langOptions.forEach(function(option) {
    option.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Funkcja tłumaczenia będzie dostępna wkrótce!');
        langDropdown.classList.add('hidden');
    });
});
```

}

// ========== PANEL PASAŻERÓW ==========
let passengers = {
adult: 1,
teen: 0,
child: 0,
disabled: 0
};

function initPassengerPanel() {
const passengerBtn = document.getElementById(‘passengerBtn’);
const passengerPanel = document.getElementById(‘passengerPanel’);
const doneBtn = document.getElementById(‘doneBtn’);

```
if (!passengerBtn || !passengerPanel || !doneBtn) return;

passengerBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    passengerPanel.classList.toggle('hidden');
});

doneBtn.addEventListener('click', function() {
    passengerPanel.classList.add('hidden');
    updatePassengerSummary();
});

// Zamknij panel po kliknięciu poza nim
document.addEventListener('click', function(e) {
    if (!e.target.closest('.passenger-button') && !e.target.closest('#passengerPanel')) {
        passengerPanel.classList.add('hidden');
    }
});

const counters = document.querySelectorAll('.btn-counter');
counters.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const type = btn.getAttribute('data-type');
        const action = btn.getAttribute('data-action');
        updateCounter(type, action);
    });
});

const classInputs = document.querySelectorAll('input[name="class"]');
classInputs.forEach(function(input) {
    input.addEventListener('change', updatePassengerSummary);
});
```

}

function updateCounter(type, action) {
const countElement = document.getElementById(type + ‘Count’);
if (!countElement) return;

```
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
```

}

function getTotalPassengers() {
return passengers.adult + passengers.teen + passengers.child + passengers.disabled;
}

function updatePassengerSummary() {
const selectedClassInput = document.querySelector(‘input[name=“class”]:checked’);
if (!selectedClassInput) return;

```
const selectedClass = selectedClassInput.value;
const classNames = {
    economy: 'Ekonomiczna',
    premium: 'Premium',
    business: 'Biznes',
    first: 'Pierwsza'
};

const parts = [];
if (passengers.adult > 0) parts.push(passengers.adult + ' Dorosły(ch)');
if (passengers.teen > 0) parts.push(passengers.teen + ' Nastolatek/Nastolatków');
if (passengers.child > 0) parts.push(passengers.child + ' Dziecko/Dzieci');
if (passengers.disabled > 0) parts.push(passengers.disabled + ' Osoba niepełnosprawna');

const passengerText = parts.join(', ');
const summaryElement = document.getElementById('passengerSummary');
if (summaryElement) {
    summaryElement.textContent = passengerText + ', ' + classNames[selectedClass];
}
```

}

// ========== OBSŁUGA FORMULARZA ==========
function initFormHandler() {
const searchForm = document.getElementById(‘searchForm’);
if (!searchForm) return;

```
searchForm.addEventListener('submit', handleSubmit);
```

}

function handleSubmit(e) {
e.preventDefault();

```
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const dateInput = document.getElementById('date');
const tripTypeInput = document.querySelector('input[name="tripType"]:checked');
const travelClassInput = document.querySelector('input[name="class"]:checked');

if (!fromInput || !toInput || !dateInput || !tripTypeInput || !travelClassInput) return;

const from = fromInput.value;
const to = toInput.value;
const date = dateInput.value;
const tripType = tripTypeInput.value;
const returnDateInput = document.getElementById('returnDate');
const returnDate = tripType === 'roundtrip' && returnDateInput ? returnDateInput.value : null;
const travelClass = travelClassInput.value;

if (!from) {
    alert('Proszę wybrać lotnisko wylotu');
    return;
}

if (!to) {
    alert('Proszę wybrać lotnisko przylotu');
    return;
}

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
    from: from,
    to: to,
    date: date,
    tripType: tripType,
    returnDate: returnDate,
    class: travelClass,
    passengers: {
        adult: passengers.adult,
        teen: passengers.teen,
        child: passengers.child,
        disabled: passengers.disabled
    }
};

localStorage.setItem('searchData', JSON.stringify(searchData));
window.location.href = 'results.html';
```

}

// ========== HAMBURGER MENU ==========
function initHamburgerMenu() {
const hamburgerBtn = document.getElementById(‘hamburgerBtn’);
const mobileMenu = document.getElementById(‘mobileMenu’);
const mobileMenuOverlay = document.getElementById(‘mobileMenuOverlay’);
const mobileMenuClose = document.getElementById(‘mobileMenuClose’);

```
if (!hamburgerBtn || !mobileMenu || !mobileMenuOverlay || !mobileMenuClose) return;

hamburgerBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    hamburgerBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    mobileMenuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

mobileMenuClose.addEventListener('click', function() {
    hamburgerBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
});

mobileMenuOverlay.addEventListener('click', function() {
    hamburgerBtn.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileMenuOverlay.classList.remove('active');
    document.body.style.overflow = '';
});
```

}