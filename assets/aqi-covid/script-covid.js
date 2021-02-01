// Cookie settings for cross-site access
document.cookie = 'cookie1=value1; SameSite=Lax';
document.cookie = 'cookie2=value2; SameSite=None; Secure';

// API KEY: https://api.covidactnow.org/v2/county/{{FIPS}}.json?apiKey=445bc14aef9b4a7798f42f69d834218d


var covidData = document.getElementById("searched-corona-data");
// Function getCovidData(fips) is meant to be called by script-search.js to get Covid Data from a FIPS 5-digit code parameter
var getCovidData = function(fips) {


    // Covid Risk Assessment Guide by Harvard: https://globalepidemics.org/wp-content/uploads/2020/09/key_metrics_and_indicators_v5-1.pdf

    var apiUrl = "https://api.covidactnow.org/v2/county/" + fips + ".json?apiKey=445bc14aef9b4a7798f42f69d834218d";
    fetch(apiUrl).then(function(response) {
        if (response.ok) {
            response.json().then(function(dataResult) {
                console.log(dataResult);
                console.log(dataResult.metrics.caseDensity);
                var population = dataResult.population;
                var currentCases = dataResult.actuals.cases;
                //The number of cases per 100k population calculated using a 7-day rolling average.
                var currentDeaths = dataResult.actuals.deaths;
                var currentRiskFactor = dataResult.riskLevels.overall;
                var currentNewCases = dataResult.actuals.newCases;
                var percentage = Math.floor((currentCases / population) * 100);
                covidData.innerHTML = "<div id='cases-population'>Number of Cases/Population: " + percentage + "%<br>" + currentCases + " cases out of " + population + " people</div><div id='fatalities'>Total Fatalities: " + currentDeaths + "</div><div id='risk-level'>Overall Covid Risk Rating: " + currentRiskFactor + "</div>" + "</div><div id='new-cases'>Daily New Cases: " + currentNewCases + " per 100k population</div>";
                riskCasesPopulation(percentage);
                riskFatality(currentDeaths, population);
                riskFactor(currentRiskFactor);
                riskNewCases(currentNewCases);
            });

        } else {
            alert("Error: " + response.statusText);
        }
    });

};
var riskCasesPopulation = function(percentage) {
    var casesEl = document.getElementById("cases-population");

    if (percentage <= 33) {
        casesEl.className = "low-risk";
    } else if (percentage <= 66) {
        casesEl.className = "medium-risk";
    } else {
        casesEl.className = "high-risk";
    }
};
var riskFatality = function(deaths, population) {
    var fatalityEl = document.getElementById("fatalities");
    var percentage = Math.floor((deaths / population) * 100);
    if (percentage <= 33) {
        fatalityEl.className = "low-risk";
    } else if (percentage <= 66) {
        fatalityEl.className = "medium-risk";
    } else {
        fatalityEl.className = "high-risk";
    }
};

var riskFactor = function(riskValue) {
    var riskValueEl = document.getElementById("risk-level");
    if (riskValue <= 1) {
        riskValueEl.className = "low-risk";
    } else if (riskValue <= 3) {
        riskValueEl.className = "medium-risk";
    } else {
        riskValueEl.className = "high-risk";
    }
};

var riskNewCases = function(newCases) {
    var newCasesEl = document.getElementById("new-cases");
    if (newCases < 10) {
        newCasesEl.className = "low-risk";
    } else if (newCases < 25) {
        newCasesEl.className = "medium-risk";
    } else {
        newCasesEl.className = "high-risk";
    }
};