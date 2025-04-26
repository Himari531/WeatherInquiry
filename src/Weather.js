import React, {useState} from 'react';
import axios from 'axios';

const Weather = () => {
    const [city, setCity] = useState(''); // 用户输入的城市
    const [weather, setWeather] = useState(null); // 存储天气信息
    const [error, setError] = useState(null); // 错误信息

    const apiKey = process.env.REACT_APP_WEATHER_API_KEY; // 替换为你自己的API密钥
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=zh_cn`; // 你可以根据需要选择不同的API参数

    const getLocalTime = (timezone) => {
        const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const localTime = new Date(utc + timezone * 1000);
        return localTime.toLocaleString(); // 格式化成当地的时间字符串
    };

    // 根据天气变换背景
    const getBackgroundClass = (weatherMain) => {
        switch (weatherMain) {
            case 'Clear':
                return 'clear';
            case 'Rain':
                return 'rain';
            case 'Clouds':
                return 'clouds';
            case 'Snow':
                return 'snow';
            case 'Thunderstorm':
                return 'thunderstorm';
            default:
                return 'default';
        }
    };

    const handleSearch = () => {
        axios
            .get(apiUrl)
            .then((response) => {
                setWeather(response.data); // 成功获取数据，更新weather状态
                setError(null); // 清除之前的错误
            })
            .catch((error) => {
                setWeather(null); // 清除天气数据
                setError('The weather data of the city cannot be found. Please check whether the name of the city is correct.'); // 设置错误信息
            });
    };

    // 穿衣建议函数
    const getClothingAdvice = (temp) => {
        if (temp >= 28) {
            return "天气炎热，建议穿短袖、短裤，注意防晒！☀️";
        } else if (temp >= 20) {
            return "天气温暖，建议穿薄外套、长裤。🌤️";
        } else if (temp >= 10) {
            return "天气凉爽，建议穿针织衫或薄外套。🍂";
        } else if (temp >= 0) {
            return "天气寒冷，建议穿厚外套、戴围巾。❄️";
        } else {
            return "非常寒冷，羽绒服必备，注意保暖！☃️";
        }
    };


    return (<div>
        <h1>Weather Inquiry ☀️</h1>
        <input
            type="text"
            placeholder="Please enter the name of the city"
            value={city}
            onChange={(e) => setCity(e.target.value)} // 设置城市名
        />
        <button onClick={handleSearch}>inquire</button>

        {error && <p>{error}</p>} {/* 如果有错误，显示错误信息 */}

        {weather && (
            <div className={`weather-info ${getBackgroundClass(weather.weather[0].main)}`}>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <h2>{weather.name}</h2>
                    <p>local time: {getLocalTime(weather.timezone)}</p>
                </div>
                <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                    alt="weather icon"
                />
                <p className="temp">{weather.main.temp}°C</p>
                <p>{weather.weather[0].description}</p>
                <div className="details">
                    <p>Min Temp: {weather.main.temp_min}°C</p>
                    <p>Max Temp: {weather.main.temp_max}°C</p>
                </div>
                <p>天気: {weather.weather[0].description}</p>
                <p>湿度: {weather.main.humidity}%</p>
                <p>穿衣建议: {getClothingAdvice(weather.main.temp)}</p>
            </div>)
        }
    </div>);
};

export default Weather;
