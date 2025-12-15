// Baza danych lotów z cenami
const flightDatabase = {
    'WAW-KRK': {
        available: true,
        flights: [
            {
                number: 'VA101',
                departure: '08:00',
                arrival: '09:15',
                duration: '1h 15min',
                prices: {
                    economy: 100,
                    business: 400
                }
            },
            {
                number: 'VA103',
                departure: '14:30',
                arrival: '15:45',
                duration: '1h 15min',
                prices: {
                    economy: 100,
                    business: 400
                }
            },
            {
                number: 'VA105',
                departure: '19:00',
                arrival: '20:15',
                duration: '1h 15min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    },
    'KRK-WAW': {
        available: true,
        flights: [
            {
                number: 'VA102',
                departure: '10:30',
                arrival: '11:45',
                duration: '1h 15min',
                prices: {
                    economy: 100,
                    business: 400
                }
            },
            {
                number: 'VA104',
                departure: '16:00',
                arrival: '17:15',
                duration: '1h 15min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    },
    'WAW-GDN': {
        available: true,
        flights: [
            {
                number: 'VA201',
                departure: '07:00',
                arrival: '08:10',
                duration: '1h 10min',
                prices: {
                    economy: 100,
                    business: 400
                }
            },
            {
                number: 'VA203',
                departure: '15:30',
                arrival: '16:40',
                duration: '1h 10min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    },
    'GDN-WAW': {
        available: true,
        flights: [
            {
                number: 'VA202',
                departure: '09:00',
                arrival: '10:10',
                duration: '1h 10min',
                prices: {
                    economy: 100,
                    business: 400
                }
            },
            {
                number: 'VA204',
                departure: '17:30',
                arrival: '18:40',
                duration: '1h 10min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    },
    'KRK-GDN': {
        available: true,
        flights: [
            {
                number: 'VA301',
                departure: '11:00',
                arrival: '12:30',
                duration: '1h 30min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    },
    'GDN-KRK': {
        available: true,
        flights: [
            {
                number: 'VA302',
                departure: '13:30',
                arrival: '15:00',
                duration: '1h 30min',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    }
};

const cityNames = {
    'WAW': 'Warszawa',
    'KRK': 'Kraków',
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
    const price = flight.prices[selectedClass];
    
    let priceSection = '';
    let unavailableNotice = '';

    if (price) {
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
        unavailableNotice = `
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

            ${unavailableNotice}
            ${priceSection}
        </div>
    `;
}

function getAvailableClasses(flight) {
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
