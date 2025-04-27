const HISTORY_KEY = 'weather_search_history';

// 读取历史记录
export const getHistory = () => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
};

// 保存新的历史记录
export const saveHistory = (city) => {
    let history = getHistory();
    history = [city, ...history.filter(item => item !== city)];
    history = history.slice(0, 5); // 最多保存5条
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

// 清空历史记录
export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};