"use client";

import React, { useState, useEffect, useRef } from 'react';

// Define the CSS keyframes for the fade-in animation
const fadeInAnimation = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
`;


// Helper function to get weather description from WMO code
const getWeatherDescription = (code) => {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mostly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Drizzle: Light',
        53: 'Drizzle: Moderate',
        55: 'Drizzle: Dense',
        56: 'Freezing Drizzle: Light',
        57: 'Freezing Drizzle: Dense',
        61: 'Rain: Light',
        63: 'Rain: Moderate',
        65: 'Rain: Heavy',
        66: 'Freezing Rain: Light',
        67: 'Freezing Rain: Heavy',
        71: 'Snow fall: Light',
        73: 'Snow fall: Moderate',
        75: 'Snow fall: Heavy',
        77: 'Snow grains',
        80: 'Rain showers: Light',
        81: 'Rain showers: Moderate',
        82: 'Rain showers: Violent',
        85: 'Snow showers: Light',
        86: 'Snow showers: Heavy',
        95: 'Thunderstorm: Slight or moderate',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return descriptions[code] || 'Unknown weather';
};

// Helper function to get a simple weather icon based on WMO code
const getWeatherIcon = (code) => {
    if (code === 0) return '☀️'; // Clear sky
    if (code >= 1 && code <= 3) return '☁️'; // Cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 57) return '🌧️'; // Drizzle
    if (code >= 61 && code <= 67) return '🌧️'; // Rain
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code >= 80 && code <= 82) return '🌦️'; // Rain showers
    if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
    if (code >= 95) return '⛈️'; // Thunderstorm
    return '❓'; // Unknown
};

// Helper function to get clothing icons (using emojis for simplicity and compatibility)
const getClothingIcon = (item) => {
    if (item.includes('Coat') || item.includes('Parka')) return '🧥';
    if (item.includes('Jacket') || item.includes('Windbreaker') || item.includes('Rain Gear') || item.includes('Outer Layer') || item.includes('Cardigan') || item.includes('Blazer')) return '🧥'; // Using same icon for jacket/windbreaker/rain gear/layers
    if (item.includes('Hat') && !item.includes('Sun') && !item.includes('Winter') && !item.includes('Headwear')) return '🧢'; // Baseball cap for general hat
    if (item.includes('Beanie') || item.includes('Winter Hat') || item.includes('Headwear')) return ' ニット帽'; // Beanie icon
    if (item.includes('Gloves') || item.includes('Handwear') || item.includes('Mittens')) return '🧤';
    if (item.includes('Scarf') || item.includes('Balaclava') || item.includes('Neck/Face')) return '🧣';
    if (item.includes('Umbrella')) return '☂️';
    if (item.includes('Boots') || (item.includes('Footwear') && item.includes('Waterproof'))) return '👢';
    if (item.includes('Shoes') || item.includes('Sneakers') || item.includes('Walking Shoes') || item.includes('Running Shoes') || item.includes('Footwear')) return '👟';
    if (item.includes('Sandals')) return '🩴';
    if (item.includes('Sunscreen')) return '🧴';
    if (item.includes('Sunglasses')) return '🕶️';
    if (item.includes('Sun Hat')) return '👒'; // Sun hat icon
    if (item.includes('Water Bottle') || item.includes('Hydration')) return '💧';
    if (item.includes('Thermal Base Layers') || item.includes('Long Underwear') || item.includes('Base Layer') || item.includes('Long Sleeve')) return '👚'; // Long sleeve shirt icon for thermal/base layer
    if (item.includes('Moisture-wicking T-shirt') || item.includes('Gym Shirt') || item.includes('T-shirt') || item.includes('Top')) return '👕';
    if (item.includes('Athletic Shorts') || item.includes('Gym Shorts') || item.includes('Shorts')) return ' shorts'; // Shorts for athletic/gym
    if (item.includes('Athletic Pants') || item.includes('Leggings') || item.includes('Gym Pants') || item.includes('Pants') || item.includes('Bottoms')) return '👖'; // Pants icon
    if (item.includes('Socks') || item.includes('Wool Socks') || item.includes('Athletic Socks')) return '🧦';
    if (item.includes('Lightweight Clothing')) return '👕'; // Using T-shirt for lightweight
    if (item.includes('Layers') || item.includes('Everyday Wear') || item.includes('Mid Layer')) return '👕'; // Default shirt for general clothing/layers
    if (item.includes('Minimal, Breathable Clothing')) return '👚'; // Tank top icon for minimal clothing
    if (item.includes('Commute')) return '🚶'; // Walking person for commute
    return '✨'; // Default icon
};


// Function to determine outfit suggestions (More detailed and useful suggestions)
const getOutfitSuggestions = (weather, outdoorDurationHours, activity) => {
    const suggestions = [];
    const tempC = weather.temperature_2m;
    const feelsLikeC = weather.apparent_temperature;
    const windSpeedKmh = weather.wind_speed_10m;
    const precipitation = weather.precipitation; // mm
    const uvIndex = weather.uv_index;
    const weatherCode = weather.weather_code;

    // Helper to add suggestion if not already present
    const addSuggestion = (item, reason) => {
        if (!suggestions.some(s => s.item === item)) {
            suggestions.push({ item, reason });
        }
    };

    // --- Base Layer & Main Outfit Suggestions based on Temperature and Activity ---
    if (activity === 'Running' || activity === 'Hiking' || activity === 'Walk') {
        const isIntenseActivity = activity === 'Running' || activity === 'Hiking';

        if (feelsLikeC < -15) {
             addSuggestion('Extreme Cold Base Layers', `Extreme Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated Mid Layer', `Extreme Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Heavy Insulated & Windproof Jacket', `Extreme Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated Hat & Mittens', `Extreme Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Thick Wool Socks', `Extreme Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated & Waterproof Footwear', `Extreme Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
        } else if (feelsLikeC >= -15 && feelsLikeC < -5) {
            addSuggestion('Heavyweight Thermal Base Layers', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Warm Fleece or Insulated Vest', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Insulated Jacket', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Warm Hat & Gloves', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Wool Socks', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated Footwear', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
        } else if (feelsLikeC >= -5 && feelsLikeC < 5) {
            addSuggestion('Midweight Thermal Base Layers', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Moisture-wicking Long Sleeve Shirt', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Lightweight Jacket or Windbreaker', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            if (feelsLikeC < 0) addSuggestion('Light Hat & Gloves', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Athletic Socks', `For ${activity}`);
             addSuggestion('Appropriate Footwear', `For ${activity}`);
        } else if (feelsLikeC >= 5 && feelsLikeC < 15) {
             addSuggestion('Moisture-wicking Long Sleeve Shirt or T-shirt', `Cool: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Light Jacket or Windbreaker (if windy/rain)', `Cool: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Athletic Socks', `For ${activity}`);
             addSuggestion('Appropriate Footwear', `For ${activity}`);
        } else if (feelsLikeC >= 15 && feelsLikeC < 22) {
             addSuggestion('Moisture-wicking T-shirt or Tank Top', `Mild: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Athletic Shorts or Pants', `For ${activity}`);
             addSuggestion('Athletic Socks', `For ${activity}`);
             addSuggestion('Appropriate Footwear', `For ${activity}`);
        }
         else { // feelsLikeC >= 22
             addSuggestion('Lightweight & Breathable Athletic Wear', `Warm: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Athletic Shorts', `For ${activity}`);
             addSuggestion('Athletic Socks', `For ${activity}`);
             addSuggestion('Appropriate Footwear', `For ${activity}`);
        }


    } else if (activity === 'Gym') {
        addSuggestion('Gym Top (T-shirt or Tank)', `For ${activity}`);
        addSuggestion('Gym Bottoms (Shorts or Pants)', `For ${activity}`);
        addSuggestion('Athletic Socks', `For ${activity}`);
        addSuggestion('Gym Sneakers', `For ${activity}`);


        // Suggest outer layer for commute if needed
        if (feelsLikeC < 10 && outdoorDurationHours > 0.1) {
             addSuggestion('Light Layer (for commute)', `Commute weather: Feels like ${feelsLikeC.toFixed(1)}°C`);
        } else if (feelsLikeC < 0 && outdoorDurationHours > 0.1) {
             addSuggestion('Warm Outer Layer (for commute)', `Commute weather: Feels like ${feelsLikeC.toFixed(1)}°C` );
        }

    } else if (activity === 'Office') {
         if (feelsLikeC < -5) {
            addSuggestion('Heavy Winter Coat (Formal)', `Very Cold Commute: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Warm Scarf & Gloves', `Very Cold Commute: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated Formal Footwear', `Very Cold Commute`);
             addSuggestion('Warm Socks', `Very Cold Commute`);
        } else if (feelsLikeC >= -5 && feelsLikeC < 5) {
            addSuggestion('Medium Weight Coat (Formal)', `Cold Commute: Feels like ${feelsLikeC.toFixed(1)}°C`);
            if (feelsLikeC < 0) addSuggestion('Scarf & Gloves', `Cold Commute: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Warmer Formal Footwear', `Cold Commute`);
             addSuggestion('Socks', `Cold Commute`);
        } else if (feelsLikeC >= 5 && feelsLikeC < 15) {
            addSuggestion('Light Jacket or Blazer', `Cool Commute: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Formal Footwear', 'For Office');
        } else if (feelsLikeC >= 15 && tempC < 25) {
             if (outdoorDurationHours > 0.25) {
                 addSuggestion('Light Layer (for commute)', `For commute`);
             }
             addSuggestion('Formal Footwear', 'For Office');
        } else { // tempC >= 25
             addSuggestion('Formal Attire', 'For Office');
             addSuggestion('Formal Footwear', 'For Office');
        }
         // Assume office attire indoors, focus on commute suggestions

    }
     else { // Casual Outing or Other
        if (feelsLikeC < -5) {
             addSuggestion('Extreme Cold Winter Coat', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated Hat, Scarf & Gloves', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated & Waterproof Boots', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Thick Wool Socks', `Very Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
        } else if (feelsLikeC >= -5 && feelsLikeC < 5) {
            addSuggestion('Heavy Winter Coat', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Warm Hat & Gloves', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Scarf', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Insulated Boots', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Wool Socks', `Cold: Feels like ${feelsLikeC.toFixed(1)}°C`);
        } else if (feelsLikeC >= 5 && feelsLikeC < 10) {
            addSuggestion('Medium Weight Jacket or Fleece', `Cool: Feels like ${feelsLikeC.toFixed(1)}°C`);
            addSuggestion('Light Scarf or Beanie', `Cool: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Comfortable Walking Shoes', `For ${outdoorDurationHours}h outdoors`);
             addSuggestion('Socks', 'With footwear');
        } else if (feelsLikeC >= 10 && feelsLikeC < 18) {
            addSuggestion('Light Jacket or Cardigan', `Mild: Feels like ${feelsLikeC.toFixed(1)}°C`);
             addSuggestion('Comfortable Walking Shoes', `For ${outdoorDurationHours}h outdoors`);
             addSuggestion('Socks', 'With footwear');
        } else if (tempC >= 18 && tempC < 25) {
            addSuggestion('Light Layers (Top & Bottom)', `Pleasant: Temperature ${tempC.toFixed(1)}°C`);
             addSuggestion('Comfortable Everyday Footwear', 'Pleasant weather');
        } else if (tempC >= 25 && tempC < 30) {
            addSuggestion('Lightweight & Breathable Clothing', `Warm: Temperature ${tempC.toFixed(1)}°C`);
             addSuggestion('Breathable Casual Footwear', `Warm weather`);
        } else if (tempC >= 30) {
             addSuggestion('Minimal, Breathable Clothing', `Hot: Temperature ${tempC.toFixed(1)}°C`);
             addSuggestion('Sandals or Open Footwear', `Hot weather`);
        }
         // Ensure a suggestion is always added for Casual in moderate temps if no specific item is suggested yet
         if (activity === 'Casual' && suggestions.length === 0) {
             addSuggestion('Comfortable Everyday Wear', 'General conditions');
             addSuggestion('Comfortable Everyday Footwear', 'General conditions');
         }
    }


    // --- Add suggestions based on other factors (Wind, Precipitation, UV) ---

    if (precipitation > 1) {
        if (tempC > 0) {
            addSuggestion('Waterproof Outer Layer', `Heavy Rain: ${precipitation.toFixed(1)} mm`);
            if (activity !== 'Running' && activity !== 'Hiking') addSuggestion('Umbrella', `Heavy Rain: ${precipitation.toFixed(1)} mm`);
             // Check if footwear suggestion is already waterproof, if not suggest waterproof
             if (!suggestions.some(s => s.item.includes('Waterproof') && s.item.includes('Footwear'))) {
                 addSuggestion('Waterproof Footwear', `Heavy Rain expected`);
             }
        } else {
            addSuggestion('Waterproof Insulated Outer Layer', `Heavy Snow/Ice expected`);
            addSuggestion('Waterproof Insulated Footwear', `Heavy Snow/Ice expected`);
             addSuggestion('Thick Gloves', `Heavy Snow/Ice expected`);
             addSuggestion('Warm Hat', `Heavy Snow/Ice expected`);
        }
    } else if (precipitation > 0.1) {
         if (tempC > 0) {
            addSuggestion('Water-resistant Jacket', `Light Rain: ${precipitation.toFixed(1)} mm`);
            if (outdoorDurationHours > 0.5 && activity !== 'Running' && activity !== 'Hiking') addSuggestion('Umbrella (Optional)', `Light Rain & ${outdoorDurationHours}h outdoors`);
             // Check if footwear suggestion is already water-resistant/proof, if not suggest water-resistant
              if (!suggestions.some(s => (s.item.includes('Waterproof') || s.item.includes('Water-resistant')) && s.item.includes('Footwear'))) {
                 addSuggestion('Water-resistant Footwear', `Light Rain expected`);
             }
         } else {
             addSuggestion('Water-resistant Winter Coat', `Light Snow expected`);
             addSuggestion('Water-resistant Boots', `Light Snow expected`);
         }
    }


    if (windSpeedKmh > 20) { // Slightly lower threshold for wind consideration
        if (!suggestions.some(s => s.item.includes('Coat') || s.item.includes('Jacket') || s.item.includes('Outer Layer') || s.item.includes('Windproof'))) {
             addSuggestion('Windproof Jacket or Layer', `Wind speed: ${windSpeedKmh.toFixed(1)} km/h`);
        }
        if (windSpeedKmh > 35) { // Higher threshold for extra protection
             addSuggestion('Extra Wind Protection (Neck/Face)', `Strong winds: ${windSpeedKmh.toFixed(1)} km/h`);
             if (feelsLikeC < 10) addSuggestion('Windproof Gloves', `Strong winds: ${feelsLikeC.toFixed(1)}°C`);
        }
    }

    // --- Duration and UV Sensitivity ---
    if (uvIndex > 3 && outdoorDurationHours > 0.25) {
        addSuggestion('Sunscreen', `UV Index: ${uvIndex.toFixed(1)} & ${outdoorDurationHours}h outdoors`);
        if (!suggestions.some(s => s.item.includes('Hat') && s.item.includes('Sun'))) addSuggestion('Sun Hat or Cap', `UV Index: ${uvIndex.toFixed(1)} & ${outdoorDurationHours}h outdoors`);
        addSuggestion('Sunglasses', `UV Index: ${uvIndex.toFixed(1)} & ${outdoorDurationHours}h outdoors`);
    }

     // Consider duration for extra layers or hydration
    if (outdoorDurationHours > 2) { // Increased duration threshold for extra layers
        if (feelsLikeC < 18 && !suggestions.some(s => s.item.includes('Thermal')) && activity !== 'Gym') {
             addSuggestion('Consider Extra Layers', `Extended time outdoors in cooler weather`);
        }
    }
     if (outdoorDurationHours > 1 || tempC > 25 || activity === 'Running' || activity === 'Hiking') { // Suggest water for longer durations, heat, or active pursuits
         addSuggestion('Water Bottle', `Stay hydrated during ${activity || 'time'} outdoors`);
     }


    // Remove potential duplicates and refine
    const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.item)))
        .map(item => suggestions.find(s => s.item === item));


    // Ensure a base suggestion if list is empty (should be less likely with detailed logic)
     if (uniqueSuggestions.length === 0) {
         uniqueSuggestions.push({ item: 'Comfortable Everyday Wear', reason: 'General conditions' });
         uniqueSuggestions.push({ item: 'Comfortable Everyday Footwear', reason: 'General conditions' });
     }


    return uniqueSuggestions;
};


// Main App Component
export default function App() {
    const [location, setLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [forecastData, setForecastData] = useState(null); // State for forecast data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [outdoorDuration, setOutdoorDuration] = useState(1); // Duration in hours, default 1 hour
    const [activity, setActivity] = useState('Casual'); // Default activity
    const [currentOutfitSuggestions, setCurrentOutfitSuggestions] = useState([]); // Suggestions for current weather
    const [tomorrowOutfitSuggestions, setTomorrowOutfitSuggestions] = useState([]); // Suggestions for tomorrow
    const [placeName, setPlaceName] = useState('Your Location');
    const [isDarkMode, setIsDarkMode] = useState(false);

     // Refs for the chart containers to get their width for responsiveness
    const todayChartContainerRef = useRef(null);
    const tomorrowChartContainerRef = useRef(null);
    const [todayChartWidth, setTodayChartWidth] = useState(0);
    const [tomorrowChartWidth, setTomorrowChartWidth] = useState(0);


    // Inject the animation keyframes into the head
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = fadeInAnimation;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

     // Effect to update chart widths using ResizeObserver with a delay
     useEffect(() => {
         const updateWidths = () => {
              if (todayChartContainerRef.current) {
                  console.log('Today Chart Container Width:', todayChartContainerRef.current.offsetWidth);
                  setTodayChartWidth(todayChartContainerRef.current.offsetWidth);
              } else {
                  console.log('Today Chart Container Ref not available');
              }
              if (tomorrowChartContainerRef.current) {
                  console.log('Tomorrow Chart Container Width:', tomorrowChartContainerRef.current.offsetWidth);
                  setTomorrowChartWidth(tomorrowChartContainerRef.current.offsetWidth);
              } else {
                   console.log('Tomorrow Chart Container Ref not available');
              }
         };

         const todayObserver = new ResizeObserver(updateWidths);
         const tomorrowObserver = new ResizeObserver(updateWidths);


         // Add a small delay before observing to allow DOM to settle
         const timeoutId = setTimeout(() => {
             if (todayChartContainerRef.current) {
                 todayObserver.observe(todayChartContainerRef.current);
             }
             if (tomorrowChartContainerRef.current) {
                 tomorrowObserver.observe(tomorrowChartContainerRef.current);
             }
              // Also run updateWidths once after the delay in case no resize event occurs
             updateWidths();
         }, 200); // Increased delay slightly

         // Initial check in case elements are immediately available
         updateWidths();


         return () => {
             clearTimeout(timeoutId); // Clean up the timeout
             todayObserver.disconnect();
             tomorrowObserver.disconnect();
         };
     }, [forecastData]); // Depend on forecastData


    // Get user's location
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                setError(`Geolocation Error: ${err.message}`);
                setLoading(false);
            }
        );
    }, []);

    // Fetch weather and forecast data when location changes
    useEffect(() => {
        if (location) {
            const fetchWeather = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Open-Meteo API endpoint (no key required)
                    // Requesting current and hourly data for the next 48 hours
                    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,is_day&hourly=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index,is_day&forecast_days=2`; // Added hourly and forecast_days=2
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setWeatherData(data.current);
                    setForecastData(data.hourly); // Store hourly forecast data

                    // Attempt to reverse geocode for a place name (using Nominatim)
                    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=10`;
                    const nominatimResponse = await fetch(nominatimUrl);
                    if (nominatimResponse.ok) {
                        const nominatimData = await nominatimResponse.json();
                        if (nominatimData.address) {
                            // Try to get a city or town name
                            setPlaceName(nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || 'Your Location');
                        }
                    }


                } catch (err) {
                    setError(`Failed to fetch weather data: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            };

            fetchWeather();
        }
    }, [location]);

    // Update outfit suggestions when weather data, duration, or activity changes
    useEffect(() => {
        if (weatherData) {
            const suggestions = getOutfitSuggestions(weatherData, outdoorDuration, activity);
            setCurrentOutfitSuggestions(suggestions);
        }
    }, [weatherData, outdoorDuration, activity]); // Dependency array includes outdoorDuration and activity

     // Update tomorrow's outfit suggestions when forecast data or activity changes
     useEffect(() => {
         if (forecastData) {
             // Find the data for tomorrow (starting from the next full hour after now)
             const now = new Date();
             const tomorrowData = forecastData.time.reduce((acc, time, index) => {
                 const date = new Date(time);
                 // Check if the date is tomorrow and the hour is in the future relative to now
                 if (date.getDate() === now.getDate() + 1) {
                     acc.push({
                         time: date,
                         temperature_2m: forecastData.temperature_2m[index],
                         apparent_temperature: forecastData.apparent_temperature[index],
                         precipitation: forecastData.precipitation[index],
                         weather_code: forecastData.weather_code[index],
                         wind_speed_10m: forecastData.wind_speed_10m[index],
                         uv_index: forecastData.uv_index[index],
                         is_day: forecastData.is_day[index],
                     });
                 }
                 return acc;
             }, []);

             // For tomorrow's suggestion, use conditions around midday as representative
             const middayHour = 12; // Assuming midday is a good representative time
             const tomorrowMiddayData = tomorrowData.find(d => d.time.getHours() === middayHour);

             if (tomorrowMiddayData) {
                  // Generate suggestions for tomorrow based on midday conditions (assuming a full day outdoors for simplicity)
                  const suggestions = getOutfitSuggestions(tomorrowMiddayData, 8, activity); // Assume 8 hours outdoors for tomorrow's general suggestion
                  setTomorrowOutfitSuggestions(suggestions);
             } else {
                 // Fallback to average if midday data is not available (e.g., if forecast doesn't align perfectly)
                 const tomorrowAvgTemp = tomorrowData.reduce((sum, hour) => sum + hour.temperature_2m, 0) / tomorrowData.length;
                  const weatherCodeCounts = tomorrowData.reduce((counts, hour) => {
                      counts[hour.weather_code] = (counts[hour.weather_code] || 0) + 1;
                      return counts;
                  }, {});
                  const dominantWeatherCode = Object.keys(weatherCodeCounts).reduce((a, b) => weatherCodeCounts[a] > weatherCodeCounts[b] ? a : b, null);

                  const tomorrowRepresentativeWeather = {
                      temperature_2m: tomorrowAvgTemp,
                      apparent_temperature: tomorrowAvgTemp,
                      precipitation: tomorrowData.reduce((sum, hour) => sum + hour.precipitation, 0) > 0 ? 1 : 0,
                      weather_code: parseInt(dominantWeatherCode, 10),
                      wind_speed_10m: tomorrowData.reduce((max, hour) => Math.max(max, hour.wind_speed_10m), 0),
                      uv_index: tomorrowData.reduce((max, hour) => Math.max(max, hour.uv_index), 0),
                  };

                  const suggestions = getOutfitSuggestions(tomorrowRepresentativeWeather, 8, activity);
                  setTomorrowOutfitSuggestions(suggestions);

             }
         }
     }, [forecastData, activity]); // Dependency array includes forecastData and activity

    // Effect to set dark mode based on system preference initially
    useEffect(() => {
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDarkMode);
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Dynamic background based on weather code and time (simplified)
    const getBackgroundClass = () => {
        if (!weatherData) return 'bg-gradient-to-b from-blue-400 to-blue-200'; // Default clear sky
        const weatherCode = weatherData.weather_code;
        const isDay = weatherData.is_day === 1; // Use is_day from API if available

        if (!isDay) return 'bg-gradient-to-b from-gray-800 to-gray-600 text-white'; // Night

        // Day time backgrounds
        if (weatherCode === 0) return 'bg-gradient-to-b from-blue-400 to-blue-200'; // Clear sky
        if (weatherCode >= 1 && weatherCode <= 3) return 'bg-gradient-to-b from-gray-300 to-gray-100'; // Cloudy
        if (weatherCode >= 45 && weatherCode <= 48) return 'bg-gradient-to-b from-gray-400 to-gray-300'; // Foggy
        if (weatherCode >= 51 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82) return 'bg-gradient-to-b from-blue-600 to-blue-400'; // Rainy
        if (weatherCode >= 71 && weatherCode <= 77 || weatherCode >= 85 && weatherCode <= 86) return 'bg-gradient-to-b from-gray-500 to-gray-300'; // Snowy
        if (weatherCode >= 95) return 'bg-gradient-to-b from-purple-600 to-purple-400'; // Thunderstorm

        return 'bg-gradient-to-b from-blue-400 to-blue-200'; // Default
    };

     // Function to render a basic SVG line chart for temperature
     const renderTemperatureChart = (hourlyData, chartWidth, title) => {
         console.log(`Rendering chart "${title}" with width: ${chartWidth}`); // Log chart width
         if (!hourlyData || hourlyData.length <= 1 || !chartWidth || chartWidth <= 0) { // Ensure valid data and width
             console.log(`Chart "${title}" not rendering: Invalid data, insufficient points, or zero width.`);
             return null;
         }

         const temperatures = hourlyData.map(d => d.temperature);
         const minTemp = Math.min(...temperatures);
         const maxTemp = Math.max(...temperatures);

         const padding = 30; // Increased padding for labels
         const svgHeight = 180; // Increased height for better chart
         const chartHeight = svgHeight - 2 * padding;
         const chartInnerWidth = chartWidth - 2 * padding;

         // Handle case where min and max temperatures are the same
         const isConstantTemp = minTemp === maxTemp;
         const yValue = isConstantTemp ? chartHeight / 2 + padding : 0; // Use a fixed y if temp is constant

         // Create points for the line chart
         const points = hourlyData.map((d, index) => {
             const x = (index / (hourlyData.length - 1)) * chartInnerWidth + padding;
             // Scale temperature to fit chart height (invert y-axis for SVG)
             const y = isConstantTemp ? yValue : chartHeight - ((d.temperature - minTemp) / (maxTemp - minTemp)) * chartHeight + padding;
             return `${x},${y}`;
         }).join(' ');

         // Create points for the area under the line
         const areaPoints = `${padding},${svgHeight - padding} ${points} ${chartInnerWidth + padding},${svgHeight - padding}`;


         // Generate X-axis labels (every 4 hours)
         const xLabels = hourlyData.filter((_, index) => index % 4 === 0);

         // Generate Y-axis temperature markers (e.g., min, max, and a couple in between)
          const tempMarkers = isConstantTemp ? [minTemp] : [minTemp, maxTemp]; // Only show one marker if temp is constant
          if (!isConstantTemp && maxTemp - minTemp > 5) { // Add intermediate markers if range is large enough and not constant
              tempMarkers.push(minTemp + (maxTemp - minTemp) / 3);
              tempMarkers.push(minTemp + 2 * (maxTemp - minTemp) / 3);
          }
          const yMarkers = tempMarkers.map(temp => ({
              temp: temp,
              y: isConstantTemp ? yValue : chartHeight - ((temp - minTemp) / (maxTemp - minTemp)) * chartHeight + padding
          }));


         return (
             <div className="mt-6">
                 <h4 className="text-md sm:text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title} (°C)</h4>
                 <svg width={chartWidth} height={svgHeight}>
                     {/* Horizontal Grid Lines (for temperature markers) */}
                      {yMarkers.map((marker, index) => (
                          <line key={`y-grid-${index}`} x1={padding} y1={marker.y} x2={chartWidth - padding} y2={marker.y} stroke={isDarkMode ? '#444' : '#eee'} strokeWidth="1" strokeDasharray="4"/>
                      ))}

                     {/* Vertical Grid Lines (for hourly labels) */}
                      {xLabels.map((d, index) => {
                           const x = (hourlyData.indexOf(d) / (hourlyData.length - 1)) * chartInnerWidth + padding;
                           return (
                               <line key={`x-grid-${index}`} x1={x} y1={padding} x2={x} y2={svgHeight - padding} stroke={isDarkMode ? '#444' : '#eee'} strokeWidth="1" strokeDasharray="4"/>
                           );
                       })}


                     {/* Area under the line */}
                     <polyline points={areaPoints} fill={isDarkMode ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.4)"} /> {/* Using blue-500 with opacity */}

                     {/* Temperature Line */}
                     <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" /> {/* Tailwind blue-500 */}

                      {/* X-axis labels (Time) */}
                      {xLabels.map((d, index) => {
                          const x = (hourlyData.indexOf(d) / (hourlyData.length - 1)) * chartInnerWidth + padding;
                          return (
                              <text key={index} x={x} y={svgHeight - padding + 15} textAnchor="middle" fontSize="10" fill={isDarkMode ? '#ccc' : '#333'}>
                                  {d.time.getHours()}:00
                              </text>
                          );
                      })}

                      {/* Y-axis labels (Temperature) */}
                      {yMarkers.map((marker, index) => (
                           <text key={`y-label-${index}`} x={padding / 2} y={marker.y + 3} textAnchor="middle" fontSize="10" fill={isDarkMode ? '#ccc' : '#333'}>
                               {marker.temp.toFixed(0)}°
                           </text>
                       ))}


                      {/* Data points (optional) */}
                      {hourlyData.map((d, index) => {
                           const x = (index / (hourlyData.length - 1)) * chartInnerWidth + padding;
                           const y = isConstantTemp ? yValue : chartHeight - ((d.temperature - minTemp) / (maxTemp - minTemp)) * chartHeight + padding;
                           return (
                               <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" stroke="#fff" strokeWidth="1"/>
                           );
                       })}

                 </svg>
             </div>
         );
     };

     // Function to get today's hourly data
     const getTodayHourlyData = () => {
         if (!forecastData) return null;
         const now = new Date();
         return forecastData.time.reduce((acc, time, index) => {
             const date = new Date(time);
             // Check if the date is today and the hour is in the future or current hour
             if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && date.getHours() >= now.getHours()) {
                  acc.push({
                      time: date,
                      temperature: forecastData.temperature_2m[index],
                  });
             }
             return acc;
         }, []);
     };

     // Function to get tomorrow's hourly data
      const getTomorrowHourlyData = () => {
          if (!forecastData) return null;
          const now = new Date();
          return forecastData.time.reduce((acc, time, index) => {
              const date = new Date(time);
               // Check if the date is tomorrow
               if (date.getDate() === now.getDate() + 1) {
                   acc.push({
                       time: date,
                       temperature: forecastData.temperature_2m[index],
                   });
               }
              return acc;
          }, []);
      };


     // Function to get tomorrow's date string
     const getTomorrowDateString = () => {
         const today = new Date();
         const tomorrow = new Date(today);
         tomorrow.setDate(tomorrow.getDate() + 1);
         return tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
     };

     // Function to get tomorrow's weather summary
      const getTomorrowWeatherSummary = () => {
          if (!forecastData) return null;

          const now = new Date();
          const tomorrowData = forecastData.time.reduce((acc, time, index) => {
              const date = new Date(time);
               if (date.getDate() === now.getDate() + 1) {
                   acc.push({
                       time: date,
                       temperature_2m: forecastData.temperature_2m[index],
                       apparent_temperature: forecastData.apparent_temperature[index],
                       precipitation: forecastData.precipitation[index],
                       weather_code: forecastData.weather_code[index],
                       wind_speed_10m: forecastData.wind_speed_10m[index],
                       uv_index: forecastData.uv_index[index],
                       is_day: forecastData.is_day[index],
                   });
               }
              return acc;
          }, []);

          if (tomorrowData.length === 0) return null;

          const minTemp = Math.min(...tomorrowData.map(d => d.temperature_2m));
          const maxTemp = Math.max(...tomorrowData.map(d => d.temperature_2m));
          const totalPrecipitation = tomorrowData.reduce((sum, d) => sum + d.precipitation, 0);
          const maxWindSpeed = Math.max(...tomorrowData.map(d => d.wind_speed_10m));
          const maxUvIndex = Math.max(...tomorrowData.map(d => d.uv_index));

           // Determine dominant weather condition (simplified - could be improved)
           const weatherCodeCounts = tomorrowData.reduce((counts, hour) => {
               counts[hour.weather_code] = (counts[hour.weather_code] || 0) + 1;
               return counts;
           }, {});
           const dominantWeatherCode = Object.keys(weatherCodeCounts).reduce((a, b) => weatherCodeCounts[a] > weatherCodeCounts[b] ? a : b, null);
           const dominantWeatherDescription = getWeatherDescription(parseInt(dominantWeatherCode, 10));
           const dominantWeatherIcon = getWeatherIcon(parseInt(dominantWeatherCode, 10));


          return {
              date: getTomorrowDateString(),
              minTemp: minTemp.toFixed(1),
              maxTemp: maxTemp.toFixed(1),
              precipitation: totalPrecipitation.toFixed(1),
              maxWind: maxWindSpeed.toFixed(1),
              maxUv: maxUvIndex.toFixed(1),
              dominantCondition: dominantWeatherDescription,
              dominantIcon: dominantWeatherIcon,
          };
      };


    return (
        <div className={`min-h-screen p-4 sm:p-6 font-sans antialiased transition-colors duration-500 ${getBackgroundClass()} ${isDarkMode ? 'dark' : ''}`}>
             {/* Inject animation styles */}
             <style>{fadeInAnimation}</style>
             {/* Tailwind Dark Mode Class */}
             <div className="dark:bg-gray-900 dark:text-white min-h-screen p-4 sm:p-6 rounded-lg shadow-xl">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-0 text-gray-800 dark:text-white">Outfit Genius</h1>
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </header>

                {/* Location and Time */}
                <section className="text-center mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl mb-1 sm:mb-2 text-gray-700 dark:text-gray-200">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {placeName}!</h2>
                    <p className="text-md sm:text-lg text-gray-600 dark:text-gray-300">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </section>

                {/* Loading and Error Messages */}
                {loading && (
                    <div className="text-center text-lg sm:text-xl mb-6 sm:mb-8 text-gray-700 dark:text-gray-200">
                        <p>Fetching weather and location...</p>
                        {/* Simple Loading Skeleton Placeholder */}
                        <div className="animate-pulse mt-4 space-y-3 sm:space-y-4">
                            <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-700 rounded w-11/12 sm:w-3/4 mx-auto"></div>
                            <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 sm:w-1/2 mx-auto"></div>
                            <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 sm:w-2/3 mx-auto"></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 text-lg sm:text-xl mb-6 sm:mb-8">
                        <p>{error}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please ensure location services are enabled for your browser.</p>
                    </div>
                )}

                {/* Current Weather Display */}
                {!loading && !error && weatherData && (
                    <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">Current Weather</h3>
                        <div className="flex flex-col sm:flex-row items-center justify-around text-center sm:text-left">
                            <div className="mb-4 sm:mb-0">
                                <p className="text-4xl sm:text-5xl">{getWeatherIcon(weatherData.weather_code)}</p>
                                <p className="text-md sm:text-lg mt-1 sm:mt-2 text-gray-700 dark:text-gray-300">{getWeatherDescription(weatherData.weather_code)}</p>
                            </div>
                            <div className="mb-4 sm:mb-0">
                                <p className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">{weatherData.temperature_2m.toFixed(1)}°C</p> {/* Fixed decimal */}
                                <p className="text-sm text-gray-600 dark:text-gray-400">Feels like {weatherData.apparent_temperature.toFixed(1)}°C</p> {/* Fixed decimal */}
                            </div>
                            <div>
                                <p className="text-md sm:text-xl text-gray-700 dark:text-gray-300">Wind: {weatherData.wind_speed_10m.toFixed(1)} km/h</p> {/* Fixed decimal */}
                                <p className="text-md sm:text-xl text-gray-700 dark:text-gray-300">UV Index: {weatherData.uv_index.toFixed(1)}</p> {/* Fixed decimal */}
                                <p className="text-md sm:text-xl text-gray-700 dark:text-gray-300">Precipitation: {weatherData.precipitation.toFixed(1)} mm</p> {/* Fixed decimal */}
                            </div>
                        </div>
                    </section>
                )}

                {/* Outdoor Duration and Activity Input */}
                 {!loading && !error && weatherData && (
                    <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">Plan Your Time Outdoors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {/* Duration Input */}
                            <div>
                                <label htmlFor="outdoorDuration" className="block text-md sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Estimated Time Outdoors (Today):</label>
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <input
                                        id="outdoorDuration"
                                        type="range"
                                        min="0"
                                        max="8" // Up to 8 hours
                                        step="0.5" // Half-hour increments
                                        value={outdoorDuration}
                                        onChange={(e) => setOutdoorDuration(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500" // Added accent color
                                    />
                                    <span className="text-md sm:text-lg font-semibold text-gray-800 dark:text-white">{outdoorDuration} {outdoorDuration === 1 ? 'hour' : 'hours'}</span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Adjust based on your planned activities today.</p>
                            </div>

                            {/* Activity Input */}
                            <div>
                                <label htmlFor="activity" className="block text-md sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Planned Activity:</label>
                                <select
                                    id="activity"
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base cursor-pointer"
                                >
                                    <option value="Casual">Casual Outing</option>
                                    <option value="Office">Office/Commute</option>
                                    <option value="Running">Running</option>
                                    <option value="Hiking">Hiking</option>
                                    <option value="Walk">Walking</option>
                                    <option value="Gym">Gym/Workout</option>
                                    <option value="Other">Other</option>
                                </select>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">Select the type of activity you'll be doing today and tomorrow.</p>
                            </div>
                        </div>
                    </section>
                 )}


                {/* Today's Temperature Trend */}
                 {!loading && !error && forecastData && (
                     <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                         <div ref={todayChartContainerRef} className="w-full overflow-x-auto">
                             {renderTemperatureChart(getTodayHourlyData(), todayChartWidth, "Today's Temperature Trend")}
                         </div>
                     </section>
                 )}


                {/* Current Outfit Suggestions */}
                {!loading && !error && (
                    <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">Outfit Suggestions for Today ({activity})</h3>
                        {currentOutfitSuggestions.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {currentOutfitSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm transition-opacity duration-500 ease-in-out animate-fadeIn"
                                        style={{ animationDelay: `${index * 0.1}s`, opacity: 1 }}
                                    >
                                        {/* Use the helper function to get specific icons (emojis) */}
                                        <span className="text-2xl sm:text-3xl mr-3 sm:mr-4">{getClothingIcon(suggestion.item)}</span>
                                        <div>
                                            <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">{suggestion.item}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-600 dark:text-gray-400">
                                <p>No specific outfit suggestions for the current conditions and activity.</p>
                                <p className="text-sm mt-2">Consider comfortable everyday wear.</p>
                            </div>
                        )}
                    </section>
                )}

                 {/* Tomorrow's Forecast and Suggestions */}
                 {!loading && !error && forecastData && (
                     <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                         <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">Tomorrow's Forecast and Outfit Suggestions ({activity})</h3>

                          {/* Tomorrow's Daily Summary */}
                           {getTomorrowWeatherSummary() && (
                               <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-white">
                                   <h4 className="text-md sm:text-lg font-semibold mb-2">{getTomorrowWeatherSummary().date} Summary:</h4>
                                   <div className="flex items-center justify-around text-center sm:text-left text-sm sm:text-base">
                                       <div className="flex flex-col items-center">
                                           <span className="text-3xl sm:text-4xl">{getTomorrowWeatherSummary().dominantIcon}</span>
                                           <span className="mt-1">{getTomorrowWeatherSummary().dominantCondition}</span>
                                       </div>
                                       <div className="flex flex-col items-center">
                                           <span className="font-bold">{getTomorrowWeatherSummary().minTemp}°C</span>
                                           <span>Min Temp</span>
                                       </div>
                                       <div className="flex flex-col items-center">
                                           <span className="font-bold">{getTomorrowWeatherSummary().maxTemp}°C</span>
                                           <span>Max Temp</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{getTomorrowWeatherSummary().precipitation} mm</span>
                                           <span>Precipitation</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{getTomorrowWeatherSummary().maxWind} km/h</span>
                                           <span>Max Wind</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{getTomorrowWeatherSummary().maxUv}</span>
                                           <span>Max UV</span>
                                       </div>
                                   </div>
                               </div>
                           )}


                          {/* Temperature Chart for Tomorrow */}
                          <div ref={tomorrowChartContainerRef} className="w-full overflow-x-auto">
                             {renderTemperatureChart(getTomorrowHourlyData(), tomorrowChartWidth, "Tomorrow's Temperature Trend")}
                          </div>


                         {/* Tomorrow's Outfit Suggestions */}
                         <h4 className="text-md sm:text-lg font-semibold mt-6 mb-3 text-gray-800 dark:text-white">Suggested Outfit for Tomorrow:</h4>
                         {tomorrowOutfitSuggestions.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                 {tomorrowOutfitSuggestions.map((suggestion, index) => (
                                     <div
                                         key={index}
                                         className="flex items-center p-3 sm:p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm transition-opacity duration-500 ease-in-out animate-fadeIn"
                                         style={{ animationDelay: `${index * 0.1}s`, opacity: 1 }}
                                     >
                                         {/* Use the helper function to get specific icons (emojis) */}
                                         <span className="text-2xl sm:text-3xl mr-3 sm:mr-4">{getClothingIcon(suggestion.item)}</span>
                                         <div>
                                             <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white">{suggestion.item}</p>
                                             <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{suggestion.reason}</p>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="text-center text-gray-600 dark:text-gray-400">
                                 <p>No specific outfit suggestions for tomorrow's predicted conditions and activity.</p>
                                 <p className="text-sm mt-2">Consider comfortable everyday wear.</p>
                             </div>
                         )}
                     </section>
                 )}


                 {/* Placeholder for future features */}
                 {!loading && !error && (
                     <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                         <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">More Features Coming Soon!</h3>
                         <p>Detailed Hourly Suggestions | Multi-Day Summary | Save Outfits | Personal Preferences</p>
                         {/* Removed the button as the chart is now included */}
                     </section>
                 )}


                {/* Footer */}
                <footer className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-6 sm:mt-8">
                    <p>Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 dark:hover:text-white transition-colors">Open-Meteo.com</a></p>
                    <p>Location data from <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 dark:hover:text-white transition-colors">Nominatim (OpenStreetMap)</a></p>
                    <p className="mt-1 sm:mt-2">&copy; 2023 Outfit Genius</p>
                </footer>
            </div>
        </div>
    );
}
