// Cookie settings for cross-site access
document.cookie = 'cookie1=value1; SameSite=Lax';
document.cookie = 'cookie2=value2; SameSite=None; Secure';

var currentLocation = document.getElementById("current-location");

//http://api.openweathermap.org/data/2.5/air_pollution?lat="+lat+"&lon="+lng+"&appid=3812ea6836536b0581712ffd66f54fa5&units=imperial"
//ipstack api -  7e46a79ccba2279e1788e8356c28018d example: http://api.ipstack.com/134.201.250.155?access_key=7e46a79ccba2279e1788e8356c28018d

var aqiArray = [];


var getCurrentAirInfo = function() {
    var lat;
    var lng;

    var urlIP = "http://api.ipstack.com/check?access_key=7e46a79ccba2279e1788e8356c28018d";
    fetch(urlIP).then(function(response) {
        if (response.ok) {
            response.json().then(function(results) {
                console.log(results);
                lat = results.latitude;
                lng = results.longitude;
                currentLocation.innerHTML = results.city + ", " + results.region_name;
                getCurrentPollution(lat, lng);

            });
        } else {
            alert("Error: " + response.statusText);
        }
    });

};
var getCurrentPollution = function(latitude, longitude) {
    var apiUrl = "http://api.openweathermap.org/data/2.5/air_pollution?lat=" + latitude + "&lon=" + longitude + "&appid=3812ea6836536b0581712ffd66f54fa5&units=imperial";
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(dataResult) {
                console.log(dataResult);

                /*                createAPIObject(dataResult);*/

            });
        } else {
            alert("Error: " + response.statusText);
        }
    });
};


// searchAQIResult is the function to call from script-search taking in latitude and longitude parameters

var searchAQIResult = function(lat, lng) {

    var url = "http://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lng + "&appid=3812ea6836536b0581712ffd66f54fa5&units=imperial";

    fetch(url).then(function(response) {

        if (response.ok) {
            response.json().then(function(thisData) {
                console.log(thisData);
                /*                createAPIObject(thisData);*/

            });
        } else {
            alert("Error: " + response.statusText);

        }
    });

}

var createAPIObject = function(results) {


    /*
        var link = "https://openweathermap.org/img/wn/" + iconIdEl + "@2x.png";
        var imgCode = "<img src='" + link + "' alt='icon'>";

        console.log(aqiArray);*/
};



function convertToF(celsius) {
    return Math.trunc(celsius * 9 / 5 + 32);
};


var getPollutant = function(result) {
    // Turn pollutant code into a human readable string
    /*
        components: co: 270.37
        nh3: 0.07
        no: 0
        no2: 0.04
        o3: 25.39
        pm2_5: 1.36
        pm10: 2.46
        so2: 0.04*/
    var pollutantCode = result.data.current.pollution.mainus;
    var pollutantName = "";
    if (pollutantCode === "p2") {
        pollutantName = "PM2.5";
    } else if (pollutantCode === "p1") {
        pollutantName = "PM10";
    } else if (pollutantCode === "o3") {
        pollutantName = "Ozone O3";
    } else if (pollutantCode === "n2") {
        pollutantName = "Nitrogen dioxide NO2";
    } else if (pollutantCode === "s2") {
        pollutantName = "Sulfur dioxide SO2";
    } else if (pollutantCode === "co") {
        pollutantName = "Carbon monoxide CO";
    } else {
        pollutantName = "ERROR - invalid pollutant code";
    }

    return pollutantName;
};

getCurrentAirInfo();