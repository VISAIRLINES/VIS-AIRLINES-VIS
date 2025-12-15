// BAZA LOTÓW - TUTAJ DODAWAJ NOWE POŁĄCZENIA
// Jeśli nie podasz ceny (prices = null), wyświetli się "Wyprzedane"
const flightDatabase = {
    'GDN-CPK': {
        available: true,
        flights: [
            {
                number: 'VA101',
                departure: '04:00',
                arrival: '04:55',
                duration: '55min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    }
};

// NAZWY MIAST - DODAJ TUTAJ WSZYSTKIE LOTNISKA
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
});

function displaySearchSummary(data) {
    const summaryDiv = document.getElementById('searchSummary');
    const totalPassengers = Object.values(data.passengers).reduce((a, b) => a + b, 0);

    summaryDiv.innerHTML = `
        <h3>Wyniki wyszukiwania</h3>
        <p><strong>Trasa:</strong> ${cityNames[data.from]} → ${cityNames[data.to]}</p>
        <p><strong>Data:</strong> ${formatDate(data.date)}</p>
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
}

function createFlightCard(flight, searchData, totalPassengers) {
    const selectedClass = searchData.class;
    
    // Sprawdź czy lot ma w ogóle jakiekolwiek ceny (nie jest wyprzedany)
    const hasPrices = flight.prices !== null && flight.prices !== undefined;
    const price = hasPrices ? flight.prices[selectedClass] : null;
    
    let priceSection = '';
    let noticeSection = '';

    if (!hasPrices) {
        // Lot całkowicie wyprzedany
        noticeSection = `
            <div class="sold-out-notice">
                <strong>🚫 Wyprzedane</strong>
                Wszystkie miejsca na tym locie zostały wyprzedane.
            </div>
        `;
        priceSection = `
            <div class="flight-price">
                <button class="btn-book" style="opacity: 0.5; cursor: not-allowed; background: #dc3545;" disabled>
                    Wyprzedane
                </button>
            </div>
        `;
    } else if (price) {
        // Klasa dostępna i ma cenę
        const totalPrice = price * totalPassengers;
        priceSection = `
            <div class="flight-price">
                <div>
                    <div style="font-size: 0.9rem; color: #888;">Łączna cena dla ${totalPassengers} pasażera/ów</div>
                    <div class="price">${totalPrice} zł</div>
                    <div style="font-size: 0.85rem; color: #888; margin-top: 5px;">
                        ${price} zł za osobę
                    </div>
                </div>
                <button class="btn-book" onclick="bookFlight('${flight.number}')">Rezerwuj</button>
            </div>
        `;
    } else {
        // Klasa nie jest dostępna na tym połączeniu
        noticeSection = `
            <div class="unavailable-notice">
                <strong>⚠️ Niedostępne</strong>
                Klasa ${classNames[selectedClass]} nie jest dostępna na tym połączeniu.
                Dostępne klasy: ${getAvailableClasses(flight)}
            </div>
        `;
        priceSection = `
            <div class="flight-price">
                <button class="btn-book" style="opacity: 0.5; cursor: not-allowed;" disabled>
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

function bookFlight(flightNumber) {
    alert(`Dziękujemy za wybór Vis Airlines!\n\nLot ${flightNumber} został dodany do koszyka.\n\nW pełnej wersji strony tutaj nastąpiłoby przekierowanie do systemu płatności.`);
}

// ============================================
// INSTRUKCJA DODAWANIA NOWYCH POŁĄCZEŃ
// ============================================
// 
// 1. Z CENĄ - dodaj do flightDatabase:
//
// 'WAW-KRK': {
//     available: true,
//     flights: [
//         {
//             number: 'VA201',
//             departure: '10:00',
//             arrival: '11:15',
//             duration: '1h 15min',
//             prices: {
//                 economy: 100,
//                 business: 400
//                 // premium: 250,  // opcjonalnie
//                 // first: 600     // opcjonalnie
//             }
//         }
//     ]
// }
//
// 2. WYPRZEDANE (bez ceny) - ustaw prices: null:
//
// 'KRK-GDN': {
//     available: true,
//     flights: [
//         {
//             number: 'VA301',
//             departure: '14:00',
//             arrival: '15:30',
//             duration: '1h 30min',
//             prices: null  // <- to spowoduje "Wyprzedane"
//         }
//     ]
// }
//
// 3. DODAJ MIASTA do cityNames:
//
// const cityNames = {
//     'CPK': 'CPK',
//     'GDN': 'Gdańsk',
//     'WAW': 'Warszawa',  // <- dodaj nowe
//     'KRK': 'Kraków'      // <- dodaj nowe
// };
//
// 4. DODAJ MIASTA do index.html (w obu listach select)
// ============================================
