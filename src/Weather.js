// Weather.js
import React, {useState} from 'react';
import axios from 'axios';

const Weather = () => {
    const [city, setCity] = useState(''); // 用户输入的城市
    const [weather, setWeather] = useState(null); // 存储天气信息
    const [error, setError] = useState(null); // 错误信息

    const apiKey = '你的API密钥'; // 替换为你自己的API密钥
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=zh_cn`; // 你可以根据需要选择不同的API参数

    const handleSearch = () => {
        axios
            .get(apiUrl)
            .then((response) => {
                setWeather(response.data); // 成功获取数据，更新weather状态
                setError(null); // 清除之前的错误
            })
            .catch((error) => {
                setWeather(null); // 清除天气数据
                setError('无法找到该城市的天气数据。请检查城市名是否正确。'); // 设置错误信息
            });
    };

    return (<div>
        <h1>天气查询</h1>
        <input
            type="text"
            placeholder="输入城市名称"
            value={city}
            onChange={(e) => setCity(e.target.value)} // 设置城市名
        />
        <button onClick={handleSearch}>查询</button>

        {error && <p>{error}</p>} {/* 如果有错误，显示错误信息 */}

        {weather && (<div>
            <h2>{weather.name}</h2>
            <p>温度: {weather.main.temp}°C</p>
            <p>天气: {weather.weather[0].description}</p>
            <p>湿度: {weather.main.humidity}%</p>
        </div>)}
    </div>);
};

export default Weather;
