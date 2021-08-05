const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// getting Player Details API1

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => {
      return convertDbObjectToResponseObject(eachPlayer);
    })
  );
});

// Get Player On playerID API3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const playerArray = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerArray));
});

// Add Player API2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `INSERT INTO cricket_team (player_name , jersey_number, role) VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// Updating Player Details API4

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete player API5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
