// Locate Search Form Entry
const searchEntry = document.getElementById('form-entry');
const historyEl = document.getElementById('location-hist');
const locationNameEl = document.getElementById('location-name');
var savedLocations = [];

function getCityFips(locationFullName) {
    // Convert Accented Characters to Standard Characters
    var plainFullName = locationFullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Convert Address to City or County FIPS ID
    return fetch('https://datausa.io/api/searchLegacy/?q=' + plainFullName)
        .then(response => response.json())
        .then(function(data) {
            var fips = data.results[0].id;
            usFips = fips.split("US")[1];

            return usFips;
        });
};

function getLocationInfo(location) {
    var locationSplit = location.split(",");
    var countyFlag = 0;
    var locationType;
    var cityName;
    var countyName;
    var stateName;
    var lat;
    var lon;
    var fips;
    var cityFips = "";
    if (locationSplit[0].includes(" county")) {
        locationSplit[0] = locationSplit[0].replace(" county", "")
        countyFlag = 1;
    }
    location = locationSplit.join(",");
    return fetch('https://us1.locationiq.com/v1/search.php?key=pk.94414a3e154e098aba4bcaa3f8be95c5&q=' + location + '&format=json&addressdetails=1&limit=3&countrycodes=us')
    .then(response => response.json())
    .then(async function(data) {
        var i = 0;
        if (countyFlag) {
            for (i = 0; i < data.length; i++) {
                if (!data[i].address.city && data[i].address.county) {
                    locationType = "county";
                    countyName = data[i].address.county;
                    stateName = data[i].address.state;
                    fullName = countyName + ", " + stateName;
                    break;
                }
            }
        }
        else {
            for (i = 0; i < data.length; i++) {
                if (!data[i].address.city && !data[i].address.county && data[i].address.state) {
                    locationType = "state";
                    stateName = data[i].address.state;
                    fullName = stateName;
                    break;
                }
            }
            if (locationType != "state") {
                for (i = 0; i < data.length; i++) {
                    if (data[i].address.city) {
                        locationType = "city";
                        cityName = data[i].address.city;
                        stateName = data[i].address.state;
                        fullName = cityName + ", " + stateName;
                        break;
                    }
                }
                if (!data[i].address.city) {
                    for (i = 0; i < data.length; i++) {
                        if (data[i].address.county) {
                            locationType = "county";
                            countyName = data[i].address.county;
                            stateName = data[i].address.state;
                            fullName = countyName + ", " + stateName;
                            break;
                        }
                    }
                    if (!data[i].address.county) {
                        // alert("Could not find location");
                        return reject();
                    }
                }
            }
        }
        
        lat = data[i].lat;
        lon = data[i].lon;

        locationNameEl.innerHTML = fullName;
        saveHistory(fullName);

        if (locationType == "city") {
            cityFips = await fetch('https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/4/query?geometryType=esriGeometryPoint&geometry=' + lon + ',' + lat + '&inSR=4326&returnGeometry=false&outFields=*&f=json')
            .then(response => response.json())
            .then(function(data) {
                var placeFips = data.features[0].attributes.PLACE;
                var stateFips = data.features[0].attributes.STATE;
                return stateFips + placeFips;
            });
            fips = await fetch('https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/1/query?geometryType=esriGeometryPoint&geometry=' + lon + ',' + lat + '&inSR=4326&returnGeometry=false&outFields=*&f=json')
            .then(response => response.json())
            .then(function(data) {
                var countyFips = data.features[0].attributes.COUNTY;
                var stateFips = data.features[0].attributes.STATE;
                return stateFips + countyFips;
            });
            return [cityName, countyName, stateName, fullName, lat, lon, await cityFips, await fips];
        }
        else if (locationType = "county") {
            fips = await fetch('https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/1/query?geometryType=esriGeometryPoint&geometry=' + lon + ',' + lat + '&inSR=4326&returnGeometry=false&outFields=*&f=json')
            .then(response => response.json())
            .then(function(data) {
                var countyFips = data.features[0].attributes.COUNTY;
                var stateFips = data.features[0].attributes.STATE;
                return stateFips + countyFips;
            });
            return [cityName, countyName, stateName, fullName, lat, lon, cityFips, await fips];
        }
        else if (locationType == "state") {
            fips = await fetch('https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/1/query?geometryType=esriGeometryPoint&geometry=' + lon + ',' + lat + '&inSR=4326&returnGeometry=false&outFields=*&f=json')
            .then(response => response.json())
            .then(function(data) {
                var stateFips = data.features[0].attributes.STATE;
                return stateFips;
            });
            return [cityName, countyName, stateName, fullName, lat, lon, cityFips, await fips];
        }
        else {
            // alert("Could not find location");
            return reject();
        }
        
    });
}

async function popMetrics(location) {
    await getLocationInfo(location)
    .then(function(data) {
        var cityName = data[0];
        var countyName = data[1];
        var stateName = data[2];
        var fullName = data[3];
        var lat = data[4];
        var lng = data[5];
        var cityFips = data[6];
        var fips = data[7];

        // Call APIs Via Separate Function Calls 
        // NOTE: Place All Functions That do Not Need City Level FIPS Below
        //
        // someFunction(someInput,anotherInput)
        var isCurrentBoolean = false;
        getCovidData(fips);
        searchAQIResult(lat, lng, isCurrentBoolean);
        locationDemographics(cityFips, fips);

    }, function() {
        alert("Could not find location")
    });
}

function saveHistory(location) {
    if (savedLocations) {
        // Remove Duplicate Location
        for (var i = 0; i < savedLocations.length; i++) {
            if (savedLocations[i] == location) {
                savedLocations.splice(i, 1);
            }
        }
        while (savedLocations.length > 5) {
            savedLocations.pop();
        }
        savedLocations.unshift(location);
    } else {
        savedLocations = [location]
    }
    localStorage.setItem("saved-locations", JSON.stringify(savedLocations));
    loadHistory();
}

function loadHistory() {
    savedLocations = JSON.parse(localStorage.getItem("saved-locations"));
    if (savedLocations) {
        historyEl.innerHTML = "";
        for (var i = 0; i < savedLocations.length; i++) {
            var locationEl = document.createElement("button");
            locationEl.setAttribute("class", "location-btn");
            locationEl.setAttribute("location-num", i);
            locationEl.innerHTML = savedLocations[i];
            historyEl.appendChild(locationEl);
        }
        if (locationNameEl.innerHTML == "") {
            popMetrics(savedLocations[0]);
        }
    }
}

loadHistory()

historyEl.addEventListener("click", function(e) {
    // console.log(e);
    try {
        var location = document.querySelector('[location-num="' + e.target.getAttribute("location-num") + '"]').innerHTML;
        popMetrics(location);
    }
    catch(e) {
        return null;
    }
    
});

// On Form Submission
document.getElementById('form-submit').addEventListener('click', function(event) {
    event.preventDefault();
    if (searchEntry.value) {
        popMetrics(searchEntry.value);
    }
});
loadHistory();