import express from "express";
import axios from "axios";
import "dotenv/config";
const app = express();
const port = 3000;

const api_key = process.env.API_KEY;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.post("/", async (req, res) => {
  let description,
    temp,
    feels_like,
    pressure,
    humidity,
    formattedDateTime,
    seven_days,
    cityName;
  //console.log(req.body);
  let city = req.body.city;
  try {
    const result = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}
          `
    );
    const lat = result.data[0].lat;
    const lon = result.data[0].lon;
    const finalResult = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`
    );
    description = finalResult.data.weather[0].description;
    temp = (finalResult.data.main.temp - 273.15).toFixed(2);
    feels_like = (finalResult.data.main.feels_like - 273.15).toFixed(2);
    pressure = finalResult.data.main.pressure;
    humidity = finalResult.data.main.humidity;
    cityName = result.data[0].name + " ," + result.data[0].country;
    const timeZoneOffsetSeconds = finalResult.data.timezone;
    const localDate = new Date(Date.now() + timeZoneOffsetSeconds * 1000);
    formattedDateTime = localDate.toLocaleString("en-US", {
      timeZone: "UTC",
      timeZoneName: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    seven_days = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );
  } catch (error) {
    console.log(error.message);
  }
  res.render("index.ejs", {
    weatherData: {
      description,
      temp,
      feels_like,
      pressure,
      humidity,
      formattedDateTime,
      cityName,
    },
    seven_days: seven_days.data.daily,
  });
});
app.listen(port, () => {
  console.log("Server is running at " + port);
});
