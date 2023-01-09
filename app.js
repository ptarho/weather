//get all text fields
const weather = document.querySelector(".weather");
const temperature = document.querySelector(".weather__header-temp");
const iconWeather = document.querySelector(".weather__img");
const city = document.querySelector(".weather__header-city");
const wind = document.querySelector(".wind");
const humidityField = document.querySelector(".humidity");
const descriptionWeather = document.querySelector(".description");
const tableDates = document.querySelectorAll(".th__day");
const dayTime = document.querySelector(".dayTime");
const tdMin = document.querySelectorAll(".td__min");
const tdMax = document.querySelectorAll(".td__max");
const body = document.querySelector("body");
const textField = document.querySelector(".form__input");

class Weather {
    constructor() {
        this.key = "8fb6dd5ef6bb36f3289967296cc4a27b";
    }

    request(cityName) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${this.key}`)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                this.display(data);
            })
            .catch(function (error) {
                console.log(error);
                alert("City didn`t find");
            });
    }
    forecast(cityName, daysNum = 40) {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${this.key}&cnt=${daysNum}&units=metric`)
            .then((response) => response.json())
            .then((data) => {
                const days = this.forecastTemperature(data); //parse temperature forecast for next 5 days into array
                this.displayForecast(days);
                Weather.clearInput();
            });
    }
    //For our API we get timestamps for every 3 hours, but we need to find min and max temp for the whole day
    forecastTemperature(data) {
        const days = []; //array to store days date and min/max temp

        //Get all min/max temp for next 5 days
        data.list.forEach((el) => {
            //iterate over every timestamp
            let date = new Date(el.dt_txt);
            let day = date.getDate();
            let month = date.getMonth() + 1;

            let forecastDate = `${day}/${month}`; //date of current timestamp

            //if days arr don`t have obj of that day create new and push it
            if (!days.find((e) => e.date === forecastDate) && days.length < 5) {
                let obj = {
                    date: forecastDate,
                    min: Infinity,
                    max: -Infinity,
                };
                days.push(obj);
            }

            //if min/max temp of timestamp is less/more than min/max temp of our obj
            if (el.main.temp_min < days[days.length - 1].min) {
                days[days.length - 1].min = el.main.temp_min.toFixed(1);
            }
            if (el.main.temp_max > days[days.length - 1].max) {
                days[days.length - 1].max = el.main.temp_max.toFixed(1);
            }
        });

        return days;
    }
    //display forecast info
    displayForecast(arr) {
        arr.forEach((el, index) => {
            tdMax[index].innerHTML = `${el.max}℃`;
            tdMin[index].innerHTML = `${el.min}℃`;
            tableDates[index].innerHTML = el.date;
        });
        weather.classList.remove("loading");
    }
    parseTime(zone) {
        // create Date object for current location
        let d = new Date();
        // convert to msec and subtract local time zone offset
        // get UTC time in msec
        let utc0 = d.getTime() + d.getTimezoneOffset() * 60000;
        // create new Date object for different city
        // using supplied offset
        let cityTime = new Date(utc0 + 1000 * zone);
        let dayName = cityTime.toLocaleDateString("en", { weekday: "long" });
        let minutes = `0${cityTime.getMinutes()}`;
        let hours = `0${cityTime.getHours()}`;

        // return time as a string
        return `${dayName} ${hours.slice(-2)}:${minutes.slice(-2)}`;
    }

    //display main weather info
    display(data) {
        const { name, timezone } = data;
        const { country } = data.sys;
        const { speed } = data.wind;
        const { temp, humidity } = data.main;
        const { icon, description, main } = data.weather[0];

        temperature.innerHTML = `${temp.toFixed(1)}℃`;
        city.innerHTML = `${name}, ${country}`;
        wind.innerHTML = `Speed: ${speed} m/s`;
        humidityField.innerHTML = `Humidity: ${humidity}%`;
        iconWeather.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        descriptionWeather.innerHTML = description.charAt(0).toUpperCase() + description.slice(1);
        dayTime.innerHTML = this.parseTime(timezone);
        Weather.changeBgImage(main);
    }

    //Clear input field animation
    static clearInput() {
        const intervalId = setInterval(() => {
            textField.value = textField.value.slice(0, -1);
            if (textField.value.length == 0) clearInterval(intervalId);
        }, 50);
    }

    static changeBgImage(description) {
        if (description.includes("Rain")) {
            body.style.backgroundImage = "url('src/rainy.jpg')";
        } else if (description.includes("Haze")) {
            body.style.backgroundImage = "url('src/bg-img.jpg')";
        } else if (description.includes("Clear")) {
            body.style.backgroundImage = "url('src/sunny.jpg')";
        } else if (description.includes("Cloud")) {
            body.style.backgroundImage = "url('src/cloudy.jpg')";
        }
    }
}

let api = new Weather();
api.request("Lviv");
api.forecast("Lviv");

const form = document.querySelector(".form");

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (textField.value == "") return;
    api.forecast(textField.value);
});
