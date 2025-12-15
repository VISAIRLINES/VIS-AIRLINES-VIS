// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    initLanguageSelector();
    initPassengerPanel();
    initFormHandler();
});

// ========== KALENDARZ ==========
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function initCalendar() {
    const dateDisplay = document.getElementById('dateDisplay');
    const calendarDropdown = document.getElementById('calendarDropdown');
    const dateInputWrapper = document.querySelector('.date-input-wrapper');

    dateInputWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        calendarDropdown.classList.toggle('hidden');
        if (!calendarDropdown.classList.contains('hidden')) {
            renderCalendar();
        }
    });

    // Zamknij kalendarz przy kliknięciu poza nim
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.date-input-wrapper') && !e.target.closest('.calendar-dropdown')) {
            calendarDropdown.classList.add('hidden');
        }
    });

    // Ustaw dzisiejszą datę jako domyślną
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
                <button type="button" class="cal-nav-btn" data-dir="-1">‹</button>
                <button type="button" class="cal-nav-btn" data-dir="1">›</button>
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

    // Dni z poprzedniego miesiąca
    for (let i = firstDayIndex; i > 0; i--) {
        calendarHTML += `<button type="button" class="calendar-day empty disabled">${prevLastDayDate - i + 1}</button>`;
    }

    // Dni bieżącego miesiąca
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

    calendarHTML += '</div></div>';
    calendarDropdown.innerHTML = calendarHTML;

    // Dodaj event listenery do przycisków nawigacji
    const navBtns = calendarDropdown.querySelectorAll('.cal-nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dir = parseInt(btn.getAttribute('data-dir'));
            changeMonth(dir);
        });
    });

    // Dodaj event listenery do dni
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
    
    renderCalendar();
}

function formatDateDisplay(date) {
    const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('pl-PL', options);
}

// ========== SELEKTOR JĘZYKA ==========
function initLanguageSelector() {
    const langBtn = document.getElementById('langBtn');
    const langDropdown = document.getElementById('langDropdown');

    langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        langDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        langDropdown.classList.add('hidden');
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
    const travelClass = document.querySelector('input[name="class"]:checked').value;

    if (!date) {
        alert('Proszę wybrać datę wylotu');
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
        class: travelClass,
        passengers: { ...passengers }
    };

    localStorage.setItem('searchData', JSON.stringify(searchData));
    window.location.href = 'results.html';
}
