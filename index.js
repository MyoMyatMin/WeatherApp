import express from "express";
import axios from "axios";
import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

const api_key = process.env.API_KEY;

app.use(express.urlencoded({ extended: true }));
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.render("index", { weatherData: null, seven_days: null, error: null });
});

app.post("/", async (req, res) => {
  let city = req.body.city;

  try {
    const geoResult = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}`
    );

    if (geoResult.data.length === 0) {
      return res.render("index", {
        error: "City not found!",
        weatherData: null,
        seven_days: null,
      });
    }

    const lat = geoResult.data[0].lat;
    const lon = geoResult.data[0].lon;
    const cityName = `${geoResult.data[0].name}, ${geoResult.data[0].country}`;

    const weatherResult = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}&units=metric`
    );

    const { description } = weatherResult.data.weather[0];
    const { temp, feels_like, pressure, humidity } = weatherResult.data.main;

    const localDate = new Date();
    const formattedDateTime = localDate.toLocaleString("en-US", {
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

    const forecastResult = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
    );

    const seven_days = forecastResult.data.daily;

    res.render("index", {
      weatherData: {
        description,
        temp,
        feels_like,
        pressure,
        humidity,
        formattedDateTime,
        cityName,
      },
      seven_days: seven_days,
      error: null,
    });
  } catch (error) {
    console.error(error.message);
    res.render("index", {
      error: "Error fetching data. Please try again.",
      weatherData: null,
      seven_days: null,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
