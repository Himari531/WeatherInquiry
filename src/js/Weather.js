import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import '../css/Weather.css';
import {getHistory, saveHistory, clearHistory} from './HistoricalQueryRecords';

const Weather = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState(null);
    const [error, setError] = useState(null);
    //历史地点搜索记录
    const [history, setHistory] = useState([]);
    const [localTime, setLocalTime] = useState('');
    const timerRef = useRef(null);
    const [backgroundImage, setBackgroundImage] = useState('');

    //OpenWeather
    const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=zh_cn`;

    const fetchCityImage = async (cityName) => {
        try {
            const unsplashAccessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
            const unsplashUrl = `https://api.unsplash.com/search/photos?query=${cityName}&client_id=${unsplashAccessKey}&orientation=landscape`;

            const response = await axios.get(unsplashUrl);

            if (response.data.results && response.data.results.length > 0) {
                // 用 regular，适中大小，加载快
                const imageUrl = response.data.results[0].urls.regular;
                setBackgroundImage(imageUrl);
            } else {
                // 没找到图片就设置为一个默认背景
                setBackgroundImage('https://images.unsplash.com/photo-1503264116251-35a269479413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGRlZmF1bHR8ZW58MHx8fHwxNjkwMDYzNDU2&ixlib=rb-4.0.3&q=80&w=1080');
            }
        } catch (error) {
            console.error('获取城市图片失败:', error);
            setBackgroundImage('https://images.unsplash.com/photo-1503264116251-35a269479413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGRlZmF1bHR8ZW58MHx8fHwxNjkwMDYzNDU2&ixlib=rb-4.0.3&q=80&w=1080');
        }
    };

    const getClothingAdvice = (temp) => {
        if (temp >= 28) return "天气炎热，短袖短裤，注意防晒！☀️"; else if (temp >= 20) return "天气温暖，薄外套就可以啦！🌤️"; else if (temp >= 10) return "天气凉爽，需要外套了。🍂"; else if (temp >= 0) return "天气寒冷，厚外套加围巾❄️"; else return "超级冷！羽绒服必备❄️☃️";
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
                saveHistory(city);
                setHistory(getHistory());

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

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    return (<div className="app">
        {backgroundImage && (<div
            className="background"
            style={{backgroundImage: `url(${backgroundImage})`}}
        ></div>)}
        <h1>World Weather Inquiry ⛅</h1>
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

        {weather && (<div className="weather-card">
            <h2>{weather.name}</h2>
            <p>local time : {localTime}</p>
            {weather && weather.weather && weather.weather[0] && (<img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather icon"
            />)}
            <p>{weather.main.temp}°C</p>
            <p>{weather.weather[0].description}</p>
            <p>最低温度: {weather.main.temp_min}°C</p>
            <p>最高温度: {weather.main.temp_max}°C</p>
            <p>湿度: {weather.main.humidity}%</p>
            <p>穿衣建议: {getClothingAdvice(weather.main.temp)}</p>
        </div>)}

        {history.length > 0 && (<div className="history">
            <h3>历史查询</h3>
            <ul>
                {history.map((item, index) => (<li key={index} onClick={() => {
                    setCity(item);
                    handleSearch();
                }}>
                    {item}
                </li>))}
            </ul>
        </div>)}
    </div>);
};

export default Weather;