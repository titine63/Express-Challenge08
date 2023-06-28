require("dotenv").config();

const express = require("express");
const { hashPassword, verifyPassword, verifyToken } = require("./auth");

const app = express();

app.use(express.json());

const port = process.env.APP_PORT ?? 5353;

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

const userHandlers = require("./userHandlers");
const movieHandlers = require("./movieHandlers");

// Routes publiques (GET)
app.get("/api/movies", movieHandlers.getMovies);
app.get("/api/movies/:id", movieHandlers.getMovieById);
app.get("/api/users", userHandlers.getUsers);
app.get("/api/users/:id", userHandlers.getUserById);

// Routes publiques (POST)
app.post("/api/users", hashPassword, userHandlers.postUser);
app.post(
  "/api/login",
  userHandlers.getUserByEmailWithPasswordAndPassToNext,
  verifyPassword
);

// Middleware de vérification du token pour les routes protégées (POST, PUT, DELETE)
app.use(verifyToken);

// Routes protégées (POST, PUT, DELETE)
app.post("/api/movies", movieHandlers.postMovie);
app.put("/api/movies/:id", movieHandlers.updateMovie);
app.delete("/api/movies/:id", movieHandlers.deleteMovie);

app.put(
  "/api/users/:id",
  (req, res, next) => {
    console.log(typeof req.params.id);
    // Vérifier si l'ID correspond à celui du payload du token
    if (parseInt(req.params.id) !== req.payload.sub) {
      return res.status(403).send("Forbidden");
    }
    // Si les IDs correspondent, passer à la logique de traitement
    next();
  },
  hashPassword,
  userHandlers.updateUser
);

app.delete(
  "/api/users/:id",
  (req, res, next) => {
    // Vérifier si l'ID correspond à celui du payload du token
    if (parseInt(req.params.id) !== req.payload.sub) {
      return res.status(403).send("Forbidden");
    }
    // Si les IDs correspondent, passer à la logique de traitement
    next();
  },
  userHandlers.deleteUser
);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});
