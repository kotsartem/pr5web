const apiKey = "8568a1cb07884aa29f04aed8cffedab5";  
const weatherApiUrl = "https://api.open-meteo.com/v1/forecast";

async function getWeather() {
    const city = document.getElementById("city").value.trim();
    const weatherResult = document.getElementById("weatherResult");
    const error = document.getElementById("error");

    weatherResult.innerHTML = "";
    error.innerHTML = "";

    if (!city) {
        error.innerHTML = "Будь ласка, введіть назву міста.";
        return;
    }

    const cachedWeather = sessionStorage.getItem(city) || localStorage.getItem(city);
    if (cachedWeather) {
        displayWeather(JSON.parse(cachedWeather));
        return;
    }

    try {

        const geoResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${apiKey}`);
        const geoData = await geoResponse.json();

        if (!geoData.results.length) {
            throw new Error("Місто не знайдено.");
        }

        const { lat, lng } = geoData.results[0].geometry;

        const weatherResponse = await fetch(`${weatherApiUrl}?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const weatherData = await weatherResponse.json();

        if (!weatherData.current_weather) {
            throw new Error("Помилка отримання погодних даних.");
        }

        const weatherInfo = {
            city,
            temperature: weatherData.current_weather.temperature,
            windSpeed: weatherData.current_weather.windspeed,
            weather: weatherData.current_weather.weathercode
        };

        sessionStorage.setItem(city, JSON.stringify(weatherInfo));
        localStorage.setItem(city, JSON.stringify(weatherInfo));

        displayWeather(weatherInfo);
    } catch (err) {
        error.innerHTML = err.message;
    }
}

function displayWeather(data) {
    document.getElementById("weatherResult").innerHTML = `
        <strong>${data.city}</strong><br>
        Температура: ${data.temperature}°C<br>
        Швидкість вітру: ${data.windSpeed} км/год<br>
        Погодні умови: ${getWeatherDescription(data.weather)}
    `;
}

function getWeatherDescription(code) {
    const weatherDescriptions = {
        0: "Ясно",
        1: "Переважно ясно",
        2: "Мінлива хмарність",
        3: "Похмуро",
        45: "Туман",
        48: "Туман з памороззю",
        51: "Легкий дощ",
        53: "Помірний дощ",
        55: "Сильний дощ",
        61: "Легкий дощ",
        63: "Помірний дощ",
        65: "Сильний дощ",
        80: "Легкий зливовий дощ",
        81: "Помірний зливовий дощ",
        82: "Сильний зливовий дощ"
    };
    return weatherDescriptions[code] || "Невідомі погодні умови";
}