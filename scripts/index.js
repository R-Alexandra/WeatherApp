document.addEventListener("DOMContentLoaded", (_event) => {
    const weatherApiKey = "";
    const geoapifyApiKey = "";
  
    const rootDiv = document.getElementById("root");
  
    rootDiv.innerHTML = "";
  
    const appTitle = createElementAndAppend(
      "h1",
      { id: "appTitle", onclick: goToHome, className: "app-title" },
      "🔍Weather Finder🔍"
    );
  
    const autocompleteDiv = createElementAndAppend("div", {
      className: "autocomplete",
    });
    autocompleteDiv.innerHTML = `
          <input type="text" id="cityInput" placeholder="Enter city name" class="autocomplete-input" />
          <div id="favoritesList" class="autocomplete-items"></div>
          <div id="cityList" class="autocomplete-items"></div>
      `;
  
    const loadingSpinner = createElementAndAppend("div", {
      id: "loadingSpinner",
      className: "spinner",
    });
  
    const weatherCard = createElementAndAppend("div", {
      id: "weatherCard",
      className: "weather-card",
    });
  
    const buttonsContainer = createElementAndAppend("div", {
      id: "buttonsContainer",
    });
  
    const addToFavoritesButton = createElementAndAppend(
      "button",
      {
        id: "addToFavoritesButton",
        onclick: addToFavorites,
        className: "add-to-favorites-button",
      },
      "&#10084;"
    );
  
    const clearFavoritesButton = createElementAndAppend(
      "button",
      {
        id: "clearFavoritesButton",
        onclick: clearFavorites,
        className: "clear-favorites-button",
      },
      "X"
    );
  
    buttonsContainer.appendChild(addToFavoritesButton);
    buttonsContainer.appendChild(clearFavoritesButton);
  
    rootDiv.appendChild(appTitle);
    rootDiv.appendChild(autocompleteDiv);
    rootDiv.appendChild(loadingSpinner);
    rootDiv.appendChild(buttonsContainer);
    rootDiv.appendChild(weatherCard);
  
    const cityNameElement = createElementAndAppend("h2", { id: "cityName" });
    const temperatureElement = createElementAndAppend("p", { id: "temperature" });
    const iconElement = createElementAndAppend("img", {
      className: "icon",
      alt: "Weather Icon",
    });
    const weatherDescriptionElement = createElementAndAppend("p", {
      id: "weatherDescription",
    });
    const forecastElement = createElementAndAppend("div", {
      id: "forecast",
      className: "forecast-section",
    });
    const showForecastButton = createElementAndAppend(
      "button",
      { id: "showForecastButton" },
      "Show Forecast"
    );
  
    function createElementAndAppend(tagName, attributes = {}, innerHTML = "") {
      const element = document.createElement(tagName);
      Object.entries(attributes).forEach(([key, value]) => {
        element[key] = value;
      });
      element.innerHTML = innerHTML;
      return element;
    }

    buttonsContainer.style.display = "none";
    const cityInput = document.getElementById("cityInput");
    const favoritesList = document.getElementById("favoritesList");
    let showFavoritesOnFocus = false;
    favoritesList.style.display = "none";
  
    cityInput.addEventListener("focus", () => {
      if (cityInput.value === "") {
        showFavoritesOnFocus = true;
        showFavoritesList();
      }
    });
  
    cityInput.addEventListener(
      "input",
      debounce(() => {
        if (cityInput.value === "") {
          showFavoritesOnFocus = true;
          showFavoritesList();
        } else {
          if (!showFavoritesOnFocus) {
            hideFavoritesList();
          }
          showFavoritesOnFocus = false;
          searchCities();
        }
      }, 300)
    );
  
    cityInput.addEventListener("blur", () => {
      hideFavoritesList();
    });
  
    function showFavoritesList() {
      favoritesList.style.display = "flex";
      if (favoritesList.children.length > 3) {
        favoritesList.style.maxHeight = "100px";
        favoritesList.style.overflowY = "auto";
      }
    }
  
    function hideFavoritesList() {
      setTimeout(() => {
        if (!document.activeElement.closest("#favoritesList")) {
          favoritesList.style.display = "none";
          favoritesList.style.maxHeight = "none";
          favoritesList.style.overflowY = "visible";
        }
      }, 200);
    }
  
    function searchCities() {
      fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${cityInput.value}&apiKey=${geoapifyApiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          updateCityList(data.features);
        })
        .catch((error) => {
          console.error("Error fetching city data:", error);
        });
    }
  
    function updateCityList(features) {
      cityList.innerHTML = "";
  
      features.forEach((feature) => {
        const cityName =
          feature.properties.city || feature.properties.locality || "";
        const county = feature.properties.county || "";
        const country = feature.properties.country || "";
  
        if (cityName) {
          const fullLocation = ` ${cityName ? cityName + ", " : ""}${
            county ? county + ", " : ""
          }${country}`;
          const isLocationInList = Array.from(cityList.children).some(
            (item) => item.textContent.trim() === fullLocation.trim()
          );
  
          if (!isLocationInList) {
            const listItem = createElementAndAppend(
              "div",
              { className: "autocomplete-item" },
              fullLocation
            );
  
            listItem.addEventListener("click", () => {
              cityInput.value = cityName;
              cityList.innerHTML = "";
              getWeatherData(cityName);
            });
  
            cityList.appendChild(listItem);
          }
        }
      });
    }
  
    function goToHome() {
      cityInput.value = "";
      weatherCard.style.display = "none";
      forecastElement.style.display = "none";
      showForecastButton.style.display = "none";
      loadingSpinner.style.display = "none";
      hideFavoritesList();
      document.body.style.background = "#4464a3";
      buttonsContainer.style.display = "none";
    }
  
    function getWeatherData(city) {
      loadingSpinner.style.display = "block";
      weatherCard.style.display = "none";
      forecastElement.style.display = "none";
      showForecastButton.style.display = "none";
      buttonsContainer.style.display = "none";
  
      weatherCard.innerHTML = "";
  
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`
      )
        .then((response) => response.json())
        .then((data) => {
          console.log("Weather Data:", data);
  
          updateWeatherUI(data);
  
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherApiKey}&units=metric`
          )
            .then((response) => response.json())
            .then((forecastData) => {
              console.log("Forecast Data:", forecastData);
  
              displayForecast(forecastData);
              if (!isCityInFavorites(city)) {
                addToFavoritesButton.style.color = "";
              } else {
                addToFavoritesButton.style.color = "black";
              }
            })
            .catch((error) => {
              console.error("Error fetching forecast data:", error);
              alert("Error fetching forecast data. Please try again.");
            });
        })
        .catch((error) => {
          console.error("Error fetching weather data:", error);
          loadingSpinner.style.display = "none";
          alert("Error fetching weather data. Please try again.");
        });
    }
  
    function updateWeatherUI(data) {
      cityNameElement.textContent = `Weather in ${data.name}`;
  
      const temperatureCelsius = Math.round(data.main.temp - 273.15);
      temperatureElement.textContent = `${temperatureCelsius}°C`;
      weatherDescriptionElement.textContent = `Condition: ${data.weather[0].description}`;
  
      const { icon } = data.weather[0];
      const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
      iconElement.src = iconUrl;
  
      const temperatureIconContainer = createElementAndAppend("div", {
        className: "temperature-icon-container",
      });
  
      weatherCard.appendChild(cityNameElement);
      weatherCard.appendChild(temperatureIconContainer);
      temperatureIconContainer.appendChild(temperatureElement);
      temperatureIconContainer.appendChild(iconElement);
      weatherCard.appendChild(weatherDescriptionElement);
      weatherCard.appendChild(forecastElement);
      weatherCard.appendChild(showForecastButton);
  
      fetchCityImage(data.name);
    }
  
    function displayForecast(forecastData) {
      forecastElement.innerHTML = "";
      const today = new Date();
      const filteredData = forecastData.list.filter((entry) => {
        const date = new Date(entry.dt * 1000).toLocaleDateString();
        return date !== today.toLocaleDateString();
      });
  
      for (
        let i = 1, daysCount = 0;
        i < filteredData.length && daysCount < 5;
        i += 8
      ) {
        const forecastItem = filteredData[i];
        const date = new Date(forecastItem.dt * 1000);
  
        const temperatureCelsius = Math.round(forecastItem.main.temp);
        const formattedDate = date.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  
        const forecastItemElement = document.createElement("div");
        forecastItemElement.classList.add("forecast-row");
  
        const iconElement = document.createElement("img");
        const { icon } = forecastItem.weather[0];
        const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
        iconElement.src = iconUrl;
        iconElement.alt = "Forecast Icon";
        iconElement.classList.add("forecast-icon");
  
        const temperatureElement = document.createElement("p");
        temperatureElement.textContent = `${temperatureCelsius}°C`;
        temperatureElement.classList.add("forecast-temperature");
  
        const dateElement = document.createElement("p");
        dateElement.textContent = formattedDate;
        dateElement.classList.add("forecast-date");
  
        forecastItemElement.appendChild(dateElement);
        forecastItemElement.appendChild(iconElement);
        forecastItemElement.appendChild(temperatureElement);
        forecastElement.appendChild(forecastItemElement);
        daysCount++;
      }
  
      loadingSpinner.style.display = "none";
      weatherCard.style.display = "block";
      showForecastButton.style.display = "block";
      buttonsContainer.style.display = "block";
    }
  
    showForecastButton.addEventListener("click", () => {
      forecastElement.style.display = "block";
      showForecastButton.style.display = "none";
    });
  
    appTitle.addEventListener("click", goToHome);
  
    function fetchCityImage(city) {
      const pexelsApiKey =
        "";
      const headers = new Headers({
        Authorization: pexelsApiKey,
      });
  
      fetch(`https://api.pexels.com/v1/search?query=${city}`, {
        headers: headers,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Pexels API Data:", data);
          if (data.photos && data.photos.length > 0) {
            const imageUrl = data.photos[0].src.large;
  
            document.body.style.backgroundImage = `url(${imageUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
          } else {
            document.body.style.background = "#4464a3";
          }
        })
        .catch((error) => {
          document.body.style.background = "#4464a3";
          console.error("Error fetching city image:", error);
        });
    }
  
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
  
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }
  
    favoritesList.innerHTML = "";
  
    favoritesList.addEventListener("click", (event) => {
      if (event.target.tagName === "LI") {
        const selectedCity = event.target.textContent.trim();
        cityInput.value = selectedCity; 
        getWeatherData(selectedCity);
      }
    });
  
    function addToFavorites() {
      const city = cityInput.value.trim();
      hideFavoritesList();
  
      if (city !== "") {
        if (!isCityInFavorites(city)) {
          const listItem = createElementAndAppend(
            "li",
            { onclick: () => getWeatherData(city) },
            city
          );
          listItem.textContent = city;
          favoritesList.appendChild(listItem);
          addToFavoritesButton.style.color = "black";
  
          getWeatherData(city);
  
          saveFavoritesToLocalStorage();
        } else {
          const existingItem = Array.from(favoritesList.children).find(
            (item) => item.textContent.toLowerCase() === city.toLowerCase()
          );
          favoritesList.removeChild(existingItem);
          addToFavoritesButton.style.color = "";
          saveFavoritesToLocalStorage();
        }
      } else {
        alert("Please enter a city name first.");
      }
    }
  
    function isCityInFavorites(city) {
      const existingCities = Array.from(favoritesList.children).map((item) =>
        item.textContent.toLowerCase()
      );
      return existingCities.includes(city.toLowerCase());
    }
  
    function loadFavoritesFromLocalStorage() {
      const storedFavorites = localStorage.getItem("favoriteCities");
  
      if (storedFavorites) {
        const favoritesArray = JSON.parse(storedFavorites);
        favoritesArray.forEach((city) => {
          const listItem = document.createElement("li");
          listItem.textContent = city;
          favoritesList.appendChild(listItem);
        });
      }
    }
  
    loadFavoritesFromLocalStorage();
  
    clearFavoritesButton.addEventListener("click", clearFavorites);
  
    function clearFavorites() {
      if (favoritesList.children.length === 0) {
        alert("Favorites list is empty.");
        return;
      }
      favoritesList.innerHTML = "";
      addToFavoritesButton.style.color = "";
  
      localStorage.removeItem("favoriteCities");
    }
  
    function saveFavoritesToLocalStorage() {
      const favoritesArray = Array.from(favoritesList.children).map(
        (item) => item.textContent
      );
  
      localStorage.setItem("favoriteCities", JSON.stringify(favoritesArray));
    }
  });
  