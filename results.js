// BAZA LOTÓW
const flightDatabase = {
    'GDN-CPK': {
        available: true,
        flights: [
            {
                number: 'VA101',
                departure: '04:00',
                arrival: '04:55',
                duration: '55min',
                aircraft: 'Airbus A220-100',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    }
};

const cityNames = {
    'CPK': 'CPK',
    'GDN': 'Gdańsk'
};

const classNames = {
    economy: 'Ekonomiczna',
    premium: 'Premium',
    business: 'Biznes',
    first: 'Pierwsza'
};

let searchData = null;
let selectedOutboundFlight = null;
let selectedReturnFlight = null;

document.addEventListener('DOMContentLoaded', () => {
    searchData = JSON.parse(localStorage.getItem('searchData'));

    if (!searchData) {
        window.location.href = 'index.html';
        return;
    }

    displaySearchSummary(searchData);
    displayFlights(searchData);
    initModal();
});

function displaySearchSummary(data) {
    const summaryDiv = document.getElementById('searchSummary');
    const totalPassengers = Object.values(data.passengers).reduce((a, b) => a + b, 0);
    
    let tripTypeText = data.tripType === 'roundtrip' ? 'W obie strony' : 'W jedną stronę';
    let returnDateText = data.returnDate ? `<p><strong>Data powrotu:</strong> ${formatDate(data.returnDate)}</p>` : '';

    summaryDiv.innerHTML = `
        <h3>Wyniki wyszukiwania</h3>
        <p><strong>Trasa:</strong> ${cityNames[data.from]} → ${cityNames[data.to]}</p>
        <p><strong>Rodzaj podróży:</strong> ${tripTypeText}</p>
        <p><strong>Data wylotu:</strong> ${formatDate(data.date)}</p>
        ${returnDateText}
        <p><strong>Pasażerowie:</strong> ${totalPassengers} osób</p>
        <p><strong>Klasa:</strong> ${classNames[data.class]}</p>
    `;
}

function displayFlights(searchData) {
    const resultsDiv = document.getElementById('flightResults');
    const noResultsDiv = document.getElementById('noResults');
    const returnFlightsSection = document.getElementById('returnFlights');
    const route = `${searchData.from}-${searchData.to}`;

    const routeData = flightDatabase[route];

    if (!routeData || !routeData.available || routeData.flights.length === 0) {
        noResultsDiv.classList.remove('hidden');
        return;
    }

    const flights = routeData.flights;
    const totalPassengers = Object.values(searchData.passengers).reduce((a, b) => a + b, 0);

    flights.forEach(flight => {
        const flightCard = createFlightCard(flight, searchData, totalPassengers, 'outbound');
        resultsDiv.innerHTML += flightCard;
    });

    attachFlightButtonListeners();

    // Przygotuj loty powrotne jeśli podróż w obie strony
    if (searchData.tripType === 'roundtrip' && searchData.returnDate) {
        const returnRoute = `${searchData.to}-${searchData.from}`;
        const returnRouteData = flightDatabase[returnRoute];

        if (returnRouteData && returnRouteData.available && returnRouteData.flights.length > 0) {
            const returnResultsDiv = document.getElementById('returnFlightResults');
            
            returnRouteData.flights.forEach(flight => {
                const returnCard = createFlightCard(flight, {
                    ...searchData,
                    from: searchData.to,
                    to: searchData.from,
                    date: searchData.returnDate
                }, totalPassengers, 'return');
                returnResultsDiv.innerHTML += returnCard;
            });
            
            attachFlightButtonListeners();
        } else {
            // Brak lotów powrotnych - pokaż komunikat
            returnFlightsSection.innerHTML = `
                <h3 class="section-title">Loty powrotne</h3>
                <div class="no-results" style="margin-top: 20px;">
                    <h3>Brak dostępnych lotów powrotnych</h3>
                    <p>Przepraszamy, nie znaleźliśmy lotów powrotnych na wybranej trasie.</p>
                </div>
            `;
        }
    }
}

function createFlightCard(flight, searchData, totalPassengers, flightType) {
    const selectedClass = searchData.class;
    const hasPrices = flight.prices !== null && flight.prices !== undefined;
    const price = hasPrices ? flight.prices[selectedClass] : null;
    
    let actionSection = '';
    let noticeSection = '';

    if (!hasPrices) {
        noticeSection = `
            <div class="sold-out-notice">
                <strong>Wyprzedane</strong>
                Wszystkie miejsca na tym locie zostały wyprzedane.
            </div>
        `;
        actionSection = `
            <div class="flight-actions">
                <button class="btn-continue" style="opacity: 0.5; cursor: not-allowed; background: #dc3545;" disabled>
                    Wyprzedane
                </button>
            </div>
        `;
    } else if (price) {
        const totalPrice = price * totalPassengers;
        actionSection = `
            <div class="flight-actions">
                <div>
                    <div style="font-size: 0.85rem; color: #888; margin-bottom: 4px;">
                        Łączna cena dla ${totalPassengers} pasażera/ów
                    </div>
                    <div class="price">${totalPrice} zł</div>
                    <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">
                        ${price} zł za osobę
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn-details" data-flight="${flight.number}" data-from="${searchData.from}" data-to="${searchData.to}">
                        Szczegóły
                    </button>
                    <button class="btn-select" data-flight="${flight.number}" data-type="${flightType}" data-price="${totalPrice}">
                        Wybierz
                    </button>
                </div>
            </div>
        `;
    } else {
        noticeSection = `
            <div class="unavailable-notice">
                <strong>Niedostępne</strong>
                Klasa ${classNames[selectedClass]} nie jest dostępna na tym połączeniu.
                Dostępne klasy: ${getAvailableClasses(flight)}
            </div>
        `;
        actionSection = `
            <div class="flight-actions">
                <button class="btn-continue" style="opacity: 0.5; cursor: not-allowed;" disabled>
                    Niedostępne
                </button>
            </div>
        `;
    }

    return `
        <div class="flight-card" data-flight="${flight.number}" data-type="${flightType}">
            <div class="flight-header">
                <div>
                    <div class="flight-route">
                        ${cityNames[searchData.from]} → ${cityNames[searchData.to]}
                    </div>
                    <div class="flight-number">Lot ${flight.number}</div>
                </div>
            </div>
            
            <div class="flight-details">
                <div class="detail-item">
                    <span class="detail-label">Wylot</span>
                    <span class="detail-value">${flight.departure}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Przylot</span>
                    <span class="detail-value">${flight.arrival}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Czas lotu</span>
                    <span class="detail-value">${flight.duration}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Klasa</span>
                    <span class="detail-value">${classNames[selectedClass]}</span>
                </div>
            </div>

            ${noticeSection}
            ${actionSection}
        </div>
    `;
}

function attachFlightButtonListeners() {
    // Przyciski szczegółów
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const flightNumber = this.getAttribute('data-flight');
            const fromCode = this.getAttribute('data-from');
            const toCode = this.getAttribute('data-to');
            showFlightDetails(flightNumber, fromCode, toCode);
        });
    });

    // Przyciski wyboru
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    document.querySelectorAll('.btn-select').forEach(btn => {
        btn.addEventListener('click', function() {
            const flightNumber = this.getAttribute('data-flight');
            const flightType = this.getAttribute('data-type');
            const price = this.getAttribute('data-price');
            selectFlight(flightNumber, flightType, price);
        });
    });
}

function selectFlight(flightNumber, flightType, price) {
    const route = flightType === 'outbound' 
        ? `${searchData.from}-${searchData.to}` 
        : `${searchData.to}-${searchData.from}`;
    
    const routeData = flightDatabase[route];
    if (!routeData) return;
    
    const flight = routeData.flights.find(f => f.number === flightNumber);
    if (!flight) return;

    // Usuń poprzednie zaznaczenie
    document.querySelectorAll(`.flight-card[data-type="${flightType}"]`).forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelectorAll(`.btn-select[data-type="${flightType}"]`).forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = 'Wybierz';
    });

    // Zaznacz nowy
    const card = document.querySelector(`.flight-card[data-flight="${flightNumber}"][data-type="${flightType}"]`);
    const btn = document.querySelector(`.btn-select[data-flight="${flightNumber}"][data-type="${flightType}"]`);
    
    if (card) card.classList.add('selected');
    if (btn) {
        btn.classList.add('selected');
        btn.textContent = 'Wybrany';
    }

    // Zapisz wybór
    if (flightType === 'outbound') {
        selectedOutboundFlight = { flight, price };
    } else {
        selectedReturnFlight = { flight, price };
    }

    updateSelectedSummary();

    // Jeśli w obie strony i wybrano lot wylotowy, pokaż sekcję lotów powrotnych
    if (searchData.tripType === 'roundtrip' && flightType === 'outbound') {
        const returnFlightsSection = document.getElementById('returnFlights');
        returnFlightsSection.classList.remove('hidden');
        
        // Przewiń do lotów powrotnych
        setTimeout(() => {
            returnFlightsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function updateSelectedSummary() {
    const summaryDiv = document.getElementById('selectedFlightsSummary');
    const outboundDiv = document.getElementById('selectedOutbound');
    const returnDiv = document.getElementById('selectedReturn');
    const finalBtn = document.getElementById('finalContinueBtn');

    if (!selectedOutboundFlight && !selectedReturnFlight) {
        summaryDiv.classList.add('hidden');
        return;
    }

    summaryDiv.classList.remove('hidden');

    // Lot wylotowy
    if (selectedOutboundFlight) {
        const f = selectedOutboundFlight.flight;
        outboundDiv.innerHTML = `
            <div class="selected-flight-info">
                <strong>Lot wylotowy: ${f.number}</strong>
                <p>${cityNames[searchData.from]} → ${cityNames[searchData.to]}</p>
                <p>Wylot: ${f.departure} | Przylot: ${f.arrival}</p>
                <p>Cena: ${selectedOutboundFlight.price} zł</p>
            </div>
        `;
    }

    // Lot powrotny
    if (searchData.tripType === 'roundtrip') {
        if (selectedReturnFlight) {
            const f = selectedReturnFlight.flight;
            returnDiv.innerHTML = `
                <div class="selected-flight-info">
                    <strong>Lot powrotny: ${f.number}</strong>
                    <p>${cityNames[searchData.to]} → ${cityNames[searchData.from]}</p>
                    <p>Wylot: ${f.departure} | Przylot: ${f.arrival}</p>
                    <p>Cena: ${selectedReturnFlight.price} zł</p>
                </div>
            `;
            finalBtn.classList.remove('hidden');
        } else {
            returnDiv.innerHTML = '<p style="color: #888;">Wybierz lot powrotny</p>';
            finalBtn.classList.add('hidden');
        }
    } else {
        // W jedną stronę - pokaż przycisk od razu
        returnDiv.innerHTML = '';
        finalBtn.classList.remove('hidden');
    }

    // Event listener dla końcowego przycisku
    finalBtn.onclick = () => {
        const total = selectedOutboundFlight.price + (selectedReturnFlight ? selectedReturnFlight.price : 0);
        alert(`Przejście do płatności\n\nŁączna kwota: ${total} zł\n\nW pełnej wersji nastąpi przekierowanie do systemu rezerwacji.`);
    };
}

function getAvailableClasses(flight) {
    if (!flight.prices) return 'Brak dostępnych klas';
    
    const available = [];
    if (flight.prices.economy) available.push('Ekonomiczna');
    if (flight.prices.premium) available.push('Premium');
    if (flight.prices.business) available.push('Biznes');
    if (flight.prices.first) available.push('Pierwsza');
    return available.join(', ');
}

function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pl-PL', options);
}

// ========== MODAL SZCZEGÓŁÓW ==========
function initModal() {
    const modal = document.getElementById('flightModal');
    const modalClose = document.getElementById('modalClose');

    if (!modalClose) return;

    modalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

function showFlightDetails(flightNumber, fromCode, toCode) {
    const route = `${fromCode}-${toCode}`;
    const routeData = flightDatabase[route];
    
    if (!routeData) return;
    
    const flight = routeData.flights.find(f => f.number === flightNumber);
    if (!flight) return;

    const modal = document.getElementById('flightModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <div class="modal-detail">
            <div class="modal-label">Numer lotu</div>
            <div class="modal-value">${flight.number}</div>
        </div>
        <div class="modal-detail">
            <div class="modal-label">Trasa</div>
            <div class="modal-value">${cityNames[fromCode]} → ${cityNames[toCode]}</div>
        </div>
        <div class="modal-detail">
            <div class="modal-label">Godzina wylotu</div>
            <div class="modal-value">${flight.departure}</div>
        </div>
        <div class="modal-detail">
            <div class="modal-label">Godzina przylotu</div>
            <div class="modal-value">${flight.arrival}</div>
        </div>
        <div class="modal-detail">
            <div class="modal-label">Czas lotu</div>
            <div class="modal-value">${flight.duration}</div>
        </div>
        <div class="modal-detail">
            <div class="modal-label">Model samolotu</div>
            <div class="modal-value">${flight.aircraft}</div>
        </div>
        <div class="modal-detail">
            <div class="modal-label">Dostępne klasy</div>
            <div class="modal-value">${getAvailableClasses(flight)}</div>
        </div>
    `;

    modal.classList.remove('hidden');
}
