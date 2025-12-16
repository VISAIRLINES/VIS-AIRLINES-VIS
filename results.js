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
                },
                connectionPrice: { // Cena jeśli to przesiadka
                    economy: 50,
                    business: 200
                }
            },
            {
                number: 'VA103',
                departure: '23:45',
                arrival: '00:40',
                duration: '55min',
                aircraft: 'Airbus A220-100',
                prices: {
                    economy: 100,
                    business: 400
                },
                connectionPrice: {
                    economy: 50,
                    business: 200
                }
            }
        ]
    },
    'CPK-GDN': {
        available: true,
        flights: [
            {
                number: 'VA102',
                departure: '23:45',
                arrival: '00:40',
                duration: '55min',
                aircraft: 'Airbus A220-100',
                prices: {
                    economy: 100,
                    business: 400
                }
            }
        ]
    },
    'CPK-NCE': {
        available: true,
        flights: [
            {
                number: 'VA201',
                departure: '06:05',
                arrival: '08:45',
                duration: '2h 40min',
                aircraft: 'Airbus A321neo',
                prices: {
                    economy: 250,
                    business: 1000
                }
            }
        ]
    },
    'NCE-CPK': {
        available: true,
        flights: [
            {
                number: 'VA202',
                departure: '09:30',
                arrival: '12:10',
                duration: '2h 40min',
                aircraft: 'Airbus A321neo',
                prices: {
                    economy: 250,
                    business: 1000
                },
                connectionPrice: {
                    economy: 200,
                    business: 800
                }
            }
        ]
    }
};

const cityNames = {
    'CPK': 'CPK',
    'GDN': 'Gdańsk',
    'NCE': 'Nicea'
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
    const totalPassengers = Object.values(searchData.passengers).reduce((a, b) => a + b, 0);

    // Sprawdź połączenia bezpośrednie
    if (routeData && routeData.available && routeData.flights.length > 0) {
        routeData.flights.forEach(flight => {
            const flightCard = createFlightCard(flight, searchData, totalPassengers, 'outbound');
            resultsDiv.innerHTML += flightCard;
        });
        attachFlightButtonListeners();
    } else {
        // Sprawdź połączenia z przesiadką przez CPK
        const connectionFlights = findConnectionFlights(searchData.from, searchData.to);
        
        if (connectionFlights.length > 0) {
            resultsDiv.innerHTML += '<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #ffc107;"><strong>ℹ️ Połączenia z przesiadką w CPK</strong><br>Wybierz lot do CPK, a następnie lot do miejsca docelowego.</div>';
            
            connectionFlights.forEach(conn => {
                const connCard = createConnectionCard(conn, searchData, totalPassengers);
                resultsDiv.innerHTML += connCard;
            });
            attachFlightButtonListeners();
        } else {
            noResultsDiv.classList.remove('hidden');
            return;
        }
    }

    // Loty powrotne
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
            // Szukaj przesiadek dla lotu powrotnego
            const returnConnectionFlights = findConnectionFlights(searchData.to, searchData.from);
            
            if (returnConnectionFlights.length > 0) {
                const returnResultsDiv = document.getElementById('returnFlightResults');
                returnResultsDiv.innerHTML += '<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #ffc107;"><strong>ℹ️ Połączenia powrotne z przesiadką w CPK</strong></div>';
                
                returnConnectionFlights.forEach(conn => {
                    const connCard = createConnectionCard(conn, {
                        ...searchData,
                        from: searchData.to,
                        to: searchData.from,
                        date: searchData.returnDate
                    }, totalPassengers, 'return');
                    returnResultsDiv.innerHTML += connCard;
                });
                attachFlightButtonListeners();
            } else {
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
}

function findConnectionFlights(from, to) {
    // Wszystkie loty idą przez CPK jako hub
    const leg1Route = `${from}-CPK`;
    const leg2Route = `CPK-${to}`;
    
    const leg1Data = flightDatabase[leg1Route];
    const leg2Data = flightDatabase[leg2Route];
    
    if (!leg1Data || !leg2Data) return [];
    
    const connections = [];
    
    leg1Data.flights.forEach(flight1 => {
        leg2Data.flights.forEach(flight2 => {
            connections.push({
                leg1: flight1,
                leg2: flight2,
                from: from,
                to: to
            });
        });
    });
    
    return connections;
}

function createConnectionCard(connection, searchData, totalPassengers, flightType = 'outbound') {
    const selectedClass = searchData.class;
    const leg1 = connection.leg1;
    const leg2 = connection.leg2;
    
    // Użyj ceny przesiadkowej dla pierwszego odcinka
    const leg1Price = leg1.connectionPrice && leg1.connectionPrice[selectedClass] 
        ? leg1.connectionPrice[selectedClass] 
        : (leg1.prices ? leg1.prices[selectedClass] : null);
    
    const leg2Price = leg2.prices ? leg2.prices[selectedClass] : null;
    
    if (!leg1Price || !leg2Price) {
        return `
            <div class="flight-card">
                <div class="flight-header">
                    <div>
                        <div class="flight-route">
                            ${cityNames[connection.from]} → CPK → ${cityNames[connection.to]}
                        </div>
                        <div class="flight-number">Przesiadka w CPK</div>
                    </div>
                </div>
                <div class="unavailable-notice">
                    <strong>Niedostępne</strong>
                    Klasa ${classNames[selectedClass]} nie jest dostępna na tym połączeniu.
                </div>
            </div>
        `;
    }
    
    const totalPrice = (leg1Price + leg2Price) * totalPassengers;
    const connectionId = `${leg1.number}-${leg2.number}`;
    
    return `
        <div class="flight-card connection-card" data-flight="${connectionId}" data-type="${flightType}">
            <div class="flight-header">
                <div>
                    <div class="flight-route">
                        ${cityNames[connection.from]} → CPK → ${cityNames[connection.to]}
                    </div>
                    <div class="flight-number">Loty ${leg1.number} + ${leg2.number} (Przesiadka w CPK)</div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 10px;">Odcinek 1: ${cityNames[connection.from]} → CPK</strong>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div>
                        <span style="color: #888; font-size: 0.8rem;">Lot</span>
                        <div style="font-weight: 600;">${leg1.number}</div>
                    </div>
                    <div>
                        <span style="color: #888; font-size: 0.8rem;">Wylot → Przylot</span>
                        <div style="font-weight: 600;">${leg1.departure} → ${leg1.arrival}</div>
                    </div>
                    <div>
                        <span style="color: #888; font-size: 0.8rem;">Samolot</span>
                        <div style="font-weight: 600;">${leg1.aircraft}</div>
                    </div>
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 10px;">Odcinek 2: CPK → ${cityNames[connection.to]}</strong>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div>
                        <span style="color: #888; font-size: 0.8rem;">Lot</span>
                        <div style="font-weight: 600;">${leg2.number}</div>
                    </div>
                    <div>
                        <span style="color: #888; font-size: 0.8rem;">Wylot → Przylot</span>
                        <div style="font-weight: 600;">${leg2.departure} → ${leg2.arrival}</div>
                    </div>
                    <div>
                        <span style="color: #888; font-size: 0.8rem;">Samolot</span>
                        <div style="font-weight: 600;">${leg2.aircraft}</div>
                    </div>
                </div>
            </div>
            
            <div class="flight-actions">
                <div>
                    <div style="font-size: 0.85rem; color: #888; margin-bottom: 4px;">
                        Łączna cena dla ${totalPassengers} pasażera/ów
                    </div>
                    <div class="price">${totalPrice} zł</div>
                    <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">
                        (${leg1Price} zł + ${leg2Price} zł) × ${totalPassengers}
                    </div>
                </div>
                <div class="action-buttons">
                    <button class="btn-select" data-flight="${connectionId}" data-type="${flightType}" data-price="${totalPrice}" data-leg1="${leg1.number}" data-leg2="${leg2.number}" data-connection="true">
                        Wybierz
                    </button>
                </div>
            </div>
        </div>
    `;
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
