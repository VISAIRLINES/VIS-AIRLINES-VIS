// Ustawienie minimalnej daty na dzisiaj
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    dateInput.value = today;

    // Obsługa panelu pasażerów
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

    // Obsługa liczników pasażerów
    const counters = document.querySelectorAll('.btn-counter');
    counters.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            const action = btn.getAttribute('data-action');
            updateCounter(type, action);
        });
    });

    // Obsługa formularza
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', handleSubmit);
});

// Stan pasażerów
let passengers = {
    adult: 1,
    teen: 0,
    child: 0,
    disabled: 0
};

function updateCounter(type, action) {
    const countElement = document.getElementById(`${type}Count`);
    let currentValue = passengers[type];

    if (action === 'plus') {
        if (getTotalPassengers() < 9) {
            passengers[type]++;
        }
    } else if (action === 'minus') {
        if (currentValue > 0) {
            // Zapobieganie usunięciu ostatniego dorosłego
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
    const total = getTotalPassengers();
    const selectedClass = document.querySelector('input[name="class"]:checked').value;
    const classNames = {
        economy: 'Ekonomiczna',
        premium: 'Premium',
        business: 'Biznes',
        first: 'Pierwsza'
    };

    let passengerText = '';
    const parts = [];
    
    if (passengers.adult > 0) parts.push(`${passengers.adult} Dorosły(ch)`);
    if (passengers.teen > 0) parts.push(`${passengers.teen} Nastolatek/Nastolatków`);
    if (passengers.child > 0) parts.push(`${passengers.child} Dziecko/Dzieci`);
    if (passengers.disabled > 0) parts.push(`${passengers.disabled} Osoba niepełnosprawna`);

    passengerText = parts.join(', ');

    document.getElementById('passengerSummary').textContent = 
        `${passengerText}, ${classNames[selectedClass]}`;
}

function handleSubmit(e) {
    e.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const travelClass = document.querySelector('input[name="class"]:checked').value;

    // Walidacja
    if (from === to) {
        alert('Miasto wylotu i przylotu muszą być różne!');
        return;
    }

    // Przygotowanie danych do przekazania
    const searchData = {
        from,
        to,
        date,
        class: travelClass,
        passengers: { ...passengers }
    };

    // Zapisanie danych w localStorage
    localStorage.setItem('searchData', JSON.stringify(searchData));

    // Przekierowanie na stronę wyników
    window.location.href = 'results.html';
}

// Aktualizacja podsumowania przy zmianie klasy
document.addEventListener('DOMContentLoaded', () => {
    const classInputs = document.querySelectorAll('input[name="class"]');
    classInputs.forEach(input => {
        input.addEventListener('change', updatePassengerSummary);
    });
});
