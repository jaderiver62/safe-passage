// Cookie settings for cross-site access
document.cookie = 'cookie1=value1; SameSite=Lax';
document.cookie = 'cookie2=value2; SameSite=None; Secure';


var aqiArray = [];
var currentLocation = document.getElementById("current-location");
var currentDate = document.getElementById("current-date");
var pollutionData = document.getElementById("searched-aqi-data-summary");
var aqiDetail = document.getElementById("searched-aqi-detail");


var getCurrentInfo = function() {
    var lat;
    var lng;

    var urlIP = "http://api.ipstack.com/check?access_key=7e46a79ccba2279e1788e8356c28018d";
    fetch(urlIP).then(function(response) {
        if (response.ok) {
            response.json().then(function(results) {

                lat = results.latitude;
                lng = results.longitude;
                currentLocation.innerHTML = results.city + "," + results.region_name;
                currentDate.innerHTML = moment().format('L');

            });
        } else {
            alert("Error: " + response.statusText);
        }
    });

};
var getPollution = function(dataResult) {
    pollutionData.innerHTML = "<div class='aqi-searched'>Air Quality Index: " +
        dataResult.list[0].main.aqi + "</div>";
    aqiDetail.innerHTML = "<div><div>Carbon Monoxide: " + dataResult.list[0].components.co +
        "</div><div>Ammonia: " + dataResult.list[0].components.nh3 + "</div>" +
        "<div>Nitrogen Monoxide: " + dataResult.list[0].components.no + "</div>" +
        "<div>Nitrogen Dioxide: " + dataResult.list[0].components.no2 + "</div>" +
        "<div>Ozone: " + dataResult.list[0].components.o3 + "</div>" +
        "<div>Fine particles matter: " + dataResult.list[0].components.pm2_5 + "</div>" +
        "<div>Course particles matter: " + dataResult.list[0].components.pm10 + "</div>" +
        "<div>Sulphur Dioxide: " + dataResult.list[0].components.so2 + "</div></div>";

};

var searchAQIResult = function(lat, lng) {
    getCityName(lat, lng);
    var url = "http://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lng + "&appid=3812ea6836536b0581712ffd66f54fa5&units=imperial";

    fetch(url).then(function(response) {

        if (response.ok) {
            response.json().then(function(thisData) {

                getPollution(thisData);

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

                searchedLocation.innerHTML = data.results[0].formatted;

            });
        } else {
            alert("Error: " + response.statusText);
            // Check for problems
        }
    });
};

getCurrentInfo();