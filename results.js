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

document.addEventListener('DOMContentLoaded', () => {
    const searchData = JSON.parse(localStorage.getItem('searchData'));

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
    const route = `${searchData.from}-${searchData.to}`;

    const routeData = flightDatabase[route];

    if (!routeData || !routeData.available || routeData.flights.length === 0) {
        noResultsDiv.classList.remove('hidden');
        return;
    }

    const flights = routeData.flights;
    const totalPassengers = Object.values(searchData.passengers).reduce((a, b) => a + b, 0);

    flights.forEach(flight => {
        const flightCard = createFlightCard(flight, searchData, totalPassengers);
        resultsDiv.innerHTML += flightCard;
    });

    // Dodaj event listenery po wygenerowaniu HTML
    attachFlightButtonListeners();

    // Jeśli podróż w obie strony, pokaż loty powrotne
    if (searchData.tripType === 'roundtrip' && searchData.returnDate) {
        const returnRoute = `${searchData.to}-${searchData.from}`;
        const returnRouteData = flightDatabase[returnRoute];

        if (returnRouteData && returnRouteData.available && returnRouteData.flights.length > 0) {
            resultsDiv.innerHTML += `<h3 style="margin: 30px 0 20px; color: #2c3e50;">Loty powrotne</h3>`;
            
            returnRouteData.flights.forEach(flight => {
                const returnCard = createFlightCard(flight, {
                    ...searchData,
                    from: searchData.to,
                    to: searchData.from,
                    date: searchData.returnDate
                }, totalPassengers);
                resultsDiv.innerHTML += returnCard;
            });
            
            // Dodaj listenery także dla lotów powrotnych
            attachFlightButtonListeners();
        }
    }
}

function attachFlightButtonListeners() {
    // Przyciski szczegółów
    const detailBtns = document.querySelectorAll('.btn-details');
    detailBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const flightNumber = btn.getAttribute('data-flight');
            const fromCode = btn.getAttribute('data-from');
            const toCode = btn.getAttribute('data-to');
            showFlightDetails(flightNumber, fromCode, toCode);
        });
    });

    // Przyciski przejdź dalej
    const continueBtns = document.querySelectorAll('.btn-continue:not([disabled])');
    continueBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const flightNumber = btn.getAttribute('data-flight');
            continueFlight(flightNumber);
        });
    });
}

function createFlightCard(flight, searchData, totalPassengers) {
    const selectedClass = searchData.class;
    const hasPrices = flight.prices !== null && flight.prices !== undefined;
    const price = hasPrices ? flight.prices[selectedClass] : null;
    
    let priceSection = '';
    let noticeSection = '';

    if (!hasPrices) {
        noticeSection = `
            <div class="sold-out-notice">
                <strong>Wyprzedane</strong>
                Wszystkie miejsca na tym locie zostały wyprzedane.
            </div>
        `;
        priceSection = `
            <div class="flight-actions">
                <button class="btn-continue" style="opacity: 0.5; cursor: not-allowed; background: #dc3545;" disabled>
                    Wyprzedane
                </button>
            </div>
        `;
    } else if (price) {
        const totalPrice = price * totalPassengers;
        priceSection = `
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
                    <button class="btn-continue" data-flight="${flight.number}">
                        Przejdź dalej
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
        priceSection = `
            <div class="flight-actions">
                <button class="btn-continue" style="opacity: 0.5; cursor: not-allowed;" disabled>
                    Niedostępne
                </button>
            </div>
        `;
    }

    return `
        <div class="flight-card">
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
            ${priceSection}
        </div>
    `;
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

function continueFlight(flightNumber) {
    alert(`Lot ${flightNumber} - przejście do płatności\n\nW pełnej wersji nastąpi przekierowanie do systemu rezerwacji.`);
}

// ============================================
// INSTRUKCJA DODAWANIA NOWYCH POŁĄCZEŃ
// ============================================
// 
// Przykład z ceną:
// 'WAW-KRK': {
//     available: true,
//     flights: [{
//         number: 'VA201',
//         departure: '10:00',
//         arrival: '11:15',
//         duration: '1h 15min',
//         aircraft: 'Boeing 737-800',
//         prices: {
//             economy: 100,
//             business: 400
//         }
//     }]
// }
//
// Przykład wyprzedane:
// prices: null
// ============================================
