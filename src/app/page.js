/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

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


// Function to get outfit suggestions for a single hour (Smarter Logic)
const getSuggestionsForHour = (hourData, activity) => {
    const suggestions = [];
    const temp = hourData.temperature_2m;
    const feelsLike = hourData.apparent_temperature;
    const precipitation = hourData.precipitation;
    const windSpeed = hourData.wind_speed_10m;
    const uvIndex = hourData.uv_index;
    const weatherCode = hourData.weather_code;
    const isDay = hourData.is_day === 1;

    // --- Base Layering based on Feels Like Temperature ---
    if (feelsLike < -15) {
        suggestions.push('Extreme Cold Thermal Base Layers');
        suggestions.push('Insulated Mid Layer (Fleece or Down)');
        suggestions.push('Heavy Insulated & Windproof Outer Layer');
    } else if (feelsLike < -5) {
        suggestions.push('Heavyweight Thermal Base Layers');
        suggestions.push('Warm Mid Layer (Fleece)');
        suggestions.push('Insulated Winter Coat');
    } else if (feelsLike < 5) {
        suggestions.push('Midweight Thermal Base Layers');
        suggestions.push('Long Sleeve Shirt or Light Fleece');
        suggestions.push('Medium Weight Jacket');
    } else if (feelsLike < 15) {
        suggestions.push('Long Sleeve Shirt or T-shirt');
        suggestions.push('Light Jacket or Cardigan (Optional)');
    } else if (feelsLike >= 15 && feelsLike < 22) {
        suggestions.push('T-shirt or Light Top');
    } else { // feelsLike >= 22
        suggestions.push('Lightweight, Breathable Top');
        if (feelsLike > 30) suggestions.push('Minimal Clothing');
    }

    // --- Precipitation ---
    const isRainy = precipitation > 0.5 || (weatherCode >= 61 && weatherCode <= 65) || (weatherCode >= 80 && weatherCode <= 82);
    const isLightRainy = precipitation > 0.1 && !isRainy; // Light drizzle/rain
    const isSnowy = (weatherCode >= 71 && weatherCode <= 75) || (weatherCode >= 85 && weatherCode <= 86);

    if (isRainy) {
        suggestions.push('Waterproof Outer Layer');
        if (activity !== 'Running' && activity !== 'Hiking') suggestions.push('Umbrella');
    } else if (isLightRainy) {
         suggestions.push('Water-resistant Jacket');
    }
    if (isSnowy) {
         suggestions.push('Waterproof/Resistant Winter Coat');
         suggestions.push('Waterproof Insulated Footwear');
    }


    // --- Wind ---
    if (windSpeed > 30 && feelsLike < 15) { // Significant wind chill effect
        if (!suggestions.some(s => s.includes('Windproof'))) suggestions.push('Windproof Outer Layer');
        suggestions.push('Windproof Headwear (Beanie or Balaclava)');
        suggestions.push('Insulated & Windproof Gloves');
    } else if (windSpeed > 20 && feelsLike < 10) { // Moderate wind
         if (!suggestions.some(s => s.includes('Windproof'))) suggestions.push('Windproof Jacket or Layer'); // Check if windproof already suggested
         if (feelsLike < 5) suggestions.push('Light Gloves');
    }


    // --- UV ---
    if (uvIndex > 3 && isDay) {
        suggestions.push('Sunscreen (Apply generously)');
        suggestions.push('Sun Hat or Cap');
        suggestions.push('Sunglasses');
    }

    // --- Activity Specifics (More Granular) ---
    if (activity === 'Running' || activity === 'Hiking' || activity === 'Walk') {
        // Footwear based on conditions
        if (isRainy || isSnowy) {
             suggestions.push('Waterproof/Resistant Athletic Footwear');
        } else if (feelsLike < 5) {
             suggestions.push('Warmer Athletic Footwear');
        } else {
             suggestions.push('Comfortable Athletic Footwear');
        }
         suggestions.push('Moisture-wicking Athletic Socks'); // Always suggest athletic socks for these activities

         // Additional cold weather gear for active outdoor
         if (feelsLike < -5) suggestions.push('Insulated Athletic Gloves');
         if (feelsLike < 0) suggestions.push('Athletic Headwear (Beanie or Headband)');
         if (feelsLike < -10) suggestions.push('Neck Gaiter or Balaclava');

         // Hydration for active outdoor
         if (feelsLike > 15 || hourData.time.getHours() >= 8 && hourData.time.getHours() <= 18) { // Suggest water during warmer temps or daytime
             suggestions.push('Water Bottle');
         }


    } else if (activity === 'Gym') {
        // Assume indoors, focus on commute wear and core gym wear
         if (feelsLike < 10) {
             suggestions.push('Light Layer (for commute)');
         } else if (feelsLike < 0) {
             suggestions.push('Warm Outer Layer (for commute)');
         }
         // Add core gym wear if not already suggested by temperature
         if (!suggestions.some(s => s.includes('Gym Top') || s.includes('T-shirt') || s.includes('Tank Top') || s.includes('Lightweight, Breathable Top'))) {
             suggestions.push('Gym Top');
         }
          if (!suggestions.some(s => s.includes('Gym Bottoms') || s.includes('Shorts') || s.includes('Pants') || s.includes('Leggings'))) {
              suggestions.push('Gym Bottoms');
          }
          if (!suggestions.includes('Athletic Socks')) suggestions.push('Athletic Socks');
          if (!suggestions.includes('Gym Sneakers')) suggestions.push('Gym Sneakers');


    } else if (activity === 'Office') {
         // Assume indoors, suggest commute wear based on hourly conditions
         if (feelsLike < -5) {
             suggestions.push('Heavy Winter Coat (Formal)');
             suggestions.push('Warm Scarf & Gloves');
             suggestions.push('Insulated Formal Footwear');
             suggestions.push('Warm Socks');
         } else if (feelsLike < 5) {
             suggestions.push('Medium Weight Coat (Formal)');
             if (feelsLike < 0) suggestions.push('Scarf & Gloves');
             suggestions.push('Warmer Formal Footwear');
             suggestions.push('Socks');
         } else if (feelsLike < 15) {
             suggestions.push('Light Jacket or Blazer');
             suggestions.push('Formal Footwear');
         } else {
              if (!suggestions.includes('Formal Footwear')) suggestions.push('Formal Footwear');
         }

    } else { // Casual Outing or Other
         // Add general accessories based on temperature/conditions if not already covered
         if (feelsLike < 0 && !suggestions.includes('Warm Hat')) suggestions.push('Warm Hat');
         if (feelsLike < 5 && !suggestions.includes('Gloves')) suggestions.push('Gloves');
         if (feelsLike < 10 && !suggestions.includes('Scarf')) suggestions.push('Scarf');
         if (isRainy && !suggestions.includes('Waterproof Footwear')) suggestions.push('Waterproof Footwear');
         if (isLightRainy && !suggestions.includes('Water-resistant Footwear')) suggestions.push('Water-resistant Footwear');
         if (feelsLike < 10 && !suggestions.includes('Insulated Boots')) suggestions.push('Insulated Boots');
         if (feelsLike >= 25 && !suggestions.includes('Sandals or Open Footwear')) suggestions.push('Sandals or Open Footwear');
         if (!suggestions.some(s => s.includes('Footwear'))) suggestions.push('Comfortable Everyday Footwear'); // Default footwear if no specific footwear suggested


    }

     // General Hydration reminder for warmer temps or longer durations
     if (feelsLike > 20 || activity === 'Casual' && hourData.time.getHours() >= 10 && hourData.time.getHours() <= 16) { // Suggest water during warmer temps or mid-day casual
         suggestions.push('Water Bottle');
     }

      // Thunderstorm warning
      if (weatherCode >= 95) {
          suggestions.push('Seek Shelter Immediately (Thunderstorm)');
      }

      // Fog warning
      if (weatherCode >= 45 && weatherCode <= 48) {
          suggestions.push('Caution: Reduced Visibility (Fog)');
      }


    // Remove duplicates
    return Array.from(new Set(suggestions));
};


// Function to determine overall outfit suggestions and summary based on a range of hourly weather data
const getOutfitSuggestions = (hourlyDataForDuration, activity) => {
    const suggestions = [];
    // Declare weatherSummary here and initialize
    let weatherSummary = null;

    const addSuggestion = (item, reason) => {
        // Add defensive checks here
        if (typeof item !== 'string') {
            console.error('addSuggestion called with non-string item:', item);
            return; // Do not add invalid suggestion
        }
        // Ensure suggestions array contains valid objects before checking
        if (!suggestions.some(s => s && typeof s === 'object' && typeof s.item === 'string' && s.item === item)) {
            suggestions.push({ item, reason });
        }
    };

    if (!hourlyDataForDuration || hourlyDataForDuration.length === 0) {
        // Ensure a valid object with empty suggestions and null summary is always returned
        return { suggestions: [], summary: null };
    }

    // Analyze conditions over the duration
    const temps = hourlyDataForDuration.map(d => d.temperature_2m);
    const feelsLikeTemps = hourlyDataForDuration.map(d => d.apparent_temperature);
    const precipitations = hourlyDataForDuration.map(d => d.precipitation);
    const windSpeeds = hourlyDataForDuration.map(d => d.wind_speed_10m);
    const uvIndices = hourlyDataForDuration.map(d => d.uv_index);
    const weatherCodes = hourlyDataForDuration.map(d => d.weather_code);

    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const minFeelsLike = Math.min(...feelsLikeTemps);
    const maxFeelsLike = Math.max(...feelsLikeTemps);
    const totalPrecipitation = precipitations.reduce((sum, p) => sum + p, 0);
    const maxWindSpeed = Math.max(...windSpeeds);
    const maxUvIndex = Math.max(...uvIndices);
    const hasSignificantRain = precipitations.some(p => p > 0.5); // Threshold for rain gear
    const hasAnyPrecipitation = totalPrecipitation > 0;
    const hasThunderstorm = weatherCodes.some(code => code >= 95);
    const hasFog = weatherCodes.some(code => code >= 45 && code <= 48);


    // Determine representative "feels like" temperature for overall suggestion
    // Use the average or median, or perhaps the temperature during the coldest/warmest part of the duration
    const representativeFeelsLike = feelsLikeTemps[Math.floor(feelsLikeTemps.length / 2)]; // Using middle hour as representative

    // --- Overall Suggestions based on the duration's range and dominant conditions ---
    // These are more general suggestions compared to the hourly ones, focusing on necessary items for the whole period.

     if (maxFeelsLike < -10) {
         addSuggestion('Heavy Winter Outerwear', `Expected during duration: Feels like down to ${minFeelsLike.toFixed(1)}°C`);
         addSuggestion('Thermal Base and Mid Layers', `For extreme cold`);
         addSuggestion('Insulated Headwear and Handwear', `For extreme cold`);
     } else if (maxFeelsLike < 0) {
         addSuggestion('Warm Winter Coat', `Expected during duration: Feels like down to ${minFeelsLike.toFixed(1)}°C`);
         addSuggestion('Thermal Base Layers', `For cold conditions`);
         addSuggestion('Warm Hat and Gloves', `For cold conditions`);
     } else if (maxFeelsLike < 10) {
         addSuggestion('Medium Weight Jacket or Layers', `Expected during duration: Feels like between ${minFeelsLike.toFixed(1)}°C and ${maxFeelsLike.toFixed(1)}°C`);
         if (minFeelsLike < 5) addSuggestion('Long Sleeve Shirt', `For cooler parts of duration`);
         if (minFeelsLike < 0) addSuggestion('Light Hat and Gloves', `If temperature dips below freezing`);
     } else if (maxFeelsLike < 20) {
         addSuggestion('Light Jacket or Cardigan (Optional)', `Expected during duration: Feels like between ${minFeelsLike.toFixed(1)}°C and ${maxFeelsLike.toFixed(1)}°C`);
         addSuggestion('Comfortable Top', `For mild conditions`);
     }
      else { // maxFeelsLike >= 20
          addSuggestion('Lightweight & Breathable Clothing', `Expected during duration: Feels like up to ${maxFeelsLike.toFixed(1)}°C`);
          if (maxFeelsLike > 30) addSuggestion('Minimal Clothing Recommended', 'For very hot conditions');
     }


    // Add general suggestions based on conditions over the duration
    if (hasSignificantRain) {
        addSuggestion('Waterproof Outerwear (Jacket & Pants)', `Rain expected during duration`);
        if (activity !== 'Running' && activity !== 'Hiking') addSuggestion('Umbrella');
        addSuggestion('Waterproof Footwear', `For wet conditions`);
    } else if (hasAnyPrecipitation) {
         addSuggestion('Water-resistant Jacket', `Light rain or drizzle expected`);
         if (!suggestions.some(s => s.item && s.item.includes('Waterproof Footwear'))) addSuggestion('Water-resistant Footwear', `For damp conditions`); // Added check for s.item
    }

    if (maxWindSpeed > 30) {
        addSuggestion('Windproof Outer Layer', `Strong winds expected (${maxWindSpeed.toFixed(1)} km/h)`);
        if (minFeelsLike < 10) addSuggestion('Windproof Accessories (Hat, Gloves)', `To protect from wind chill`);
    } else if (maxWindSpeed > 20) {
         addSuggestion('Consider Wind Protection', `Moderate winds expected (${maxWindSpeed.toFixed(1)} km/h)`);
    }


    if (maxUvIndex > 4 && hourlyDataForDuration.some(d => d.is_day === 1)) { // Higher threshold for overall UV suggestion
        addSuggestion('Strong Sun Protection (SPF 30+, Hat, Sunglasses)', `High UV Index (${maxUvIndex.toFixed(1)}) during daylight hours`);
    } else if (maxUvIndex > 2 && hourlyDataForDuration.some(d => d.is_day === 1)) {
         addSuggestion('Sun Protection (Sunscreen, Hat, Sunglasses)', `Moderate UV Index (${maxUvIndex.toFixed(1)}) during daylight hours`);
    }


     if (hasThunderstorm) {
         addSuggestion('Monitor Conditions & Seek Shelter Plan', 'Thunderstorms expected during duration');
     }

      if (hasFog) {
          addSuggestion('Exercise Caution Due to Reduced Visibility', 'Fog expected during duration');
      }

     // Hydration reminder if duration is long or temperature is high
     if (hourlyDataForDuration.length > 2 || maxTemp > 25 || activity === 'Running' || activity === 'Hiking') {
         addSuggestion('Carry Water Bottle', 'Stay hydrated during your time outdoors');
     }

    // Activity-specific footwear suggestions (overall)
     if (activity === 'Running' || activity === 'Hiking' || activity === 'Walk') {
         if (!suggestions.some(s => s.item && (s.item.includes('Athletic Footwear') || s.item.includes('Waterproof/Resistant Athletic Footwear')))) { // Added check for s.item
             addSuggestion('Appropriate Athletic Footwear', `For ${activity}`);
         }
          if (!suggestions.some(s => s.item && (s.item.includes('Athletic Socks') || s.item.includes('Wool Socks')))) { // Added check for s.item
              addSuggestion('Athletic Socks', `For comfort and moisture wicking`);
          }
     } else if (activity === 'Office') {
          if (!suggestions.some(s => s.item && (s.item.includes('Formal Footwear') || s.item.includes('Insulated Formal Footwear')))) { // Added check for s.item
              addSuggestion('Formal Footwear', 'For the office');
          }
     } else if (activity === 'Casual' || activity === 'Other') {
         if (!suggestions.some(s => s.item && (s.item.includes('Footwear') || s.item.includes('Boots') || s.item.includes('Sandals')))) { // Added check for s.item
             addSuggestion('Comfortable Casual Footwear', 'For general wear');
         }
     }


    // Remove potential duplicates and refine
    const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.item)))
        .map(item => suggestions.find(s => s.item === item));


    // Ensure a base suggestion if list is empty (should be less likely with detailed logic)
     if (uniqueSuggestions.length === 0) {
         uniqueSuggestions.push({ item: 'Comfortable Everyday Wear', reason: 'General conditions' });
     }

    // Construct weatherSummary after analyzing conditions
    // Count occurrences of each weather code
    const weatherCodeCounts = weatherCodes.reduce((counts, code) => {
        counts[code] = (counts[code] || 0) + 1;
        return counts;
    }, {});

    // Find the dominant weather code (the one with the highest count)
    const dominantWeatherCode = Object.keys(weatherCodeCounts).reduce((a, b) =>
        weatherCodeCounts[a] > weatherCodeCounts[b] ? a : b, null);


    weatherSummary = {
        minTemp: minTemp.toFixed(1),
        maxTemp: maxTemp.toFixed(1),
        minFeelsLike: minFeelsLike.toFixed(1),
        maxFeelsLike: maxFeelsLike.toFixed(1),
        totalPrecipitation: totalPrecipitation.toFixed(1),
        maxWind: maxWindSpeed.toFixed(1),
        maxUv: maxUvIndex.toFixed(1),
        dominantCondition: getWeatherDescription(parseInt(dominantWeatherCode, 10)),
        dominantIcon: getWeatherIcon(parseInt(dominantWeatherCode, 10)),
    };


    return { suggestions: uniqueSuggestions, summary: weatherSummary }; // Return both suggestions and summary
};


// Function to generate hourly suggestions for a duration
const generateHourlySuggestions = (hourlyDataForDuration, activity) => {
    if (!hourlyDataForDuration || hourlyDataForDuration.length === 0) {
        return [];
    }
    return hourlyDataForDuration.map(hourData => ({
        time: hourData.time,
        weather: { // Include weather details for the hour
            temperature: hourData.temperature_2m,
            feelsLike: hourData.apparent_temperature,
            precipitation: hourData.precipitation,
            windSpeed: hourData.wind_speed_10m,
            uvIndex: hourData.uv_index,
            weatherCode: hourData.weather_code,
            isDay: hourData.is_day,
            description: getWeatherDescription(hourData.weather_code),
            icon: getWeatherIcon(hourData.weather_code),
        },
        suggestions: getSuggestionsForHour(hourData, activity),
    }));
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
    const [currentOutfitSuggestions, setCurrentOutfitSuggestions] = useState([]); // Overall suggestions for current duration
    const [currentWeatherSummary, setCurrentWeatherSummary] = useState(null); // Summary for current duration
    const [hourlySuggestionsForDuration, setHourlySuggestionsForDuration] = useState([]); // Detailed hourly suggestions for current duration
    const [tomorrowOutfitSuggestions, setTomorrowOutfitSuggestions] = useState([]); // Overall suggestions for tomorrow
    const [tomorrowWeatherSummary, setTomorrowWeatherSummary] = useState(null); // Summary for tomorrow
    const [placeName, setPlaceName] = useState('Your Location');
    const [isDarkMode, setIsDarkMode] = useState(false);

     // Refs for the chart containers - no longer directly used for width measurement
    const todayChartContainerRef = useRef(null);
    const tomorrowChartContainerRef = useRef(null);


    // Inject the animation keyframes into the head
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = fadeInAnimation;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

     // Effect to handle dark mode based on system preference initially
     useEffect(() => {
         const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
         setIsDarkMode(prefersDarkMode);
     }, []);


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

    // Update outfit suggestions and weather summary for today when forecast data, duration, or activity changes
    useEffect(() => {
        if (forecastData) { // Use forecastData to get hourly data
            const now = new Date();
            const currentHour = now.getHours();
            const todayHourlyDataForDuration = forecastData.time.reduce((acc, time, index) => {
                const date = new Date(time);
                // Include data from the current hour up to the specified duration
                if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && date.getHours() >= currentHour && date.getHours() < currentHour + outdoorDuration) {
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

            const outfitResult = getOutfitSuggestions(todayHourlyDataForDuration, activity);
            // Add robust check here before destructuring
            if (outfitResult && typeof outfitResult === 'object' && Array.isArray(outfitResult.suggestions) && outfitResult.summary !== undefined) {
                const { suggestions, summary } = outfitResult;
                setCurrentOutfitSuggestions(suggestions);
                setCurrentWeatherSummary(summary); // Set today's weather summary
            } else {
                 // Handle unexpected return from getOutfitSuggestions if necessary
                 console.error("getOutfitSuggestions returned unexpected value:", outfitResult);
                 setCurrentOutfitSuggestions([]);
                 setCurrentWeatherSummary(null);
            }


            const hourlySuggestions = generateHourlySuggestions(todayHourlyDataForDuration, activity);
            setHourlySuggestionsForDuration(hourlySuggestions); // Set detailed hourly suggestions

        } else if (weatherData) {
             // Fallback to current weather if forecast data isn't available yet
             const outfitResult = getOutfitSuggestions([weatherData], activity); // Pass current weather as an array
             // Add robust check here before destructuring
             if (outfitResult && typeof outfitResult === 'object' && Array.isArray(outfitResult.suggestions) && outfitResult.summary !== undefined) {
                 const { suggestions, summary } = outfitResult;
                 setCurrentOutfitSuggestions(suggestions);
                 setCurrentWeatherSummary(summary); // Set today's weather summary
             } else {
                 // Handle unexpected return from getOutfitSuggestions if necessary
                 console.error("getOutfitSuggestions returned unexpected value (fallback):", outfitResult);
                 setCurrentOutfitSuggestions([]);
                 setCurrentWeatherSummary(null);
             }
             setHourlySuggestionsForDuration(generateHourlySuggestions([weatherData], activity)); // Generate hourly for current hour
        }
    }, [weatherData, forecastData, outdoorDuration, activity]); // Depend on all relevant states

     // Update tomorrow's outfit suggestions and weather summary when forecast data or activity changes
     useEffect(() => {
         if (forecastData) {
             const now = new Date();
             const tomorrowData = forecastData.time.reduce((acc, time, index) => {
                 const date = new Date(time);
                  // Check if the date is tomorrow
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

             // For tomorrow's suggestion and summary, consider the whole day (or a standard daytime period)
             // Let's use hours 8 AM to 8 PM as a representative daytime
             const tomorrowDaytimeData = tomorrowData.filter(d => d.time.getHours() >= 8 && d.time.getHours() <= 20);


             const outfitResult = getOutfitSuggestions(tomorrowDaytimeData.length > 0 ? tomorrowDaytimeData : tomorrowData, activity); // Use daytime data if available, otherwise all tomorrow's data
             // Add robust check here before destructuring
             if (outfitResult && typeof outfitResult === 'object' && Array.isArray(outfitResult.suggestions) && outfitResult.summary !== undefined) {
                 const { suggestions, summary } = outfitResult;
                 setTomorrowOutfitSuggestions(suggestions);
                 setTomorrowWeatherSummary(summary); // Set tomorrow's weather summary
             } else {
                  // Handle unexpected return from getOutfitSuggestions if necessary
                  console.error("getOutfitSuggestions returned unexpected value (tomorrow):", outfitResult);
                  setTomorrowOutfitSuggestions([]);
                  setTomorrowWeatherSummary(null);
             }

         }
     }, [forecastData, activity]); // Depend on forecastData and activity

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
     const renderTemperatureChart = (hourlyData, title) => {
         // Define a fixed viewBox size and let CSS handle the scaling
         const viewBoxWidth = 600; // Increased viewBox width for more space
         const viewBoxHeight = 200; // Increased viewBox height
         const padding = 40; // Increased padding within viewBox
         const chartInnerWidth = viewBoxWidth - 2 * padding;
         const chartHeight = viewBoxHeight - 2 * padding;


         if (!hourlyData || hourlyData.length <= 1) { // Ensure valid data
             console.log(`Chart "${title}" not rendering: Invalid data or insufficient points.`);
             return null;
         }

         const temperatures = hourlyData.map(d => d.temperature);
         const minTemp = Math.min(...temperatures);
         const maxTemp = Math.max(...temperatures);

         // Handle case where min and max temperatures are the same
         const isConstantTemp = minTemp === maxTemp;
         const yValue = isConstantTemp ? chartHeight / 2 + padding : 0; // Use a fixed y if temp is constant

         // Create points for the line chart scaled to the viewBox
         const points = hourlyData.map((d, index) => {
             const x = (index / (hourlyData.length - 1)) * chartInnerWidth + padding;
             // Scale temperature to fit chart height (invert y-axis for SVG)
             const y = isConstantTemp ? yValue : chartHeight - ((d.temperature - minTemp) / (maxTemp - minTemp)) * chartHeight + padding;
             return `${x},${y}`;
         }).join(' ');

         // Create points for the area under the line scaled to the viewBox
         const areaPoints = `${padding},${viewBoxHeight - padding} ${points} ${chartInnerWidth + padding},${viewBoxHeight - padding}`;


         // Generate X-axis labels (every 4 hours) scaled to the viewBox
         const xLabels = hourlyData.filter((_, index) => index % 4 === 0);

         // Generate Y-axis temperature markers (e.g., min, max, and a couple in between) scaled to the viewBox
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
                 {/* Use viewBox and let CSS handle the sizing */}
                 <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
                     {/* Horizontal Grid Lines (for temperature markers) */}
                      {yMarkers.map((marker, index) => (
                          <line key={`y-grid-${index}`} x1={padding} y1={marker.y} x2={viewBoxWidth - padding} y2={marker.y} stroke={isDarkMode ? '#444' : '#eee'} strokeWidth="1" strokeDasharray="4"/>
                      ))}

                     {/* Vertical Grid Lines (for hourly labels) */}
                      {xLabels.map((d, index) => {
                           const x = (hourlyData.indexOf(d) / (hourlyData.length - 1)) * chartInnerWidth + padding;
                           return (
                               <line key={`x-grid-${index}`} x1={x} y1={padding} x2={x} y2={viewBoxHeight - padding} stroke={isDarkMode ? '#444' : '#eee'} strokeWidth="1" strokeDasharray="4"/>
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
                              <text key={index} x={x} y={viewBoxHeight - padding + 15} textAnchor="middle" fontSize="10" fill={isDarkMode ? '#ccc' : '#333'}>
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

     // Function to get today's hourly data (for chart)
     const getTodayHourlyDataForChart = () => {
         if (!forecastData) return null;
         const now = new Date();
         const currentHour = now.getHours();
         const todayHourlyData = forecastData.time.reduce((acc, time, index) => {
             const date = new Date(time);
             // Check if the date is today and the hour is in the future or current hour
             if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && date.getHours() >= currentHour) {
                  acc.push({
                      time: date,
                      temperature: forecastData.temperature_2m[index],
                  });
             }
             return acc;
         }, []);
          // Limit to the next 24 hours for the chart
         return todayHourlyData.slice(0, 24);
     };

     // Function to get tomorrow's hourly data (for chart)
      const getTomorrowHourlyDataForChart = () => {
          if (!forecastData) return null;
          const now = new Date();
          const tomorrowData = forecastData.time.reduce((acc, time, index) => {
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
          // Limit to 24 hours for the chart
          return tomorrowData.slice(0, 24);
      };


     // Function to get tomorrow's date string
     const getTomorrowDateString = () => {
         const today = new Date();
         const tomorrow = new Date(today);
         tomorrow.setDate(tomorrow.getDate() + 1);
         return tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
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
                         <div className="w-full overflow-x-auto">
                             {renderTemperatureChart(getTodayHourlyDataForChart(), "Today's Temperature Trend")}
                         </div>
                     </section>
                 )}


                {/* Current Outfit Suggestions and Summary for Duration */}
                {!loading && !error && currentWeatherSummary && (
                    <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">Outfit Suggestions for Today ({activity})</h3>

                         {/* Weather Summary for Selected Duration */}
                          {currentWeatherSummary && (
                              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-white">
                                  <h4 className="text-md sm:text-lg font-semibold mb-2">Conditions During Your {outdoorDuration} Hour Outing:</h4>
                                  <div className="flex flex-wrap items-center justify-around text-center text-sm sm:text-base gap-4"> {/* Added flex-wrap and gap */}
                                      <div className="flex flex-col items-center">
                                          <span className="text-3xl sm:text-4xl">{currentWeatherSummary.dominantIcon}</span>
                                          <span className="mt-1">{currentWeatherSummary.dominantCondition}</span>
                                      </div>
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold">{currentWeatherSummary.minTemp}°C to {currentWeatherSummary.maxTemp}°C</span>
                                          <span>Temp Range</span>
                                      </div>
                                       <div className="flex flex-col items-center">
                                          <span className="font-bold">{currentWeatherSummary.minFeelsLike}°C to {currentWeatherSummary.maxFeelsLike}°C</span>
                                           <span>Feels Like Range</span>
                                       </div>
                                      <div className="flex flex-col items-center">
                                          <span className="font-bold">{currentWeatherSummary.totalPrecipitation} mm</span>
                                          <span>Total Precipitation</span>
                                      </div>
                                       <div className="flex flex-col items-center">
                                          <span className="font-bold">{currentWeatherSummary.maxWind} km/h</span>
                                          <span>Max Wind</span>
                                      </div>
                                       <div className="flex flex-col items-center">
                                          <span className="font-bold">{currentWeatherSummary.maxUv}</span>
                                          <span>Max UV</span>
                                       </div>
                                   </div>
                               </div>
                           )}

                        {/* Overall Suggestions for the Duration */}
                         <h4 className="text-md sm:text-lg font-semibold mb-3 mt-4 text-gray-800 dark:text-white">Overall Suggestions:</h4>
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
                                 <p>No overall outfit suggestions for the current conditions and activity.</p>
                                 <p className="text-sm mt-2">Consider comfortable everyday wear.</p>
                             </div>
                         )}

                         {/* Detailed Hourly Suggestions for the Duration */}
                         {hourlySuggestionsForDuration.length > 0 && (
                             <div className="mt-8">
                                 <h4 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">Detailed Hourly Suggestions:</h4>
                                 <div className="space-y-6">
                                     {hourlySuggestionsForDuration.map((hourlyData, index) => (
                                         <div key={index} className="p-4 sm:p-5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
                                             <h5 className="text-md sm:text-lg font-bold mb-2 text-gray-800 dark:text-white">
                                                 {hourlyData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                             </h5>
                                             <div className="flex flex-wrap items-center text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3 gap-x-4 gap-y-2"> {/* Added flex-wrap and gaps */}
                                                 <span className="text-2xl sm:text-3xl mr-1">{hourlyData.weather.icon}</span> {/* Adjusted margin */}
                                                 <span>{hourlyData.weather.description}, {hourlyData.weather.temperature.toFixed(1)}°C (Feels like {hourlyData.weather.feelsLike.toFixed(1)}°C)</span>
                                                 <span>Wind: {hourlyData.weather.windSpeed.toFixed(1)} km/h</span>
                                                 <span>Precip: {hourlyData.weather.precipitation.toFixed(1)} mm</span>
                                                  {hourlyData.weather.isDay && hourlyData.weather.uvIndex > 0 && (
                                                      <span>UV: {hourlyData.weather.uvIndex.toFixed(1)}</span>
                                                  )}
                                             </div>
                                             {hourlyData.suggestions.length > 0 ? (
                                                 <ul className="list-disc list-inside text-sm sm:text-base text-gray-800 dark:text-white space-y-1">
                                                     {hourlyData.suggestions.map((suggestion, sIndex) => (
                                                         <li key={sIndex} className="flex items-center">
                                                             <span className="mr-2">{getClothingIcon(suggestion)}</span>
                                                             {suggestion}
                                                         </li>
                                                     ))}
                                                 </ul>
                                             ) : (
                                                 <p className="text-sm text-gray-600 dark:text-gray-400">No specific suggestions for this hour.</p>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}

                     </section>
                 )}

                 {/* Tomorrow's Forecast and Suggestions */}
                 {!loading && !error && tomorrowWeatherSummary && (
                     <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                         <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">Tomorrow&apos;s Forecast and Outfit Suggestions ({activity})</h3>

                          {/* Tomorrow's Daily Summary */}
                           {tomorrowWeatherSummary && (
                               <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm text-gray-800 dark:text-white">
                                   <h4 className="text-md sm:text-lg font-semibold mb-2">{tomorrowWeatherSummary.date} Summary:</h4>
                                   <div className="flex flex-wrap items-center justify-around text-center text-sm sm:text-base gap-4"> {/* Added flex-wrap and gap */}
                                       <div className="flex flex-col items-center">
                                           <span className="text-3xl sm:text-4xl">{tomorrowWeatherSummary.dominantIcon}</span>
                                           <span className="mt-1">{tomorrowWeatherSummary.dominantCondition}</span>
                                       </div>
                                       <div className="flex flex-col items-center">
                                           <span className="font-bold">{tomorrowWeatherSummary.minTemp}°C to {tomorrowWeatherSummary.maxTemp}°C</span>
                                           <span>Temp Range</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{tomorrowWeatherSummary.minFeelsLike}°C to {tomorrowWeatherSummary.maxFeelsLike}°C</span>
                                           <span>Feels Like Range</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{tomorrowWeatherSummary.totalPrecipitation} mm</span>
                                           <span>Total Precipitation</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{tomorrowWeatherSummary.maxWind} km/h</span>
                                           <span>Max Wind</span>
                                       </div>
                                        <div className="flex flex-col items-center">
                                           <span className="font-bold">{tomorrowWeatherSummary.maxUv}</span>
                                           <span>Max UV</span>
                                       </div>
                                   </div>
                               </div>
                           )}


                          {/* Temperature Chart for Tomorrow */}
                          <div className="w-full overflow-x-auto">
                             {renderTemperatureChart(getTomorrowHourlyDataForChart(), "Tomorrow's Temperature Trend")}
                          </div>


                         {/* Tomorrow's Overall Outfit Suggestions */}
                          <h4 className="text-md sm:text-lg font-semibold mt-6 mb-3 text-gray-800 dark:text-white">Overall Suggestions:</h4>
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
                                 <p>No overall outfit suggestions for tomorrow&apos;s predicted conditions and activity.</p>
                                 <p className="text-sm mt-2">Consider comfortable everyday wear.</p>
                             </div>
                         )}

                          {/* Tomorrow's Detailed Hourly Suggestions (Optional - could add if needed) */}
                          {/* This section is commented out to keep tomorrow's view simpler, but the data is available if needed */}
                          {/*
                          {generateHourlySuggestions(getTomorrowHourlyDataForChart(), activity).length > 0 && (
                              <div className="mt-8">
                                  <h4 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 dark:text-white">Tomorrow's Detailed Hourly Suggestions:</h4>
                                   <div className="space-y-6">
                                       {generateHourlySuggestions(getTomorrowHourlyDataForChart(), activity).map((hourlyData, index) => (
                                           <div key={index} className="p-4 sm:p-5 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
                                               <h5 className="text-md sm:text-lg font-bold mb-2 text-gray-800 dark:text-white">
                                                   {hourlyData.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                               </h5>
                                               <div className="flex items-center text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-3">
                                                   <span className="text-2xl sm:text-3xl mr-3">{hourlyData.weather.icon}</span>
                                                   <span>{hourlyData.weather.description}, {hourlyData.weather.temperature.toFixed(1)}°C (Feels like {hourlyData.weather.feelsLike.toFixed(1)}°C)</span>
                                                   <span className="ml-4">Wind: {hourlyData.weather.windSpeed.toFixed(1)} km/h</span>
                                                   <span className="ml-4">Precip: {hourlyData.weather.precipitation.toFixed(1)} mm</span>
                                                    {hourlyData.weather.isDay && hourlyData.weather.uvIndex > 0 && (
                                                        <span className="ml-4">UV: {hourlyData.weather.uvIndex.toFixed(1)}</span>
                                                    )}
                                               </div>
                                               {hourlyData.suggestions.length > 0 ? (
                                                   <ul className="list-disc list-inside text-sm sm:text-base text-gray-800 dark:text-white space-y-1">
                                                       {hourlyData.suggestions.map((suggestion, sIndex) => (
                                                           <li key={sIndex} className="flex items-center">
                                                               <span className="mr-2">{getClothingIcon(suggestion)}</span>
                                                               {suggestion}
                                                           </li>
                                                       ))}
                                                   </ul>
                                               ) : (
                                                   <p className="text-sm text-gray-600 dark:text-gray-400">No specific suggestions for this hour.</p>
                                               )}
                                           </div>
                                       ))}
                                   </div>
                               </div>
                          )}
                           */}
                     </section>
                 )}


                 {/* Placeholder for future features */}
                 {!loading && !error && (
                     <section className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                         <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-white">More Features Coming Soon!</h3>
                         <p>Multi-Day Summary | Save Outfits | Personal Preferences</p>
                         {/* Removed the button as the chart is now included */}
                     </section>
                 )}


                {/* Footer */}
                <footer className="text-center text-gray-600 dark:text-gray-400 dark:text-gray-400 text-xs sm:text-sm mt-6 sm:mt-8">
                    <p>Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 dark:hover:text-white transition-colors">Open-Meteo.com</a></p>
                    <p>Location data from <a href="https://nominatim.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-800 dark:hover:text-white transition-colors">Nominatim (OpenStreetMap)</a></p>
                    <p className="mt-1 sm:mt-2">&copy; 2023 Outfit Genius</p>
                </footer>
            </div>
        </div>
    );
}
