import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import styles from './City.module.css';

const City = () => {
    const [cities, setCities] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCities, setFilteredCities] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    'https://secure.geonames.org/citiesJSON?north=90&south=-90&east=180&west=-180&lang=en&maxRows=85&username=harshsingh'
                );
                const sortedCities = response.data.geonames.sort((a, b) => a.name.localeCompare(b.name));
                setCities(sortedCities);
            } catch (error) {
                console.error('Error fetching city data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchWeatherForCity = async (cityName) => {
            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=a123444f02c6636e2f63175c55149f99&units=metric`
                );
                return response.data.main;
            } catch (error) {
                console.error('Error fetching weather data for city:', cityName, error);
                return null;
            }
        };

        const updateCitiesWithWeather = async () => {
            const updatedCities = await Promise.all(
                cities.map(async (city) => {
                    const weatherData = await fetchWeatherForCity(city.name);
                    return { ...city, weather: weatherData };
                })
            );
            setFilteredCities(updatedCities);
        };

        updateCitiesWithWeather();
    }, [cities]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.header}>Weather Web App</h2>
            <input
                type="text"
                placeholder="Search City"
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchBar}
            />
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>City Name</th>
                        <th>Country Code</th>
                        <th>Population</th>
                        <th>Longitude</th>
                        <th>Latitude</th>
                        <th>Day High</th>
                        <th>Day Low</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCities.map((city) => (
                        <tr key={city.geonameId}>
                            <td>
                                <Link to={`/weather/${city.name}`} className={styles.link}>
                                    {city.name}
                                </Link>
                            </td>
                            <td>{city.countrycode}</td>
                            <td>{city.population}</td>
                            <td>{city.lng}</td>
                            <td>{city.lat}</td>
                            <td>{city.weather && city.weather.temp_max}&deg;C</td>
                            <td>{city.weather && city.weather.temp_min}&deg;C</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default City;
