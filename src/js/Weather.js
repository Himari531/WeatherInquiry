import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import '../css/Weather.css'; // 添加CSS文件引用

const Weather = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    const [localTime, setLocalTime] = useState('');
    const timerRef = useRef(null);
    const [backgroundImage, setBackgroundImage] = useState('');

    //OpenWeather
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=zh_cn`;

    const fetchCityImage = (cityName) => {
        const unsplashAccessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${unsplashAccessKey}&orientation=landscape`;

        axios.get(unsplashUrl)
            .then((response) => {
                if (response.data.results.length > 0) {
                    setBackgroundImage(response.data.results[0].urls.full);
                } else {
                    setBackgroundImage(''); // 如果没图，保持默认
                }
            })
            .catch(() => {
                setBackgroundImage('');
            });
    };

    const getClothingAdvice = (temp) => {
        if (temp >= 28) return "天气炎热，短袖短裤，注意防晒！☀️";
        else if (temp >= 20) return "天气温暖，薄外套就可以啦！🌤️";
        else if (temp >= 10) return "天气凉爽，需要外套了。🍂";
        else if (temp >= 0) return "天气寒冷，厚外套加围巾❄️";
        else return "超级冷！羽绒服必备❄️☃️";
    };

    const updateLocalTime = (timezone) => {
        const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const cityTime = new Date(utc + timezone * 1000);
        setLocalTime(cityTime.toLocaleString());
    };

    const handleSearch = () => {
        if (!city) return;
        axios.get(apiUrl)
            .then((response) => {
                setWeather(response.data);
                setError(null);

                const timezone = response.data.timezone;
                updateLocalTime(timezone);

                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => updateLocalTime(timezone), 1000);

                // 新增：查询城市背景图
                fetchCityImage(city);

            })
            .catch((error) => {
                setWeather(null);
                setError('找不到城市天气，请检查城市名称是否正确。');
            });
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <div className="app">
            {backgroundImage && (
                <div
                    className="background"
                    style={{backgroundImage: `url(${backgroundImage})`}}
                ></div>
            )}
            <h1>Weather Inquiry ⛅</h1>
            <div className="search-box">
                <input
                    type="text"
                    placeholder="Please enter the name of the city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                />
                <button onClick={handleSearch}>click</button>
            </div>

            {error && <p className="error">{error}</p>}

            {weather && (
                <div className="weather-card">
                    <div className="top-row">
                        <h2>{weather.name}</h2>
                    </div>
                    <p>local time:{localTime}</p>
                    <img
                        className="weather-icon"
                        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                        alt="weather icon"
                    />
                    <p className="temp">{weather.main.temp}°C</p>
                    <p className="description">{weather.weather[0].description}</p>
                    <div className="details">
                        <p>最低温度: {weather.main.temp_min}°C</p>
                        <p>最高温度: {weather.main.temp_max}°C</p>
                        <p>湿度: {weather.main.humidity}%</p>
                        <p>穿衣建议: {getClothingAdvice(weather.main.temp)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Weather;