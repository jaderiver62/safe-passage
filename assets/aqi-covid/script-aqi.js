document.cookie = 'cookie1=value1; SameSite=Lax';
document.cookie = 'cookie2=value2; SameSite=None; Secure';

// Source for Risk Assessment: https://www.airnow.gov/aqi/aqi-basics/
// "low-risk", "medium-risk", or "high-risk"

var currentAQI = document.getElementById("current-air-quality");
var currentWeather = document.getElementById("current-weather");
var currentLocation = document.getElementById("current-location");
var currentDate = document.getElementById("current-date");
var pollutionData = document.getElementById("searched-aqi-data-summary");
var aqiDetail = document.getElementById("searched-aqi-detail");
var searchedWeather = document.getElementById("searched-weather-summary");
var searchedLocation = document.getElementById("searched-location");

var getCurrentInfo = function() {
    var lat;
    var lng;

    var urlIP = "https://api.ipstack.com/check?access_key=7e46a79ccba2279e1788e8356c28018d";
    fetch(urlIP).then(function(response) {
        if (response.ok) {
            response.json().then(function(results) {
                console.log(results);
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
                console.log(thisData);

            });
        } else {
            alert("Error: " + response.statusText);

        }
    });

};
var getPollution = function(dataResult, risk) {
    pollutionData.innerHTML = "<div>Air Quality Index: " +
        dataResult.list[0].main.aqi + "</div>";
    pollutionData.className = risk;
    aqiDetail.innerHTML = "<div><div>Carbon Monoxide: " + dataResult.list[0].components.co +
        "<h6>μg/m3</h6></div><div>Ammonia: " + dataResult.list[0].components.nh3 + "<h6>μg/m3</h6></div>" +
        "<div>Nitrogen Monoxide: " + dataResult.list[0].components.no + "<h6>μg/m3</h6></div>" +
        "<div>Nitrogen Dioxide: " + dataResult.list[0].components.no2 + "<h6>μg/m3</h6></div>" +
        "<div>Ozone: " + dataResult.list[0].components.o3 + "<h6>μg/m3</h6></div>" +
        "<div>Fine particles matter: " + dataResult.list[0].components.pm2_5 + "<h6>μg/m3</h6></div>" +
        "<div>Course particles matter: " + dataResult.list[0].components.pm10 + "<h6>μg/m3</h6></div>" +
        "<div>Sulphur Dioxide: " + dataResult.list[0].components.so2 + "<h6>μg/m3</h6></div></div>";

};

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
var getCityName = function(lat, lng) {

    var apiUrl = "https://api.opencagedata.com/geocode/v1/json?q=" + lat +
        "+" + lng + "&key=974cf3d56a9f45d58e79a7ec8b1f7842";

    fetch(apiUrl).then(function(response) {

        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
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