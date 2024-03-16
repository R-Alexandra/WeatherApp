# WeatherApp
This is a weather viewer application that provides accurate weather forecasts, leveraging JavaScript, API integration and CSS expertise.
People are always checking the weather in native and web applications.
Now we can go further and create our own web based Weather application!
This application allow you, as a user to enter a city name (and be gently helped by an autocomplete in selecting it), and see the specific weather in that city. It has a pleasing UI/UX, that blends in an photo from the city with the rest of the application. 

What we learn from creating it?
- Create GET requests
- Getting data from an API: there are gaps instead of the API keys in the presented code; please feel free to create an account on the websites mentioned in order to get personal API keys and replace the gaps with them accordingly for the app to be fully functional
- Working with JSON

There is a `<div id="root">` tag without children when the page loads in. All the contents are placed and removed by javascript.
The application shows the current day weather and also a 5-days forecast for the city searched. The title in the app is also the 'home button'. The user can also add cities to 'favourites list' that is shown as autocomplete suggestion under the search bar.
