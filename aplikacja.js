import React, { useState } from 'react';
import { Users, Plane, Search, AlertCircle, Calendar as CalendarIcon, X, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

// Baza danych lotnisk
const airports = [
  { code: 'GDN', name: 'Gdańsk', country: 'Polska' },
  { code: 'CPK', name: 'CPK', country: 'Polska' }
];

// Baza danych połączeń
const flights = [
  {
    id: 1,
    from: 'GDN',
    to: 'CPK',
    departure: '04:00',
    arrival: '04:55',
    duration: '55min',
    prices: {
      economy: 100,
      business: 400,
      premium: null,
      first: null
    }
  }
];

const CustomCalendar = ({ selectedDate, onSelectDate, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
  
  const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                      'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'];
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
  };
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return formatDate(date) === selectedDate;
  };
  
  const isPast = (date) => {
    if (!date) return false;
    return date < today;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Wybierz datę</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="font-semibold text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, idx) => (
              <button
                key={idx}
                disabled={!date || isPast(date)}
                onClick={() => {
                  if (date && !isPast(date)) {
                    onSelectDate(formatDate(date));
                    onClose();
                  }
                }}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition
                  ${!date ? 'invisible' : ''}
                  ${isPast(date) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${isSelected(date) ? 'bg-gray-800 text-white hover:bg-gray-700' : 'text-gray-700'}
                  ${date && date.getTime() === today.getTime() && !isSelected(date) ? 'border-2 border-gray-400' : ''}
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PassengerSelector = ({ passengers, onUpdate, onClose }) => {
  const passengerTypes = [
    { key: 'adults', label: 'Dorośli', sublabel: 'Od 14 lat', icon: '👤' },
    { key: 'teens', label: 'Nastolatki', sublabel: '3-13 lat', icon: '🧒' },
    { key: 'infants', label: 'Niemowlęta', sublabel: 'Do 2 lat', icon: '👶' },
    { key: 'disabled', label: 'Osoby niepełnosprawne', sublabel: 'Wymagające pomocy', icon: '♿' }
  ];

  const [counts, setCounts] = useState(passengers);

  const updateCount = (key, delta) => {
    setCounts(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  const getTotalPassengers = () => {
    return Object.values(counts).reduce((sum, val) => sum + val, 0);
  };

  const handleConfirm = () => {
    if (getTotalPassengers() === 0) {
      alert('Proszę wybrać co najmniej jednego pasażera');
      return;
    }
    onUpdate(counts);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Pasażerowie</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {passengerTypes.map(type => (
              <div key={type.key} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{type.label}</div>
                    <div className="text-sm text-gray-500">{type.sublabel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateCount(type.key, -1)}
                    disabled={counts[type.key] === 0}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-semibold text-lg">{counts[type.key]}</span>
                  <button
                    onClick={() => updateCount(type.key, 1)}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-gray-800 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-xl transition"
            >
              Anuluj
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Potwierdź ({getTotalPassengers()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('search');
  const [tripType, setTripType] = useState('oneway');
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: {
      adults: 1,
      teens: 0,
      infants: 0,
      disabled: 0
    },
    travelClass: 'economy'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(null);
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [classWarning, setClassWarning] = useState('');

  const travelClasses = [
    { value: 'economy', label: 'Ekonomiczna', icon: '💺' },
    { value: 'premium', label: 'Premium', icon: '🎫' },
    { value: 'business', label: 'Biznes', icon: '💼' },
    { value: 'first', label: 'Pierwsza', icon: '👑' }
  ];

  const handleSearch = () => {
    if (!searchData.from || !searchData.to || !searchData.departDate) {
      alert('Proszę wypełnić wszystkie wymagane pola');
      return;
    }

    if (tripType === 'roundtrip' && !searchData.returnDate) {
      alert('Proszę wybrać datę powrotu');
      return;
    }

    const results = flights.filter(
      flight => flight.from === searchData.from && flight.to === searchData.to
    );

    setSearchResults(results);
    setClassWarning('');
    setCurrentPage('results');
  };

  const selectAirport = (type, airport) => {
    setSearchData({ ...searchData, [type]: airport.code });
    setShowFromDropdown(false);
    setShowToDropdown(false);
  };

  const getAirportName = (code) => {
    const airport = airports.find(a => a.code === code);
    return airport ? `${airport.name} (${airport.code})` : '';
  };

  const getTotalPassengers = () => {
    return Object.values(searchData.passengers).reduce((sum, val) => sum + val, 0);
  };

  const getPassengerSummary = () => {
    const p = searchData.passengers;
    const parts = [];
    if (p.adults > 0) parts.push(`${p.adults} dorosły(ch)`);
    if (p.teens > 0) parts.push(`${p.teens} nastolatek/nastolatków`);
    if (p.infants > 0) parts.push(`${p.infants} niemowlę/niemowląt`);
    if (p.disabled > 0) parts.push(`${p.disabled} osoba/osób niepełnosprawna`);
    return parts.join(', ');
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('pl-PL', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const selectFlight = (flight) => {
    const price = flight.prices[searchData.travelClass];
    
    if (price === null) {
      setClassWarning(`Niestety, klasa ${travelClasses.find(c => c.value === searchData.travelClass).label} nie jest dostępna na tym połączeniu.`);
    } else {
      setCurrentPage('booking');
    }
  };

  if (currentPage === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="bg-gray-800 p-2 rounded-lg">
                <Plane className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Vis Airlines</h1>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              Zarezerwuj Swój Lot
            </h2>
            <p className="text-xl text-gray-600">
              Twoja podróż zaczyna się tutaj
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
            {/* Trip Type Toggle */}
            <div className="flex gap-3 mb-6">
              <button
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                  tripType === 'oneway'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setTripType('oneway')}
              >
                W jedną stronę
              </button>
              <button
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
                  tripType === 'roundtrip'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setTripType('roundtrip')}
              >
                W obie strony
              </button>
            </div>

            {/* From & To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Skąd
                </label>
                <div
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition bg-gray-50"
                  onClick={() => {
                    setShowFromDropdown(!showFromDropdown);
                    setShowToDropdown(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Plane className="text-gray-400" size={20} />
                    <span className={searchData.from ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {searchData.from ? getAirportName(searchData.from) : 'Wybierz lotnisko'}
                    </span>
                  </div>
                </div>
                {showFromDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                    {airports.map(airport => (
                      <div
                        key={airport.code}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition border-b last:border-b-0"
                        onClick={() => selectAirport('from', airport)}
                      >
                        <div className="font-semibold text-gray-900">{airport.name}</div>
                        <div className="text-sm text-gray-500">{airport.country} ({airport.code})</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dokąd
                </label>
                <div
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition bg-gray-50"
                  onClick={() => {
                    setShowToDropdown(!showToDropdown);
                    setShowFromDropdown(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Plane className="text-gray-400" size={20} />
                    <span className={searchData.to ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {searchData.to ? getAirportName(searchData.to) : 'Wybierz lotnisko'}
                    </span>
                  </div>
                </div>
                {showToDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-auto">
                    {airports.map(airport => (
                      <div
                        key={airport.code}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition border-b last:border-b-0"
                        onClick={() => selectAirport('to', airport)}
                      >
                        <div className="font-semibold text-gray-900">{airport.name}</div>
                        <div className="text-sm text-gray-500">{airport.country} ({airport.code})</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data wylotu
                </label>
                <div
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition bg-gray-50"
                  onClick={() => setShowCalendar('depart')}
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="text-gray-400" size={20} />
                    <span className={searchData.departDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                      {searchData.departDate ? formatDateDisplay(searchData.departDate) : 'Wybierz datę'}
                    </span>
                  </div>
                </div>
              </div>

              {tripType === 'roundtrip' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Data powrotu
                  </label>
                  <div
                    className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition bg-gray-50"
                    onClick={() => setShowCalendar('return')}
                  >
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="text-gray-400" size={20} />
                      <span className={searchData.returnDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                        {searchData.returnDate ? formatDateDisplay(searchData.returnDate) : 'Wybierz datę'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Passengers & Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pasażerowie
                </label>
                <div
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition bg-gray-50"
                  onClick={() => setShowPassengerSelector(true)}
                >
                  <div className="flex items-center gap-3">
                    <Users className="text-gray-400" size={20} />
                    <div className="flex-1">
                      <div className="text-gray-900 font-medium">{getTotalPassengers()} pasażer(ów)</div>
                      <div className="text-xs text-gray-500 truncate">{getPassengerSummary()}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Klasa podróży
                </label>
                <div
                  className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition bg-gray-50"
                  onClick={() => setShowClassSelector(!showClassSelector)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {travelClasses.find(c => c.value === searchData.travelClass)?.icon}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {travelClasses.find(c => c.value === searchData.travelClass)?.label}
                    </span>
                  </div>
                </div>
                {showClassSelector && (
                  <div className="absolute z-10 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {travelClasses.map(tclass => (
                      <div
                        key={tclass.value}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition border-b last:border-b-0 flex items-center gap-3"
                        onClick={() => {
                          setSearchData({ ...searchData, travelClass: tclass.value });
                          setShowClassSelector(false);
                        }}
                      >
                        <span className="text-xl">{tclass.icon}</span>
                        <span className="font-medium text-gray-900">{tclass.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-lg"
              onClick={handleSearch}
            >
              <Search size={22} />
              Szukaj Lotów
            </button>
          </div>
        </div>

        {/* Modals */}
        {showCalendar && (
          <CustomCalendar
            selectedDate={showCalendar === 'depart' ? searchData.departDate : searchData.returnDate}
            onSelectDate={(date) => {
              if (showCalendar === 'depart') {
                setSearchData({ ...searchData, departDate: date });
              } else {
                setSearchData({ ...searchData, returnDate: date });
              }
            }}
            onClose={() => setShowCalendar(null)}
          />
        )}

        {showPassengerSelector && (
          <PassengerSelector
            passengers={searchData.passengers}
            onUpdate={(passengers) => setSearchData({ ...searchData, passengers })}
            onClose={() => setShowPassengerSelector(false)}
          />
        )}
      </div>
    );
  }

  if (currentPage === 'results') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Plane className="text-white" size={28} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Vis Airlines</h1>
              </div>
              <button
                className="text-gray-600 hover:text-gray-800 font-semibold text-sm md:text-base"
                onClick={() => setCurrentPage('search')}
              >
                ← Nowe wyszukiwanie
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
            <div className="flex flex-wrap gap-3 md:gap-4 items-center text-xs md:text-sm">
              <div>
                <span className="text-gray-600">Trasa: </span>
                <span className="font-semibold">{getAirportName(searchData.from)} → {getAirportName(searchData.to)}</span>
              </div>
              <div className="border-l pl-3 md:pl-4">
                <span className="text-gray-600">Data: </span>
                <span className="font-semibold">{formatDateDisplay(searchData.departDate)}</span>
              </div>
              <div className="border-l pl-3 md:pl-4">
                <span className="text-gray-600">Pasażerowie: </span>
                <span className="font-semibold">{getTotalPassengers()}</span>
              </div>
              <div className="border-l pl-3 md:pl-4">
                <span className="text-gray-600">Klasa: </span>
                <span className="font-semibold">{travelClasses.find(c => c.value === searchData.travelClass).label}</span>
              </div>
            </div>
          </div>

          {classWarning && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-yellow-800 font-medium">{classWarning}</p>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Dostępne loty ({searchResults.length})
          </h2>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Plane className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-xl text-gray-600">Brak dostępnych połączeń na wybranej trasie</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map(flight => {
                const price = flight.prices[searchData.travelClass];
                const totalPrice = price ? price * getTotalPassengers() : null;
                const isSoldOut = price === null;

                return (
                  <div key={flight.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between md:gap-8 mb-4">
                          <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-gray-900">{flight.departure}</div>
                            <div className="text-xs md:text-sm text-gray-600">{getAirportName(flight.from)}</div>
                          </div>
                          
                          <div className="flex-1 relative px-4">
                            <div className="border-t-2 border-gray-300 relative">
                              <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700 bg-white px-2" size={20} />
                            </div>
                            <div className="text-center text-xs md:text-sm text-gray-600 mt-2">{flight.duration}</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl md:text-3xl font-bold text-gray-900">{flight.arrival}</div>
                            <div className="text-xs md:text-sm text-gray-600">{getAirportName(flight.to)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="lg:border-l lg:pl-6 text-center lg:text-right">
                        {isSoldOut ? (
                          <div>
                            <div className="text-xl md:text-2xl font-bold text-red-600 mb-2">Wyprzedane</div>
                            <div className="text-sm text-gray-600">w klasie {travelClasses.find(c => c.value === searchData.travelClass).label}</div>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                              {totalPrice} zł
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                              {price} zł za osobę
                            </div>
                            <button
                              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition w-full lg:w-auto"
                              onClick={() => selectFlight(flight)}
                            >
                              Wybierz lot
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'booking') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Strona rezerwacji w przygotowaniu
            </h2>
            <p className="text-gray-600 mb-6">
              Tutaj pojawi się formularz rezerwacji i płatności
            </p>
            <button
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition"
              onClick={() => setCurrentPage('search')}
            >
              Powrót do wyszukiwania
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default App;
