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
    const [showHistory, setShowHistory] = useState(false);
    const [localTime, setLocalTime] = useState('');
    const timerRef = useRef(null);
    const [backgroundImage, setBackgroundImage] = useState('');

    const [photoOwner, setPhotoOwner] = useState('');
    const [photoDescription, setPhotoDescription] = useState('');

    const [sunrise, setSunrise] = useState('');
    const [sunset, setSunset] = useState('');

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
                const photoOwnerTemp = response.data.results[0].user.name;
                const photoDescriptionTemp = response.data.results[0].description;

                setBackgroundImage(imageUrl);
                setPhotoOwner(photoOwnerTemp);
                setPhotoDescription(photoDescriptionTemp)
            } else {
                // 没找到图片就设置为一个默认背景
                setBackgroundImage('https://images.unsplash.com/photo-1503264116251-35a269479413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGRlZmF1bHR8ZW58MHx8fHwxNjkwMDYzNDU2&ixlib=rb-4.0.3&q=80&w=1080');
            }
        } catch (error) {
            console.error('Failed to obtain city image:', error);
            setBackgroundImage('https://images.unsplash.com/photo-1503264116251-35a269479413?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDF8fGRlZmF1bHR8ZW58MHx8fHwxNjkwMDYzNDU2&ixlib=rb-4.0.3&q=80&w=1080');
        }
    };

    const getClothingAdvice = (temp) => {
        if (temp >= 28) return "The weather is hot, please wear short-sleeved shirts and shorts, and pay attention to sun protection!☀️";
        else if (temp >= 20) return "The weather is warm, so a light jacket will do!🌤️";
        else if (temp >= 10) return "The weather is cool, and a jacket is needed.🍂";
        else if (temp >= 0) return "The weather is cold, so wear a thick coat and a scarf❄️";
        else return "It’s super cold! Down jacket is a must❄️☃️";
    };

    // 处理本地时间函数
    const updateLocalTime = (timezone) => {
        const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
        const cityTime = new Date(utc + timezone * 1000);
        setLocalTime(cityTime.toLocaleString());
    };

    // 处理日出日落时间函数
    const formatUnixTime = (unixTime) => {
        const date = new Date(unixTime * 1000); // Unix 时间戳需要乘以 1000
        return date.toLocaleTimeString(); // 转换为本地时间字符串
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
                saveHistory(city); // 保存历史记录
                setHistory(getHistory()); // 更新历史记录

                // 转换 sunrise 和 sunset 时间戳
                const sunriseTime = formatUnixTime(response.data.sys.sunrise);
                const sunsetTime = formatUnixTime(response.data.sys.sunset);

                // 更新 sunrise 和 sunset 状态
                setSunrise(sunriseTime);
                setSunset(sunsetTime);
            })
            .catch((error) => {
                setWeather(null);
                setError('City weather not found, please check if the city name is correct.');
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
        {backgroundImage && (
            <div className="background" style={{backgroundImage: `url(${backgroundImage})`}}>
                <div className="image-info">
                    <p>BackgroundImageDescription:{photoDescription}</p>
                </div>
            </div>)}
        <h1 className={'h1'}>World City Weather Inquiry ⛅</h1>

        <div className="search-box">
            <input
                type="text"
                placeholder="Please enter the English name of the city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            />
            <button onClick={handleSearch}>click</button>
            {showHistory && history.length > 0 && (<ul className="history-dropdown">
                {history.map((item, index) => (<li key={index} onClick={() => {
                    setCity(item);
                    setShowHistory(false);
                }}>
                    {item}
                </li>))}
            </ul>)}
        </div>

        {error && <p className="error">{error}</p>}

        {weather && (<div className="weather-card">
            <h2>{weather.name}</h2>
            <p>Local Time : {localTime}</p>
            {weather && weather.weather && weather.weather[0] && (<img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt="weather icon"
            />)}
            <p>Current Temperature：{weather.main.temp}°C</p>
            <p>Weather Conditions：{weather.weather[0].main}</p>
            <p>Maximum Temperature: {weather.main.temp_max}°C</p>
            <p>Minimum Temperature: {weather.main.temp_min}°C</p>
            <p>Sunrise: {sunrise}</p>
            <p>Sunset: {sunset}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p className={'advice'}>Clothing Tips: {getClothingAdvice(weather.main.temp)}</p>
        </div>)}

        {history.length > 0 && (<div className="history">
            <div className="history-header">
                <h3>Historical query list</h3>
                <button onClick={clearHistory}>Clear History</button>
            </div>
            <ul>
                {history.map((item, index) => (<li key={index} onClick={() => {
                    setCity(item);
                    handleSearch();
                }}>
                    {item}
                </li>))}
            </ul>
        </div>)}

        {!weather && (<div className="project-intro">
            <h3>🌏 Introduce Myself</h3>
            <p>
                This application supports querying weather conditions around the world, and displays detailed
                information such as local time, weather icons, temperature and humidity in real time.
            </p>
            <p>
                Every time you search for a city, the background image will automatically change to the beautiful
                scenery of the city, and the search history will be saved for quick access!
            </p>
        </div>)}
    </div>);
};

export default Weather;