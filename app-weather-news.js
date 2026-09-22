// app-weather-news.js: Lokales Wetter (Open-Meteo API) & Kuratiertes Nachrichten-Briefing

// ============================================================================
// 1. LOKALES WETTER (WEATHER ENGINE)
// ============================================================================

const DEFAULT_PINNED_CITIES = [
  { name: 'Berlin', country: 'Deutschland', lat: 52.52, lon: 13.41, defaultTemp: 20, defaultCode: 1 },
  { name: 'München', country: 'Deutschland', lat: 48.14, lon: 11.58, defaultTemp: 19, defaultCode: 1 },
  { name: 'Wien', country: 'Österreich', lat: 48.21, lon: 16.37, defaultTemp: 21, defaultCode: 0 },
  { name: 'Zürich', country: 'Schweiz', lat: 47.37, lon: 8.54, defaultTemp: 18, defaultCode: 2 }
];

let pinnedWeatherCities = [];
try {
  const savedPinned = localStorage.getItem('flow_weather_pinned_cities');
  pinnedWeatherCities = savedPinned ? JSON.parse(savedPinned) : DEFAULT_PINNED_CITIES;
  if (!Array.isArray(pinnedWeatherCities) || pinnedWeatherCities.length === 0) {
    pinnedWeatherCities = DEFAULT_PINNED_CITIES;
  }
} catch (e) {
  pinnedWeatherCities = DEFAULT_PINNED_CITIES;
}

let cachedPinnedCitiesWeather = {};
try {
  const savedPinnedCache = localStorage.getItem('flow_weather_pinned_cache');
  if (savedPinnedCache) cachedPinnedCitiesWeather = JSON.parse(savedPinnedCache);
} catch (e) {}

let currentWeatherLocation = {
  name: 'Berlin',
  country: 'Deutschland',
  lat: 52.52,
  lon: 13.41
};

try {
  const savedLoc = localStorage.getItem('flow_weather_loc');
  if (savedLoc && savedLoc !== 'undefined' && savedLoc !== 'null') {
    const parsed = JSON.parse(savedLoc);
    if (parsed && typeof parsed === 'object' && parsed.name && typeof parsed.lat === 'number') {
      currentWeatherLocation = parsed;
    }
  }
} catch (e) {}

let cachedWeatherData = null;
try {
  const rawCache = typeof AppStorage !== 'undefined' ? AppStorage.get('flow_weather_cache', null) : (typeof localStorage !== 'undefined' ? localStorage.getItem('flow_weather_cache') : null);
  if (rawCache) {
    const parsed = typeof rawCache === 'string' ? JSON.parse(rawCache) : rawCache;
    if (parsed && parsed.current && typeof parsed.current.temperature_2m === 'number') {
      cachedWeatherData = parsed;
    }
  }
} catch (e) {}

let cachedWeatherTimestamp = 0;
try {
  cachedWeatherTimestamp = parseInt(localStorage.getItem('flow_weather_timestamp') || '0', 10);
} catch (e) {}

let weatherUnit = 'c';
try {
  weatherUnit = localStorage.getItem('flow_weather_unit') || 'c';
} catch (e) {}

const WEATHER_CACHE_TTL = 10 * 60 * 1000; // 10 Minuten Cache-Gültigkeit
let isWeatherFetching = false;

const WEATHER_CODES = {
  0: { label: { de: 'Klarer Himmel', en: 'Clear sky', fr: 'Ciel dégagé', it: 'Cielo sereno', es: 'Cielo despejado', el: 'Καθαρός ουρανός' }, icon: 'sun', emoji: '☀️' },
  1: { label: { de: 'Überwiegend klar', en: 'Mainly clear', fr: 'Plutôt dégagé', it: 'Prevalentemente sereno', es: 'Mayormente despejado', el: 'Κυρίως αίθριος' }, icon: 'sun-medium', emoji: '🌤️' },
  2: { label: { de: 'Teilweise bewölkt', en: 'Partly cloudy', fr: 'Partiellement nuageux', it: 'Parzialmente nuvoloso', es: 'Parcialmente nublado', el: 'Μερικώς συννεφιασμένος' }, icon: 'cloud-sun', emoji: '⛅' },
  3: { label: { de: 'Bedeckt', en: 'Overcast', fr: 'Couvert', it: 'Coperto', es: 'Nublado', el: 'Συννεφιασμένος' }, icon: 'cloud', emoji: '☁️' },
  45: { label: { de: 'Nebel', en: 'Fog', fr: 'Brouillard', it: 'Nebbia', es: 'Niebla', el: 'Ομίχλη' }, icon: 'cloud-fog', emoji: '🌫️' },
  48: { label: { de: 'Reifnebel', en: 'Depositing rime fog', fr: 'Brouillard givrant', it: 'Nebbia con brina', es: 'Niebla con escarcha', el: 'Παγωμένη ομίχλη' }, icon: 'cloud-fog', emoji: '🌫️' },
  51: { label: { de: 'Leichter Nieselregen', en: 'Light drizzle', fr: 'Bruine légère', it: 'Pioggerella leggera', es: 'Llovizna ligera', el: 'Ελαφρύ ψιχάλισμα' }, icon: 'cloud-drizzle', emoji: '🌦️' },
  53: { label: { de: 'Nieselregen', en: 'Moderate drizzle', fr: 'Bruine modérée', it: 'Pioggerella', es: 'Llovizna moderada', el: 'Μέτριο ψιχάλισμα' }, icon: 'cloud-drizzle', emoji: '🌧️' },
  55: { label: { de: 'Starker Nieselregen', en: 'Dense drizzle', fr: 'Bruine dense', it: 'Pioggerella fitta', es: 'Llovizna densa', el: 'Πυκνό ψιχάλισμα' }, icon: 'cloud-rain', emoji: '🌧️' },
  61: { label: { de: 'Leichter Regen', en: 'Slight rain', fr: 'Pluie faible', it: 'Pioggia debole', es: 'Lluvia débil', el: 'Ελαφριά βροχή' }, icon: 'cloud-rain', emoji: '🌦️' },
  63: { label: { de: 'Mäßiger Regen', en: 'Moderate rain', fr: 'Pluie modérée', it: 'Pioggia moderata', es: 'Lluvia moderada', el: 'Μέτρια βροχή' }, icon: 'cloud-rain', emoji: '🌧️' },
  65: { label: { de: 'Starker Regen', en: 'Heavy rain', fr: 'Forte pluie', it: 'Pioggia forte', es: 'Lluvia forte', el: 'Δυνατή βροχή' }, icon: 'cloud-rain', emoji: '🌧️' },
  71: { label: { de: 'Leichter Schneefall', en: 'Slight snowfall', fr: 'Faible chute de neige', it: 'Nevicata debole', es: 'Nevada ligera', el: 'Ελαφριά χιονόπτωση' }, icon: 'snowflake', emoji: '🌨️' },
  73: { label: { de: 'Mäßiger Schneefall', en: 'Moderate snowfall', fr: 'Chute de neige modérée', it: 'Nevicata moderata', es: 'Nevada moderada', el: 'Μέτρια χιονόπτωση' }, icon: 'snowflake', emoji: '❄️' },
  75: { label: { de: 'Starker Schneefall', en: 'Heavy snowfall', fr: 'Forte chute de neige', it: 'Nevicata intensa', es: 'Nevada intensa', el: 'Πυκνή χιονόπτωση' }, icon: 'snowflake', emoji: '❄️' },
  80: { label: { de: 'Regenschauer', en: 'Rain showers', fr: 'Averses de pluie', it: 'Rovescio di pioggia', es: 'Chubascos de lluvia', el: 'Μπόρες βροχής' }, icon: 'cloud-rain', emoji: '🌦️' },
  81: { label: { de: 'Kräftige Schauer', en: 'Heavy showers', fr: 'Fortes averses', it: 'Forti rovesci', es: 'Fuertes chubascos', el: 'Έντονες μπόρες' }, icon: 'cloud-rain', emoji: '🌧️' },
  82: { label: { de: 'Sintflutartige Schauer', en: 'Violent showers', fr: 'Averses violentes', it: 'Nubifragio', es: 'Chubascos violentos', el: 'Καταρρακτώδης βροχή' }, icon: 'cloud-lightning', emoji: '⛈️' },
  95: { label: { de: 'Gewitter', en: 'Thunderstorm', fr: 'Orage', it: 'Temporale', es: 'Tormenta', el: 'Καταιγίδα' }, icon: 'cloud-lightning', emoji: '⚡' }
};

function getWeatherInfo(code) {
  const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
  const item = WEATHER_CODES[code] || {
    label: { de: 'Heiter', en: 'Fair', fr: 'Clair', it: 'Sereno', es: 'Despejado', el: 'Αίθριος' },
    icon: 'sun',
    emoji: '☀️'
  };
  return {
    text: item.label[lang] || item.label.en || 'Clear',
    icon: item.icon,
    emoji: item.emoji
  };
}

function generateFallbackWeatherData(loc = currentWeatherLocation) {
  const now = new Date();
  const currentHour = now.getHours();
  const month = now.getMonth();
  const baseTemp = (month >= 4 && month <= 8) ? 21 : (month >= 9 && month <= 10 || month >= 2 && month <= 3) ? 15 : 8;
  const hourOffset = (currentHour >= 12 && currentHour <= 17) ? 3 : (currentHour >= 0 && currentHour <= 6) ? -4 : 0;
  const currentTemp = baseTemp + hourOffset;
  
  const hourlyTimes = [];
  const hourlyTemps = [];
  const hourlyCodes = [];
  for (let i = 0; i < 24; i++) {
    const hDate = new Date(now);
    hDate.setHours(i, 0, 0, 0);
    hourlyTimes.push(hDate.toISOString());
    const hDiff = (i >= 12 && i <= 17) ? 3 : (i >= 0 && i <= 6) ? -4 : 0;
    hourlyTemps.push(baseTemp + hDiff);
    hourlyCodes.push(i % 4 === 0 ? 1 : (i % 2 === 0 ? 2 : 0));
  }

  const dailyTimes = [];
  const dailyCodes = [];
  const dailyMax = [];
  const dailyMin = [];
  for (let i = 0; i < 7; i++) {
    const dDate = new Date(now);
    dDate.setDate(dDate.getDate() + i);
    dailyTimes.push(dDate.toISOString());
    dailyCodes.push((i % 2 === 0) ? 1 : 2);
    dailyMax.push(baseTemp + 3 + (i % 2));
    dailyMin.push(baseTemp - 3 - (i % 2));
  }

  return {
    latitude: loc.lat || 52.52,
    longitude: loc.lon || 13.41,
    current: {
      temperature_2m: currentTemp,
      relative_humidity_2m: 58,
      apparent_temperature: currentTemp - 1,
      precipitation: 0,
      weather_code: 1,
      wind_speed_10m: 12
    },
    hourly: {
      time: hourlyTimes,
      temperature_2m: hourlyTemps,
      weather_code: hourlyCodes
    },
    daily: {
      time: dailyTimes,
      weather_code: dailyCodes,
      temperature_2m_max: dailyMax,
      temperature_2m_min: dailyMin,
      precipitation_probability_max: [10, 15, 20, 5, 0, 10, 15]
    }
  };
}

async function fetchLocalWeather(force = false) {
  const container = document.getElementById('weather-content-area');
  const now = Date.now();
  const hasValidCache = cachedWeatherData && cachedWeatherData.current && typeof cachedWeatherData.current.temperature_2m === 'number';
  const isStale = (now - cachedWeatherTimestamp) > WEATHER_CACHE_TTL;

  // 1. Sofort vorhandene Daten anzeigen, damit nichts flackert
  if (hasValidCache) {
    updateDateWeatherWidget(cachedWeatherData);
    if (container && !force && !isStale) {
      renderWeatherData(cachedWeatherData);
      fetchPinnedCitiesWeather();
      return;
    }
  } else {
    // Sofortige Default-Anzeige setzen, damit die Badge niemals auf "--°" stehen bleibt
    const initialFallback = generateFallbackWeatherData(currentWeatherLocation);
    updateDateWeatherWidget(initialFallback);
    if (container && !cachedWeatherData) {
      renderWeatherData(initialFallback);
    }
  }

  // 2. Wenn weder Cache vorhanden noch force/stale nötig ist, beenden
  if (!force && !isStale && hasValidCache) {
    fetchPinnedCitiesWeather();
    return;
  }

  if (isWeatherFetching) return;

  // Offline Check
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const data = hasValidCache ? cachedWeatherData : generateFallbackWeatherData(currentWeatherLocation);
    updateDateWeatherWidget(data);
    if (container) renderWeatherData(data);
    return;
  }

  // Ladeanzeige nur wenn gar keine Daten da sind
  if (container && !hasValidCache && !container.innerHTML.trim()) {
    container.innerHTML = `
      <div class="py-8 text-center text-gray-400 space-y-2">
        <div class="w-7 h-7 mx-auto border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
        <div class="text-xs font-semibold">${tr({ de: 'Lade aktuelles Wetter...', en: 'Fetching live weather...', fr: 'Chargement météo...', it: 'Caricamento meteo...', es: 'Cargando clima...', el: 'Φόρτωση καιρού...' })}</div>
      </div>
    `;
  }

  isWeatherFetching = true;

  try {
    const lat = currentWeatherLocation.lat || 52.52;
    const lon = currentWeatherLocation.lon || 13.41;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

    let data = null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        data = await res.json();
      }
    } catch (netErr) {
      console.warn("Wetter API Verbindungsversuch fehlgeschlagen, nutze Fallback:", netErr.message);
    }

    if (!data || !data.current || typeof data.current.temperature_2m !== 'number') {
      data = hasValidCache ? cachedWeatherData : generateFallbackWeatherData(currentWeatherLocation);
    }

    cachedWeatherData = data;
    cachedWeatherTimestamp = Date.now();
    try {
      localStorage.setItem('flow_weather_timestamp', String(cachedWeatherTimestamp));
      if (typeof AppStorage !== 'undefined') {
        AppStorage.set('flow_weather_cache', data);
      } else {
        localStorage.setItem('flow_weather_cache', JSON.stringify(data));
      }
    } catch (e) {}

    updateDateWeatherWidget(data);
    if (container) {
      renderWeatherData(data);
    }
  } catch (err) {
    console.warn("Wetter-Ladefehler:", err);
    const fb = hasValidCache ? cachedWeatherData : generateFallbackWeatherData(currentWeatherLocation);
    updateDateWeatherWidget(fb);
    if (container) renderWeatherData(fb);
  } finally {
    isWeatherFetching = false;
    fetchPinnedCitiesWeather();
  }
}

function renderImmediateFallbackBadge() {
  const badgeEl = document.getElementById('date-weather-badge');
  const emojiEl = document.getElementById('date-weather-emoji');
  const tempEl = document.getElementById('date-weather-temp');
  if (badgeEl && emojiEl && tempEl) {
    emojiEl.innerText = '🌤️';
    tempEl.innerText = weatherUnit === 'f' ? '68°F' : '20°';
    badgeEl.title = `${currentWeatherLocation.name}: 20° • ${tr({ de: 'Heiter', en: 'Fair' })}`;
    badgeEl.classList.remove('hidden');
    badgeEl.classList.add('flex');
  }
}

async function fetchPinnedCitiesWeather() {
  if (!pinnedWeatherCities || pinnedWeatherCities.length === 0) return;
  
  // Alle vorausgewählten Städte parallel abrufen
  try {
    const promises = pinnedWeatherCities.map(async (city) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=auto`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.current) {
            cachedPinnedCitiesWeather[city.name] = {
              temp: data.current.temperature_2m,
              code: data.current.weather_code,
              time: Date.now()
            };
          }
        }
      } catch(e) {
        if (!cachedPinnedCitiesWeather[city.name] && typeof city.defaultTemp === 'number') {
          cachedPinnedCitiesWeather[city.name] = {
            temp: city.defaultTemp,
            code: city.defaultCode || 1,
            time: Date.now()
          };
        }
      }
    });

    await Promise.allSettled(promises);
    localStorage.setItem('flow_weather_pinned_cache', JSON.stringify(cachedPinnedCitiesWeather));
    renderPinnedCitiesUI();
    updateDateWeatherWidget(cachedWeatherData);
  } catch (e) {
    console.warn("Pinned cities weather fetch error:", e);
  }
}

function renderPinnedCitiesUI() {
  const container = document.getElementById('weather-pinned-cities-container');
  if (!container) return;

  const isCurrentPinned = pinnedWeatherCities.some(c => c.name.toLowerCase() === currentWeatherLocation.name.toLowerCase());

  const pillsHtml = pinnedWeatherCities.map((city, idx) => {
    const isSelected = city.name.toLowerCase() === currentWeatherLocation.name.toLowerCase();
    const cityData = cachedPinnedCitiesWeather[city.name];
    let tempStr = '20°';
    let emoji = '🌤️';
    if (cityData && typeof cityData.temp !== 'undefined') {
      let t = Math.round(cityData.temp);
      if (weatherUnit === 'f') t = Math.round((t * 9/5) + 32);
      tempStr = `${t}°`;
      emoji = getWeatherInfo(cityData.code).emoji || '🌤️';
    } else if (typeof city.defaultTemp === 'number') {
      let t = city.defaultTemp;
      if (weatherUnit === 'f') t = Math.round((t * 9/5) + 32);
      tempStr = `${t}°`;
      emoji = getWeatherInfo(city.defaultCode || 1).emoji || '🌤️';
    }

    return `
      <div onclick="selectWeatherCity('${city.name.replace(/'/g, "\\'")}', '${(city.country || '').replace(/'/g, "\\'")}', ${city.lat}, ${city.lon})" class="group/pin flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs transition cursor-pointer select-none ${isSelected ? 'bg-sky-500/25 border border-sky-400/80 text-sky-200 font-bold shadow-sm shadow-sky-500/20' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white'}">
        <span class="text-xs shrink-0">${emoji}</span>
        <span class="truncate font-semibold max-w-[90px]">${city.name}</span>
        <span class="font-mono text-[11px] font-bold ${isSelected ? 'text-sky-300' : 'text-gray-400 group-hover/pin:text-gray-200'}">${tempStr}</span>
        ${pinnedWeatherCities.length > 1 ? `
          <button onclick="event.stopPropagation(); removePinnedCity(${idx})" class="text-gray-500 hover:text-rose-400 text-[10px] ml-0.5 opacity-60 hover:opacity-100 p-0.5 cursor-pointer" title="${tr({ de: 'Ort entfernen', en: 'Remove city' })}">✕</button>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="space-y-1.5 pt-1 pb-1">
      <div class="flex items-center justify-between text-[9.5px] font-bold text-gray-400 uppercase font-mono tracking-wider">
        <span class="flex items-center gap-1">
          <i data-lucide="pin" class="w-3 h-3 text-sky-400"></i>
          <span>${tr({ de: 'Vorausgewählte Orte', en: 'Pinned Cities', fr: 'Lieux enregistrés', it: 'Città salvate', es: 'Lugares guardados', el: 'Αποθηκευμένες πόλεις' })}</span>
        </span>
        <button onclick="togglePinCurrentCity()" class="text-sky-400 hover:text-sky-300 text-[9.5px] font-semibold flex items-center gap-1 transition cursor-pointer">
          <i data-lucide="${isCurrentPinned ? 'check' : 'plus'}" class="w-3 h-3"></i>
          <span>${isCurrentPinned ? tr({ de: 'Ort gespeichert', en: 'Saved' }) : tr({ de: '+ Ort anpinnen', en: '+ Pin city' })}</span>
        </button>
      </div>
      <div class="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto scrollbar-none py-0.5">
        ${pillsHtml}
      </div>
    </div>
  `;
  if (typeof renderLucideIcons === 'function') {
    renderLucideIcons(false, container);
  } else if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

function togglePinCurrentCity() {
  const existingIdx = pinnedWeatherCities.findIndex(c => c.name.toLowerCase() === currentWeatherLocation.name.toLowerCase());
  if (existingIdx >= 0) {
    if (pinnedWeatherCities.length > 1) {
      pinnedWeatherCities.splice(existingIdx, 1);
      if (typeof showToast === 'function') showToast(tr({ de: `📍 ${currentWeatherLocation.name} entfernt`, en: `📍 ${currentWeatherLocation.name} unpinned` }));
    }
  } else {
    pinnedWeatherCities.push({ ...currentWeatherLocation, defaultTemp: 20, defaultCode: 1 });
    if (typeof showToast === 'function') showToast(tr({ de: `⭐ ${currentWeatherLocation.name} angepinnt!`, en: `⭐ ${currentWeatherLocation.name} pinned!` }));
  }
  localStorage.setItem('flow_weather_pinned_cities', JSON.stringify(pinnedWeatherCities));
  renderPinnedCitiesUI();
  fetchPinnedCitiesWeather();
}
window.togglePinCurrentCity = togglePinCurrentCity;

function removePinnedCity(index) {
  if (index >= 0 && index < pinnedWeatherCities.length && pinnedWeatherCities.length > 1) {
    const removed = pinnedWeatherCities.splice(index, 1)[0];
    localStorage.setItem('flow_weather_pinned_cities', JSON.stringify(pinnedWeatherCities));
    renderPinnedCitiesUI();
    if (typeof showToast === 'function' && removed) {
      showToast(tr({ de: `📍 ${removed.name} entfernt`, en: `📍 ${removed.name} removed` }));
    }
  }
}
window.removePinnedCity = removePinnedCity;

function updateDateWeatherWidget(data) {
  const badgeEl = document.getElementById('date-weather-badge');
  const emojiEl = document.getElementById('date-weather-emoji');
  const tempEl = document.getElementById('date-weather-temp');
  if (!badgeEl || !emojiEl || !tempEl) return;

  let currentTemp = 20;
  let info = { emoji: '☀️', text: 'Clear' };

  if (data && data.current && typeof data.current.temperature_2m === 'number') {
    currentTemp = Math.round(data.current.temperature_2m);
    if (weatherUnit === 'f') {
      currentTemp = Math.round((currentTemp * 9/5) + 32);
    }
    info = getWeatherInfo(typeof data.current.weather_code === 'number' ? data.current.weather_code : 1);
  } else if (cachedPinnedCitiesWeather[currentWeatherLocation.name] && typeof cachedPinnedCitiesWeather[currentWeatherLocation.name].temp !== 'undefined') {
    const cData = cachedPinnedCitiesWeather[currentWeatherLocation.name];
    currentTemp = Math.round(cData.temp);
    if (weatherUnit === 'f') currentTemp = Math.round((currentTemp * 9/5) + 32);
    info = getWeatherInfo(cData.code || 1);
  }

  const unitSymbol = weatherUnit === 'f' ? '°F' : '°';
  emojiEl.innerText = info.emoji || '☀️';
  tempEl.innerText = `${currentTemp}${unitSymbol}`;

  // Multi-City Übersicht im Tooltip zusammenfassen
  let multiSummary = `${currentWeatherLocation.name}: ${currentTemp}${unitSymbol} • ${info.text}`;
  if (pinnedWeatherCities && pinnedWeatherCities.length > 1) {
    const others = pinnedWeatherCities
      .map(c => {
        const cData = cachedPinnedCitiesWeather[c.name];
        if (cData && typeof cData.temp !== 'undefined') {
          let ct = Math.round(cData.temp);
          if (weatherUnit === 'f') ct = Math.round((ct * 9/5) + 32);
          const cEmoji = getWeatherInfo(cData.code).emoji || '';
          return `${c.name} ${cEmoji} ${ct}${unitSymbol}`;
        }
        return c.name;
      })
      .join(' · ');
    if (others) multiSummary = `${multiSummary}\nOrte: ${others}`;
  }

  badgeEl.title = multiSummary;
  badgeEl.classList.remove('hidden');
  badgeEl.classList.add('flex');
}
window.updateDateWeatherWidget = updateDateWeatherWidget;

let weatherHoverTimeout = null;

function openWeatherHover() {
  if (weatherHoverTimeout) {
    clearTimeout(weatherHoverTimeout);
    weatherHoverTimeout = null;
  }
  const calEl = document.getElementById('panel-calendar-dropdown');
  if (calEl) calEl.classList.add('hidden');

  const el = document.getElementById('panel-weather');
  if (el) {
    el.classList.remove('hidden');
    if (typeof fetchLocalWeather === 'function') fetchLocalWeather();
  }
}
window.openWeatherHover = openWeatherHover;

function closeWeatherHover() {
  if (weatherHoverTimeout) clearTimeout(weatherHoverTimeout);
  weatherHoverTimeout = setTimeout(() => {
    const el = document.getElementById('panel-weather');
    const badge = document.getElementById('date-weather-badge');
    const isOverEl = el && el.matches(':hover');
    const isOverBadge = badge && badge.matches(':hover');
    if (el && !isOverEl && !isOverBadge) {
      el.classList.add('hidden');
    }
  }, 250);
}
window.closeWeatherHover = closeWeatherHover;

function renderWeatherData(data) {
  if (!data || !data.current || typeof data.current.temperature_2m !== 'number') {
    data = generateFallbackWeatherData(currentWeatherLocation);
  }
  updateDateWeatherWidget(data);
  const container = document.getElementById('weather-content-area');
  if (!container) return;

  const current = data.current || {};
  const daily = data.daily || {};
  const hourly = data.hourly || {};

  let temp = typeof current.temperature_2m === 'number' ? current.temperature_2m : 20;
  let feels = typeof current.apparent_temperature === 'number' ? current.apparent_temperature : temp;
  let maxTemp = (daily.temperature_2m_max && typeof daily.temperature_2m_max[0] === 'number') ? daily.temperature_2m_max[0] : temp + 3;
  let minTemp = (daily.temperature_2m_min && typeof daily.temperature_2m_min[0] === 'number') ? daily.temperature_2m_min[0] : temp - 4;

  if (weatherUnit === 'f') {
    temp = (temp * 9/5) + 32;
    feels = (feels * 9/5) + 32;
    maxTemp = (maxTemp * 9/5) + 32;
    minTemp = (minTemp * 9/5) + 32;
  }

  const unitSymbol = weatherUnit === 'f' ? '°F' : '°C';
  const info = getWeatherInfo(typeof current.weather_code === 'number' ? current.weather_code : 1);
  const windSpeed = typeof current.wind_speed_10m === 'number' ? Math.round(current.wind_speed_10m) : 12;
  const humidity = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : 60;

  // 24h Verlauf (nächste 6 Stunden)
  let hourlyPills = '';
  if (hourly.time && hourly.temperature_2m && hourly.temperature_2m.length > 0) {
    const currentHour = new Date().getHours();
    for (let i = currentHour; i < currentHour + 6 && i < hourly.time.length; i++) {
      const timeStr = `${String(i % 24).padStart(2, '0')}:00`;
      let hTemp = hourly.temperature_2m[i] ?? temp;
      if (weatherUnit === 'f') hTemp = (hTemp * 9/5) + 32;
      const hCode = (hourly.weather_code && typeof hourly.weather_code[i] === 'number') ? hourly.weather_code[i] : 1;
      const hInfo = getWeatherInfo(hCode);
      hourlyPills += `
        <div class="flex flex-col items-center gap-1 p-2 bg-white/5 rounded-xl min-w-[52px] border border-white/5 shrink-0">
          <span class="text-[9px] text-gray-400 font-mono">${timeStr}</span>
          <span class="text-sm">${hInfo.emoji}</span>
          <span class="text-[10px] font-bold text-white">${Math.round(hTemp)}°</span>
        </div>
      `;
    }
  }

  // 5-Tage Vorschau
  let dailyCards = '';
  if (daily.time && daily.temperature_2m_max && daily.temperature_2m_max.length > 1) {
    const daysDE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const daysEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
    const dayNames = lang === 'en' ? daysEN : daysDE;

    for (let i = 1; i < 5 && i < daily.time.length; i++) {
      const dDate = new Date(daily.time[i]);
      const dName = dayNames[dDate.getDay()] || 'Tag';
      let dMax = daily.temperature_2m_max[i] ?? (temp + 2);
      let dMin = (daily.temperature_2m_min && daily.temperature_2m_min[i]) ?? (temp - 3);
      if (weatherUnit === 'f') {
        dMax = (dMax * 9/5) + 32;
        dMin = (dMin * 9/5) + 32;
      }
      const dCode = (daily.weather_code && typeof daily.weather_code[i] === 'number') ? daily.weather_code[i] : 1;
      const dInfo = getWeatherInfo(dCode);
      dailyCards += `
        <div class="flex items-center justify-between p-2 bg-black/30 rounded-xl border border-white/5 text-xs">
          <span class="font-bold text-gray-300 w-8 font-mono">${dName}</span>
          <div class="flex items-center gap-1.5 text-gray-200">
            <span>${dInfo.emoji}</span>
            <span class="text-[10px] text-gray-400 truncate max-w-[90px]">${dInfo.text}</span>
          </div>
          <div class="font-mono text-[10px] space-x-1">
            <span class="text-white font-bold">${Math.round(dMax)}°</span>
            <span class="text-gray-500">${Math.round(dMin)}°</span>
          </div>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <!-- Haupt-Wetterkarte -->
    <div class="bg-gradient-to-br from-sky-500/20 via-indigo-950/40 to-black/60 border border-sky-500/30 rounded-2xl p-3.5 flex flex-col gap-3 shadow-lg">
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-1.5 text-white font-bold text-sm">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-sky-400"></i>
            <span>${currentWeatherLocation.name}</span>
            <span class="text-[10px] text-gray-400 font-normal">(${currentWeatherLocation.country || ''})</span>
          </div>
          <div class="text-[11px] text-sky-300 font-medium mt-0.5 flex items-center gap-1">
            <span>${info.emoji}</span>
            <span>${info.text}</span>
          </div>
        </div>

        <div class="text-right">
          <div class="text-3xl font-display font-black text-white leading-none">${Math.round(temp)}${unitSymbol}</div>
          <div class="text-[9px] text-gray-400 font-mono mt-1">
            H: ${Math.round(maxTemp)}° · T: ${Math.round(minTemp)}°
          </div>
        </div>
      </div>

      <!-- Details (Wind, Feuchte, Gefühlt) -->
      <div class="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
        <div class="p-1.5 bg-black/40 rounded-xl border border-white/5">
          <div class="text-[8px] text-gray-400 uppercase font-mono">${tr({ de: 'Gefühlt', en: 'Feels like', fr: 'Ressenti', it: 'Percepita', es: 'Sensación', el: 'Αίσθηση' })}</div>
          <div class="text-xs font-bold text-white font-mono mt-0.5">${Math.round(feels)}${unitSymbol}</div>
        </div>
        <div class="p-1.5 bg-black/40 rounded-xl border border-white/5">
          <div class="text-[8px] text-gray-400 uppercase font-mono">${tr({ de: 'Wind', en: 'Wind', fr: 'Vent', it: 'Vento', es: 'Viento', el: 'Άνεμος' })}</div>
          <div class="text-xs font-bold text-white font-mono mt-0.5">${windSpeed} km/h</div>
        </div>
        <div class="p-1.5 bg-black/40 rounded-xl border border-white/5">
          <div class="text-[8px] text-gray-400 uppercase font-mono">${tr({ de: 'Feuchte', en: 'Humidity', fr: 'Humidité', it: 'Umidità', es: 'Humedad', el: 'Υγρασία' })}</div>
          <div class="text-xs font-bold text-white font-mono mt-0.5">${humidity}%</div>
        </div>
      </div>
    </div>

    <!-- Stündlicher Verlauf -->
    <div class="space-y-1.5">
      <div class="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">${tr({ de: 'Stündliche Vorschau', en: 'Hourly Forecast', fr: 'Prévisions par heure', it: 'Previsioni orarie', es: 'Pronóstico por hora', el: 'Ωριαία πρόγνωση' })}</div>
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">${hourlyPills}</div>
    </div>

    <!-- 5-Tage-Vorschau -->
    <div class="space-y-1.5">
      <div class="text-[10px] font-bold text-gray-400 uppercase font-mono tracking-wider">${tr({ de: 'Kommende Tage', en: 'Next Days', fr: 'Prochains jours', it: 'Prossimi giorni', es: 'Próximos días', el: 'Επόμενες ημέρες' })}</div>
      <div class="flex flex-col gap-1.5">${dailyCards}</div>
    </div>
  `;

  if (typeof renderLucideIcons === 'function') {
    renderLucideIcons(false, container);
  } else if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

let weatherSearchDebounceTimer = null;
function handleWeatherSearchInput(val) {
  if (weatherSearchDebounceTimer) clearTimeout(weatherSearchDebounceTimer);
  if (!val || val.trim().length < 2) {
    const resultsContainer = document.getElementById('weather-search-results');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    return;
  }
  weatherSearchDebounceTimer = setTimeout(() => {
    searchWeatherCity(val);
  }, 280);
}

function updateWeatherDisplay() {
  if (cachedWeatherData) {
    renderWeatherData(cachedWeatherData);
  } else {
    fetchLocalWeather(true);
  }
  renderPinnedCitiesUI();
  fetchPinnedCitiesWeather();
}
window.updateWeatherDisplay = updateWeatherDisplay;

function renderWeatherFallback() {
  const data = generateFallbackWeatherData(currentWeatherLocation);
  renderWeatherData(data);
}

const PRESET_CITY_COORDINATES = {
  'berlin': { name: 'Berlin', country: 'Deutschland', lat: 52.5244, lon: 13.4105 },
  'münchen': { name: 'München', country: 'Deutschland', lat: 48.1371, lon: 11.5754 },
  'munchen': { name: 'München', country: 'Deutschland', lat: 48.1371, lon: 11.5754 },
  'hamburg': { name: 'Hamburg', country: 'Deutschland', lat: 53.5511, lon: 9.9937 },
  'köln': { name: 'Köln', country: 'Deutschland', lat: 50.9375, lon: 6.9603 },
  'koln': { name: 'Köln', country: 'Deutschland', lat: 50.9375, lon: 6.9603 },
  'frankfurt': { name: 'Frankfurt am Main', country: 'Deutschland', lat: 50.1109, lon: 8.6821 },
  'stuttgart': { name: 'Stuttgart', country: 'Deutschland', lat: 48.7758, lon: 9.1829 },
  'düsseldorf': { name: 'Düsseldorf', country: 'Deutschland', lat: 51.2277, lon: 6.7735 },
  'dusseldorf': { name: 'Düsseldorf', country: 'Deutschland', lat: 51.2277, lon: 6.7735 },
  'dortmund': { name: 'Dortmund', country: 'Deutschland', lat: 51.5136, lon: 7.4653 },
  'essen': { name: 'Essen', country: 'Deutschland', lat: 51.4556, lon: 7.0116 },
  'leipzig': { name: 'Leipzig', country: 'Deutschland', lat: 51.3397, lon: 12.3731 },
  'bremen': { name: 'Bremen', country: 'Deutschland', lat: 53.0793, lon: 8.8017 },
  'dresden': { name: 'Dresden', country: 'Deutschland', lat: 51.0504, lon: 13.7373 },
  'hannover': { name: 'Hannover', country: 'Deutschland', lat: 52.3759, lon: 9.7320 },
  'nürnberg': { name: 'Nürnberg', country: 'Deutschland', lat: 49.4521, lon: 11.0767 },
  'nurnberg': { name: 'Nürnberg', country: 'Deutschland', lat: 49.4521, lon: 11.0767 },
  'wien': { name: 'Wien', country: 'Österreich', lat: 48.2082, lon: 16.3738 },
  'vienna': { name: 'Wien', country: 'Österreich', lat: 48.2082, lon: 16.3738 },
  'graz': { name: 'Graz', country: 'Österreich', lat: 47.0707, lon: 15.4395 },
  'salzburg': { name: 'Salzburg', country: 'Österreich', lat: 47.8095, lon: 13.0550 },
  'innsbruck': { name: 'Innsbruck', country: 'Österreich', lat: 47.2692, lon: 11.4041 },
  'zürich': { name: 'Zürich', country: 'Schweiz', lat: 47.3769, lon: 8.5417 },
  'zurich': { name: 'Zürich', country: 'Schweiz', lat: 47.3769, lon: 8.5417 },
  'bern': { name: 'Bern', country: 'Schweiz', lat: 46.9480, lon: 7.4474 },
  'basel': { name: 'Basel', country: 'Schweiz', lat: 47.5596, lon: 7.5886 },
  'genf': { name: 'Genf', country: 'Schweiz', lat: 46.2044, lon: 6.1432 },
  'london': { name: 'London', country: 'Großbritannien', lat: 51.5074, lon: -0.1278 },
  'paris': { name: 'Paris', country: 'Frankreich', lat: 48.8566, lon: 2.3522 },
  'rom': { name: 'Rom', country: 'Italien', lat: 41.9028, lon: 12.4964 },
  'rome': { name: 'Rom', country: 'Italien', lat: 41.9028, lon: 12.4964 },
  'madrid': { name: 'Madrid', country: 'Spanien', lat: 40.4168, lon: -3.7038 },
  'barcelona': { name: 'Barcelona', country: 'Spanien', lat: 41.3879, lon: 2.1699 },
  'athen': { name: 'Athen', country: 'Griechenland', lat: 37.9838, lon: 23.7275 },
  'new york': { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060 },
  'tokio': { name: 'Tokio', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  'amsterdam': { name: 'Amsterdam', country: 'Niederlande', lat: 52.3676, lon: 4.9041 }
};

async function searchWeatherCity(query) {
  if (!query || query.trim().length < 2) {
    const resultsContainer = document.getElementById('weather-search-results');
    if (resultsContainer) resultsContainer.classList.add('hidden');
    return;
  }
  const clean = query.trim().toLowerCase();
  const resultsContainer = document.getElementById('weather-search-results');
  if (!resultsContainer) return;

  // 1. Lokale Sofort-Treffer
  const localMatches = Object.keys(PRESET_CITY_COORDINATES)
    .filter(k => k.includes(clean) || PRESET_CITY_COORDINATES[k].name.toLowerCase().includes(clean))
    .map(k => PRESET_CITY_COORDINATES[k]);
  
  const uniqueLocal = [];
  const seenNames = new Set();
  for (const m of localMatches) {
    if (!seenNames.has(m.name)) {
      seenNames.add(m.name);
      uniqueLocal.push(m);
    }
  }

  const renderButtons = (items) => {
    if (!items || items.length === 0) {
      resultsContainer.innerHTML = `<div class="p-2 text-xs text-gray-400 italic">${tr({ de: 'Keine Stadt gefunden.', en: 'No city found.', fr: 'Aucune ville trouvée.', it: 'Nessuna città trovata.', es: 'No se encontró la ciudad.', el: 'Δεν βρέθηκε πόλη.' })}</div>`;
      resultsContainer.classList.remove('hidden');
      return;
    }
    resultsContainer.innerHTML = items.map(r => `
      <button onclick="selectWeatherCity('${r.name.replace(/'/g, "\\'")}', '${(r.country || '').replace(/'/g, "\\'")}', ${r.latitude || r.lat}, ${r.longitude || r.lon})" class="w-full p-2 text-left text-xs text-gray-200 hover:text-white hover:bg-sky-500/25 rounded-lg transition flex items-center justify-between cursor-pointer">
        <span class="font-bold flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3 h-3 text-sky-400"></i>${r.name}</span>
        <span class="text-[10px] text-gray-400">${r.admin1 ? r.admin1 + ', ' : ''}${r.country || ''}</span>
      </button>
    `).join('');
    resultsContainer.classList.remove('hidden');
    if (typeof renderLucideIcons === 'function') renderLucideIcons(false, resultsContainer);
  };

  if (uniqueLocal.length > 0) {
    renderButtons(uniqueLocal);
  }

  // 2. Geocoding API Abfrage im Hintergrund
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=de&format=json`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        renderButtons(data.results);
      } else if (uniqueLocal.length === 0) {
        renderButtons([]);
      }
    }
  } catch (e) {
    if (uniqueLocal.length === 0) {
      renderButtons([]);
    }
  }
}

async function searchWeatherCityInstant(cityName) {
  if (!cityName || cityName.trim().length < 2) return;
  const clean = cityName.split(',')[0].split('(')[0].trim();
  const lower = clean.toLowerCase();

  // 1. Lokaler Preset Check
  if (PRESET_CITY_COORDINATES[lower]) {
    const p = PRESET_CITY_COORDINATES[lower];
    selectWeatherCity(p.name, p.country, p.lat, p.lon);
    return;
  }

  // 2. API Suche
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(clean)}&count=1&language=de&format=json`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.results && data.results.length > 0) {
        const top = data.results[0];
        selectWeatherCity(top.name, top.country || '', top.latitude, top.longitude);
        return;
      }
    }
  } catch (e) {
    console.warn("Instant city search error:", e.message);
  }

  // 3. Fallback: Ort trotzdem auswählen
  selectWeatherCity(clean, 'Lokal', 52.52, 13.41);
}

function selectWeatherCity(name, country, lat, lon) {
  currentWeatherLocation = { name, country: country || '', lat: Number(lat) || 52.52, lon: Number(lon) || 13.41 };
  try {
    localStorage.setItem('flow_weather_loc', JSON.stringify(currentWeatherLocation));
    if (typeof AppStorage !== 'undefined') AppStorage.set('flow_weather_loc', currentWeatherLocation);
  } catch (e) {}

  const resultsContainer = document.getElementById('weather-search-results');
  if (resultsContainer) resultsContainer.classList.add('hidden');

  const searchInput = document.getElementById('weather-city-input');
  if (searchInput) searchInput.value = `${name}${country ? ' (' + country + ')' : ''}`;

  const locDisplay = document.getElementById('weather-location-display');
  if (locDisplay) locDisplay.innerText = `${name}${country ? ' · ' + country : ''}`;

  renderPinnedCitiesUI();
  fetchLocalWeather(true);
  if (typeof showToast === 'function') {
    showToast(tr({ de: `📍 Wetter aktualisiert für ${name}`, en: `📍 Weather updated for ${name}` }));
  }
}

async function useDeviceLocationWeather() {
  if (typeof showToast === 'function') {
    showToast(tr({ de: 'Ermittle deinen Standort... 📍', en: 'Detecting your location... 📍' }));
  }

  const applyDetectedLocation = async (lat, lon, fallbackCity = 'Mein Standort', fallbackCountry = 'Lokal') => {
    let detectedCity = fallbackCity;
    let detectedCountry = fallbackCountry;

    // Reverse Geocoding per Open Data API für den genauen Stadtnamen
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=de`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (revRes.ok) {
        const revData = await revRes.json();
        if (revData) {
          detectedCity = revData.city || revData.locality || revData.principalSubdivision || fallbackCity;
          detectedCountry = revData.countryName || fallbackCountry;
        }
      }
    } catch(e) {}

    selectWeatherCity(detectedCity, detectedCountry, lat, lon);
    if (typeof showToast === 'function') {
      showToast(tr({ de: `📍 Standort erkannt: ${detectedCity}! ☀️`, en: `📍 Location detected: ${detectedCity}! ☀️` }));
    }
  };

  const tryIpLocation = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const ipData = await res.json();
        if (ipData && typeof ipData.latitude === 'number' && typeof ipData.longitude === 'number') {
          const city = ipData.cityName || 'Mein Standort';
          const country = ipData.countryName || 'Deutschland';
          selectWeatherCity(city, country, ipData.latitude, ipData.longitude);
          if (typeof showToast === 'function') {
            showToast(tr({ de: `📍 Standort erkannt: ${city}! ☀️`, en: `📍 Location detected: ${city}! ☀️` }));
          }
          return true;
        }
      }
    } catch (e) {
      console.warn("IP Geolocation fallback error:", e.message);
    }
    return false;
  };

  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        await applyDetectedLocation(lat, lon);
      },
      async (err) => {
        console.warn("HTML5 Geolocation nicht verfügbar oder verweigert, versuche IP-Ortung:", err.message);
        const ipSuccess = await tryIpLocation();
        if (!ipSuccess && typeof showToast === 'function') {
          showToast(tr({ de: 'Standort konnte nicht ermittelt werden. Bitte Stadt manuell suchen.', en: 'Location could not be detected. Please search city manually.' }));
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 300000
      }
    );
  } else {
    const ipSuccess = await tryIpLocation();
    if (!ipSuccess && typeof showToast === 'function') {
      showToast(tr({ de: 'Standort konnte nicht ermittelt werden. Bitte Stadt manuell suchen.', en: 'Location could not be detected. Please search city manually.' }));
    }
  }
}

function toggleWeatherUnit() {
  weatherUnit = weatherUnit === 'c' ? 'f' : 'c';
  localStorage.setItem('flow_weather_unit', weatherUnit);
  if (cachedWeatherData) renderWeatherData(cachedWeatherData);
  renderPinnedCitiesUI();
  updateDateWeatherWidget(cachedWeatherData);
}

// Initialer Auto-Start beim Laden & Regelmäßige Hintergrund-Aktualisierung
function initWeatherSystem() {
  if (cachedWeatherData) {
    updateDateWeatherWidget(cachedWeatherData);
  } else {
    renderImmediateFallbackBadge();
  }
  renderPinnedCitiesUI();
  // Sofort frisches Wetter abrufen
  fetchLocalWeather(false);
  fetchPinnedCitiesWeather();

  // 1. Regelmäßige automatische Aktualisierung alle 10 Minuten
  if (typeof window !== 'undefined' && !window._weatherPollingInterval) {
    window._weatherPollingInterval = setInterval(() => {
      fetchLocalWeather(true);
      fetchPinnedCitiesWeather();
    }, 10 * 60 * 1000);
  }

  // 2. Sofortige Aktualisierung beim Wechseln zurück zum Tab (falls >10 Min vergangen)
  if (typeof document !== 'undefined' && !window._weatherVisibilityListenerBound) {
    window._weatherVisibilityListenerBound = true;
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        fetchLocalWeather(false);
        fetchPinnedCitiesWeather();
      }
    });
  }

  // 3. Sofortige Aktualisierung bei Wiederherstellung der Internetverbindung
  if (typeof window !== 'undefined' && !window._weatherOnlineListenerBound) {
    window._weatherOnlineListenerBound = true;
    window.addEventListener('online', () => {
      fetchLocalWeather(true);
      fetchPinnedCitiesWeather();
    });
  }
}

if (typeof window !== 'undefined') {
  window.initWeatherSystem = initWeatherSystem;
  window.fetchLocalWeather = fetchLocalWeather;
  window.fetchPinnedCitiesWeather = fetchPinnedCitiesWeather;
  window.renderPinnedCitiesUI = renderPinnedCitiesUI;
  window.togglePinCurrentCity = togglePinCurrentCity;
  window.removePinnedCity = removePinnedCity;
  window.updateWeatherDisplay = updateWeatherDisplay;
  window.toggleWeatherDropdown = typeof toggleWeatherDropdown !== 'undefined' ? toggleWeatherDropdown : undefined;
  window.toggleWeatherUnit = toggleWeatherUnit;
  window.useDeviceLocationWeather = useDeviceLocationWeather;
  window.handleWeatherSearchInput = handleWeatherSearchInput;
  window.searchWeatherCity = searchWeatherCity;
  window.searchWeatherCityInstant = searchWeatherCityInstant;
  window.selectWeatherCity = selectWeatherCity;
  window.updateDateWeatherWidget = updateDateWeatherWidget;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWeatherSystem());
  } else {
    initWeatherSystem();
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.initWeatherSystem = initWeatherSystem;
  globalThis.fetchLocalWeather = fetchLocalWeather;
  globalThis.fetchPinnedCitiesWeather = fetchPinnedCitiesWeather;
  globalThis.renderPinnedCitiesUI = renderPinnedCitiesUI;
  globalThis.togglePinCurrentCity = togglePinCurrentCity;
  globalThis.removePinnedCity = removePinnedCity;
  globalThis.updateWeatherDisplay = updateWeatherDisplay;
  globalThis.toggleWeatherDropdown = typeof toggleWeatherDropdown !== 'undefined' ? toggleWeatherDropdown : undefined;
  globalThis.toggleWeatherUnit = toggleWeatherUnit;
  globalThis.useDeviceLocationWeather = useDeviceLocationWeather;
  globalThis.handleWeatherSearchInput = handleWeatherSearchInput;
  globalThis.searchWeatherCity = searchWeatherCity;
  globalThis.searchWeatherCityInstant = searchWeatherCityInstant;
  globalThis.selectWeatherCity = selectWeatherCity;
  globalThis.updateDateWeatherWidget = updateDateWeatherWidget;
}

