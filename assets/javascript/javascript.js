$(document).ready(function () {
    let test = false;
    const apiKey = "166a433c57516f51dfab1f7edaed8413";
    let url = 'https://api.openweathermap.org/data/2.5/';
    let requestType = ""; 
    let query ="";
      $('#getWeather,#past-cities').on('click', function () {
      if (test) console.log("on click");
      let e = $(event.target)[0];
      let location = "";
  
      if (e.id === "getWeather" || e.id === "getWeatherId") {
        if (test) console.log("getWeather");
        location = $('#city-search').val().trim().toUpperCase();
      } else if ( e.className === ("cityList") ) {
        if (test) console.log("cityList");
        location = e.innerText;
      }
  
      if (test) { console.log('location:' + location); }
      if (location == "") return;
  
      updateCityStore(location);
      getCurWeather(location);
      getForecastWeather(location);
     });
  
    function convertDate(epoch) {
      if (test) { console.log(`convertData - epoch: ${epoch}`); }
      let readable = [];
      let myDate = new Date(epoch * 1000);
      readable[0] = (myDate.toLocaleString());
      readable[1] = ((myDate.toLocaleString().split(", "))[0]);
      readable[2] = ((myDate.toLocaleString().split(", "))[1]);
  
      if (test) { console.log(` readable[0]: ${readable[0]}`); }
      return readable;
    }
  
    function getCurLocation() {
      if (test) { console.log("getCurLocation"); }
      let location = {};
      function success(position) {
        if (test) { console.log(" success"); }
        if (test) { console.log("  location", position); }
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          success: true
        }
        if (test) { console.log(" success location", location); }
        getCurWeather(location);
        getForecastWeather(location);
      }
  
      function error() {
        location = { success: false }
        console.log('Could not get location');
        return location;
      }
  
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by your browser');
      } else {
        navigator.geolocation.getCurrentPosition(success, error);
      }
    };
  
    function getCurWeather(loc) {
      if (test) { console.log("getCurWeather - loc:", loc); }
      if (test) { console.log("getCurWeather - toloc:",typeof loc); }
      drawHistory();
      $('#city-search').val("");
      if (typeof loc === "object") {
        city = `lat=${loc.latitude}&lon=${loc.longitude}`;
      } else {
        city = `q=${loc}`;
      }
      requestType = 'weather';
      query = `?${city}&units=imperial&appid=${apiKey}`;
      queryURL = `${url}${requestType}${query}`;
  
      if (test) console.log(`cur queryURL: ${queryURL}`);
      $.ajax({
        url: queryURL,
        method: 'GET'
      }).then(function (response) {
        if (test) console.log(response);
  
        weatherObj = {
          city: `${response.name}`,
          wind: response.wind.speed,
          humidity: response.main.humidity,
          temp: response.main.temp,
          date: (convertDate(response.dt))[1],
          icon: `http://openweathermap.org/img/w/${response.weather[0].icon}.png`,
          desc: response.weather[0].description
        }
        drawCurWeather(weatherObj);
        getUvIndex(response);
      });
    };
  
    function getForecastWeather(loc) {
      if (test) { console.log("getForecastWeather - loc:", loc); }
      if (typeof loc === "object") {
        city = `lat=${loc.latitude}&lon=${loc.longitude}`;
      } else {
        city = `q=${loc}`;
      }
      let weatherArr = [];
      let weatherObj = {};
      requestType = 'forecast/daily';
      query = `?${city}&cnt=6&units=imperial&appid=${apiKey}`;
      queryURL = `${url}${requestType}${query}`;
      $.ajax({
        url: queryURL,
        method: 'GET'
      }).then(function (response) {
        if (test) console.log("getForecast response",response);
  
        for (let i = 1; i < response.list.length; i++) {
          let cur = response.list[i]
          weatherObj = {
            weather: cur.weather[0].description,
            icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
            minTemp: cur.temp.min,
            maxTemp: cur.temp.max,
            humidity: cur.humidity,
            date: (convertDate(cur.dt))[1]
          };
  
          weatherArr.push(weatherObj);
        }
  
        drawForecast(weatherArr);
      });
    };
  
    function drawCurWeather(cur) {
      if (test) { console.log('drawCurWeather - cur:', cur); }
      $('#forecast').empty(); 
      $('#cityName').text(cur.city + " (" + cur.date + ")");
      $('#curWeathIcn').attr("src", cur.icon);
      $('#curTemp').text("Temp: " + cur.temp + " F");
      $('#curHum').text("Humidity: " + cur.humidity + "%");
      $('#curWind').text("Windspeed: " + cur.wind + " MPH");
    };
    function drawForecast(cur) {
      if (test) { console.log('drawForecast - cur:', cur); }
      for (let i = 0; i < cur.length; i++) {
        let $colmx1 = $('<div class="col mx-1">');
        let $cardBody = $('<div class="card-body forecast-card">');
        let $cardTitle = $('<h5 class="card-title">');
        $cardTitle.text(cur[i].date);
        let $ul = $('<ul>');
        let $iconLi = $('<li>');
        let $iconI = $('<img>');
        $iconI.attr('src', cur[i].icon);
        let $weathLi = $('<li>');
        $weathLi.text(cur[i].weather);
        let $tempMinLi = $('<li>');
        $tempMinLi.text('Min Temp: ' + cur[i].minTemp + " F");
        let $tempMaxLi = $('<li>');
        $tempMaxLi.text('Max Temp: ' + cur[i].maxTemp + " F");
        let $humLi = $('<li>');
        $humLi.text('Humidity: ' + cur[i].humidity + "%");
        $iconLi.append($iconI);
        $ul.append($iconLi);
        $ul.append($weathLi);
        $ul.append($tempMinLi);
        $ul.append($tempMaxLi);
        $ul.append($humLi);
        $cardTitle.append($ul);
        $cardBody.append($cardTitle);
        $colmx1.append($cardBody);
        $('#forecast').append($colmx1);
      }
    };
  
    function getUvIndex(uvLoc) {
      if (test) { console.log('getUvIndex loc:',uvLoc); }
        city = `lat=${parseInt(uvLoc.coord.lat)}&lon=${parseInt(uvLoc.coord.lon)}`;
      requestType = 'uvi';
      query = `?${city}&appid=${apiKey}`;
      queryURL = `${url}${requestType}${query}`;
      $.ajax({
        url: queryURL,
        method: 'GET'
      }).then(function (response) {
        let bkcolor = "violet";
        let uv = parseFloat(response.value);
        if (uv < 3) { 
          bkcolor = 'green';
        } else if (uv < 6) { 
          bkcolor = 'yellow';
        } else if (uv < 8) { 
          bkcolor = 'orange';
        } else if (uv < 11) { 
          bkcolor = 'red';
        }
  
        let title = '<span>UV Index: </span>';
        let color = title + `<span style="background-color: ${bkcolor}; padding: 0 7px 0 7px;">${response.value}</span>`;
  
        $('#curUv').html(color);
      }); 
    };
  
    function updateCityStore(city) {
      let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
      cityList.push(city); 
      cityList.sort();
      for (let i=1; i<cityList.length; i++) {
         if (cityList[i] === cityList[i-1]) cityList.splice(i,1);
      }
      localStorage.setItem('cityList', JSON.stringify(cityList));
    };
  
    function drawHistory() {
      if (test) console.log('getHistory');
      let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
      $('#past-cities').empty();
      cityList.forEach ( function (city) {
        let cityNameDiv = $('<div>');
        cityNameDiv.addClass("cityList");
        cityNameDiv.attr("value",city);
        cityNameDiv.text(city);
        $('#past-cities').append(cityNameDiv);
      });
    };
    const location = getCurLocation();
  });