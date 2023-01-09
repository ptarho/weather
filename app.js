
//get all field
const weather = document.querySelector('.weather');
const temperature = document.querySelector(".weather__header-temp"); 
const iconWeather = document.querySelector('.weather__img');
const city = document.querySelector('.weather__header-city');
const wind = document.querySelector('.wind');
const humidityField = document.querySelector('.humidity');
const descriptionWeather = document.querySelector('.description');
const tableDates = document.querySelectorAll('.th__day');
const dayTime = document.querySelector('.dayTime');
const tdMin = document.querySelectorAll('.td__min');
const tdMax = document.querySelectorAll('.td__max');
const body = document.querySelector('body');

class Weather {
    constructor(){
        this.key = '8fb6dd5ef6bb36f3289967296cc4a27b'
    }

    async request(cityName) {
         fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${this.key}`)
         .then((response) => {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            return response.json()
         })
         .then((data) => {
            this.display(data);
        })
        .catch(function(error){
            console.log(error);
            alert('City didn`t find');
        });
        

    }
    async forecast(cityName, daysNum=40) {
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${this.key}&cnt=${daysNum}&units=metric`)
        .then( response => response.json())
        .then( (data) => {
            const days = []; //array to store days date and min/max temp
            
            //Get all min/max temp for next 5 days
            data.list.forEach((el) => {
                let date = el.dt_txt.slice(5,7) + '/' + el.dt_txt.slice(8,10) ; //date of current timestamp
                //if days arr don`t have obj of that day
                if(!days.find(e => e.date === date) && days.length < 5){
                    let obj = {
                        "date": date,
                        'min': Infinity,
                        'max': -Infinity,
                    }
                    days.push(obj);
                    
                }
                let index = days.length - 1; //index of day checked in days array
                //if min/max temp of timestamp is less/more than min/max temp of our obj
                if(el.main.temp_min < days[index].min){
                    days[index].min = el.main.temp_min.toFixed(1);
                }
                if(el.main.temp_max > days[index].max){
                    days[index].max = el.main.temp_max.toFixed(1);
                }
            });
            
            this.displayForecast(days)
            Weather.clearInput()
        });
    }
    //display forecast info
    displayForecast(arr){
        arr.forEach((el, index) => {
            tdMax[index].innerHTML = el.max + '℃';
            tdMin[index].innerHTML = el.min + '℃';
            tableDates[index].innerHTML = el.date;
        })
        weather.classList.remove('loading');
    }
    parseTime(zone){ 
            // create Date object for current location
            let d = new Date();
            // convert to msec - subtract local time zone offset
            // get UTC time in msec
            let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        
            // create new Date object for different city
            // using supplied offset
            let correctTime = new Date(utc + (1000*zone));
            let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let day = days[correctTime.getDay()]
            // return time as a string
            return day + ' ' + correctTime.toLocaleString().slice(12,17);

    }

    //display main weather info
    display(data){
        const {name}  = data;
        const {country, sunrise, sunset} = data.sys;
        const {speed} = data.wind;
        const {temp, temp_min, temp_max, humidity} = data.main;
        const {icon, description} = data.weather[0];
        const {timezone} = data;
        
        temperature.innerHTML = `${temp.toFixed(1)}℃`;
        city.innerHTML = `${name}, ${country}`;
        wind.innerHTML = `Speed: ${speed} m/s`;
        humidityField.innerHTML = `Humidity: ${humidity}%`;
        iconWeather.src = `http://openweathermap.org/img/wn/${icon}@2x.png`;
        descriptionWeather.innerHTML = description.charAt(0).toUpperCase()+ description.slice(1);
        dayTime.innerHTML = this.parseTime(timezone);
        Weather.changeBgImage(description);

    }

    static clearInput(){
        const intervalId = setInterval(() => {
            let temp = textField.value.split('');
            temp.pop()
            textField.value = temp.join('');
            if(temp.length == 0) clearInterval(intervalId);
        }, 50);
    }

    static changeBgImage(description){
        if(description.includes("rain")){
            body.style.backgroundImage = "url('src/rainy.jpg')";
        }else if(description.includes("haze")){
            body.style.backgroundImage = "url('src/bg-img.jpg')";
        }else if(["clear", "broken", "few", "scattered"].some(el => description.toLowerCase().includes(el))){
            body.style.backgroundImage = "url('src/sunny.jpg')";
        }else if(description.includes("cloud")){
            body.style.backgroundImage = "url('src/cloudy.jpg')";
        }
    }
}

let api = new Weather();
api.request('Lviv');
api.forecast('Lviv');

const textField = document.querySelector('.form__input');
const searchBtn = document.querySelector('.form__searchBtn');
const form = document.querySelector('.form');

form.addEventListener('submit', function(e){
    e.preventDefault();
    if(textField.value == '') return
    let result = api.request(textField.value);
    api.forecast(textField.value);
})

