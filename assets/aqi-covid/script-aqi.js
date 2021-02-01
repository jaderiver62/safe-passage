// Using multiple API's, and so I found this code helped with some errors
document.cookie = 'cookie1=value1; SameSite=Lax';
document.cookie = 'cookie2=value2; SameSite=None; Secure';

// Source for Risk Assessment: https://www.airnow.gov/aqi/aqi-basics/
// Color coded ratings of "low-risk", "medium-risk", or "high-risk"

var currentAQI = document.getElementById("current-air-quality");
var currentWeather = document.getElementById("current-weather");
var currentLocation = document.getElementById("current-location");
var currentDate = document.getElementById("current-date");
var pollutionData = document.getElementById("searched-aqi-data-summary");
var aqiDetail = document.getElementById("searched-aqi-detail");
var searchedWeather = document.getElementById("searched-weather-summary");
var searchedLocation = document.getElementById("searched-location");


// This function get's info about the user's current location
var getCurrentInfo = function() {
    var lat;
    var lng;

    var urlIP = "https://api.ipstack.com/check?access_key=7e46a79ccba2279e1788e8356c28018d";
    fetch(urlIP).then(function(response) {
        if (response.ok) {
            response.json().then(function(results) {

                lat = results.latitude;
                lng = results.longitude;
                var currentCityName = results.city + ", " + results.region_name;
                currentLocation.innerHTML = currentCityName;
                currentDate.innerHTML = moment().format('L');
                var isCurrent = true;
                getWeather(currentCityName, isCurrent);
                searchAQIResult(lat, lng, isCurrent);

            });
        } else {
            alert("Error: " + response.statusText);
        }
    });

};
// This function will get the weathe for a city name

var getWeather = function(cityName, isCurrent) {
    var selection;
    if (isCurrent) {
        var selection = currentWeather;
    } else {
        var selection = searchedWeather;
    }

    var url = "https://api.weatherapi.com/v1/current.json?key=9254440986d34717a5525859213001&q=" + cityName;

    fetch(url).then(function(response) {

        if (response.ok) {
            response.json().then(function(thisData) {
                selection.innerHTML = "Temperature: " + thisData.current.temp_f + "&#8457 - " + thisData.current.condition.text;


            });
        } else {
            alert("Error: " + response.statusText);

        }
    });

};

// This function gets air and pollustion data about result from the API

var getPollution = function(dataResult, risk) {
    pollutionData.innerHTML = "<div>Air Quality Index: " +
        dataResult.list[0].main.aqi + "</div>";
    pollutionData.className = risk;
    var units = "μg/m3";

    aqiDetail.innerHTML = "<div><div>Carbon Monoxide: " + dataResult.list[0].components.co +
        +units + "</div><div>Ammonia: " + dataResult.list[0].components.nh3 + " " + units + "</div>" +
        "<div>Nitrogen Monoxide: " + dataResult.list[0].components.no + " " + units + "</div>" +
        "<div>Nitrogen Dioxide: " + dataResult.list[0].components.no2 + " " + units + "</div>" +
        "<div>Ozone: " + dataResult.list[0].components.o3 + " " + units + "</div>" +
        "<div>PM2.5 - Fine particles matter: " + dataResult.list[0].components.pm2_5 + " " + units + "</div>" +
        "<div>PM10 - Course particles matter: " + dataResult.list[0].components.pm10 + " " + units + "</div>" +
        "<div>Sulphur Dioxide: " + dataResult.list[0].components.so2 + " " + units + "</div></div>";

};

// Processes a search input from a user to find the data to populate the result container

var searchAQIResult = function(lat, lng, isCurrent) {
    getCityName(lat, lng);

    var url = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lng + "&appid=3812ea6836536b0581712ffd66f54fa5&units=imperial";

    fetch(url).then(function(response) {

        if (response.ok) {
            response.json().then(function(thisData) {
                var thisAQI = thisData.list[0].main.aqi;
                var thisRiskAssessment = aqiRiskAssessment(thisAQI);
                if (isCurrent) {
                    currentAQI.className = thisRiskAssessment;
                    currentAQI.innerHTML = "<div>Current Air Quality Index:    " + thisAQI + "</div>";

                } else {
                    getPollution(thisData, thisRiskAssessment);
                }
            });
        } else {
            alert("Error: " + response.statusText);

        }
    });

};

// Gets information about a place when given latitude and longitude coordinates
var getCityName = function(lat, lng) {

    var apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=" + lat +
        "+" + lng + "&key=974cf3d56a9f45d58e79a7ec8b1f7842";

    fetch(apiUrl).then(function(response) {

        if (response.ok) {
            response.json().then(function(data) {

                var cityName = data.results[0].components.city + ", " + data.results[0].components.state;
                var isCurrent = false;
                getWeather(cityName, isCurrent);
                searchedLocation.innerHTML = cityName;
            });
        } else {
            alert("Error: " + response.statusText);

        }
    });
};

// Determines the risk factor of an AQI for the color coding aspect
var aqiRiskAssessment = function(aqiEntry) {
    var riskClass = "";
    if (aqiEntry <= 100) {
        riskClass = "low-risk";
    } else if (aqiEntry <= 200) {
        riskClass = "medium-risk";
    } else { riskClass = "high-risk"; }
    return riskClass;
}

getCurrentInfo();
// Call the function to load the user's location data when the page loads