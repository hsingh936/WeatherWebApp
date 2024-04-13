import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaWind } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { WiHumidity } from 'react-icons/wi';
import styles from './Weather.module.css';

const Weather = ({ onUpdateCityWeather }) => {
  const { cityName } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForecast, setShowForecast] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState('metric'); 

  const fetchWeather = async (city) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=a123444f02c6636e2f63175c55149f99&units=${temperatureUnit}`
      );
      setWeatherData(weatherResponse.data);

      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=a123444f02c6636e2f63175c55149f99&units=${temperatureUnit}`
      );
      setForecastData(forecastResponse.data);

      setLoading(false);
      onUpdateCityWeather && onUpdateCityWeather(city, weatherResponse.data);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=a123444f02c6636e2f63175c55149f99&units=${temperatureUnit}`
      );
      const { name } = response.data;
      await fetchWeather(name);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByLocation(latitude, longitude);
        },
        (error) => {
          setError(error.message);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityName) {
      setLoading(true);
      fetchWeather(cityName);
    }

    return () => {
      setWeatherData(null);
      setForecastData(null);
      setLoading(true);
      setError(null);
    };
  }, [cityName, onUpdateCityWeather, temperatureUnit]);

  const toggleForecast = () => {
    setShowForecast(!showForecast);
  };

  const handleUnitChange = (unit) => {
    setTemperatureUnit(unit);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!weatherData || !forecastData) return null;

  const { weather, main, wind, sys, name } = weatherData;

  return (
    <div className={styles.content}>
      <div className={styles['weather-image']}>
        <img className={styles['mainImg']} src={`https://openweathermap.org/img/wn/${weather[0].icon}.png`} alt='' />
        <h3 className={styles.desc}>{weather[0].description}</h3>
      </div>

      <div className={styles['weather-city']}>
        <div className={styles.location}>
          <MdLocationOn style={{ fontSize: '30px' }} />
        </div>
        <p>{name},<span>{sys.country}</span></p>
      </div>

      <div className={styles['unit-dropdown']}>
        <select value={temperatureUnit} onChange={(e) => handleUnitChange(e.target.value)}>
          <option value="metric">Celsius</option>
          <option value="imperial">Fahrenheit</option>
        </select>
      </div>

      <div className={styles['weather-temp']}>
        <h2>{main.temp}<span>&deg;{temperatureUnit === 'metric' ? 'C' : 'F'}</span></h2>
        <p>Feels like: {main.feels_like}&deg;{temperatureUnit === 'metric' ? 'C' : 'F'}</p>
        <p>Min Temp: {main.temp_min}&deg;{temperatureUnit === 'metric' ? 'C' : 'F'}</p>
        <p>Max Temp: {main.temp_max}&deg;{temperatureUnit === 'metric' ? 'C' : 'F'}</p>
      </div>

      <div className={styles['weather-stats']}>
        <div className={styles.wind}>
          <div className={styles['wind-icon']}>
            <FaWind />
          </div>
          <h3 className={styles['wind-speed']}>{wind.speed}<span>Km/h</span></h3>
          <h3 className={styles['wind-heading']}>Wind Speed</h3>
        </div>
        <div className={styles.humidity}>
          <div className={styles['humidity-icon']}>
            <WiHumidity />
          </div>
          <h3 className={styles['humidity-percent']}>{main.humidity}<span>%</span></h3>
          <h3 className={styles['humidity-heading']}>Humidity</h3>
        </div>
      </div>

      <button className={styles['forecast-button']} onClick={toggleForecast}>
        {showForecast ? 'Hide Forecast' : 'Show Forecast'}
      </button>

      <button className={styles['current-location-button']} onClick={handleLocationClick}>
        Get Weather for Current Location
      </button>

      {showForecast && (
        <div className={styles.forecast}>
          <h2>Forecast</h2>
          <div className={styles['forecast-list']}>
            {forecastData.list.slice(0, 4).map((forecast, index) => (
              <div key={index} className={styles['forecast-item']}>
                <img src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`} alt='' />
                <p>Date: {forecast.dt_txt}</p>
                <p>Temperature: {forecast.main.temp}&deg;C</p>
                <p>Description: {forecast.weather[0].description}</p>
                <p>Precipitation: {forecast.pop}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
