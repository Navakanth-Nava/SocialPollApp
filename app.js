const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const databasePath = path.join(__dirname, "socialPollApp.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//middleware Function For User//

const userAuthentication = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (authHeader === undefined) {
    response.status(401);
    response.send("Invalid Access Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_KEY", async (error, playload) => {
      if (error) {
        response.send("Invalid Access Token");
      } else {
        next();
      }
    });
  }
};

//user authentication//

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
    SELECT
      *
    FROM
      user
    WHERE 
      username = '${username}';`;
  const dbUser = await database.get(selectUserQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      const playload = { username: username };
      const jwtToken = jwt.sign(playload, "MY_SECRET_KEY");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

//user Details//

app.get("/users", async (request, response) => {
  const userDetails = `SELECT * FROM user`;
  const dbUserDetails = await database.all(userDetails);
  response.send(dbUserDetails);
});

//casting vote//

app.put("/voting/:id", userAuthentication, async (request, response) => {
  const { id } = request.params;
  const pollUser = `
            SELECT name,votes
            FROM poll
            WHERE id = '${id}';`;
  const dbResponse = await database.all(pollUser);
  let dbResponseName = dbResponse[0].name;
  let dbResponseVotes = dbResponse[0].votes;
  const updatePollUser = `
        UPDATE poll
        SET 
            name='${dbResponseName}',
            votes='${parseInt(dbResponseVotes) + 1}'
            WHERE id= '${id}';`;
  await database.run(updatePollUser);
  response.send(
    `You voted to ${dbResponseName} and real time votes are ${
      parseInt(dbResponseVotes) + 1
    }`
  );
});

//admin adding candidates to voting poll//

app.post("/pollUsers", async (request, response) => {
  const { name, votes } = request.body;
  const selectUserQuery = `SELECT * FROM poll WHERE name = '${name}';`;
  const databaseUser = await database.get(selectUserQuery);
  if (databaseUser === undefined) {
    const createUserQuery = `
     INSERT INTO
      poll (name,votes)
     VALUES
      (
       '${name}',
       '${votes}' 
      );`;

    await database.run(createUserQuery);
    response.send("User created successfully");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//admin adding candidates into database//

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location, age } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
  const databaseUser = await database.get(selectUserQuery);

  if (databaseUser === undefined) {
    const createUserQuery = `
     INSERT INTO
      user (username, name, password, gender, location,age)
     VALUES
      (
       '${username}',
       '${name}',
       '${hashedPassword}',
       '${gender}',
       '${location}',
       '${age}' 
      );`;

    await database.run(createUserQuery);
    response.send("User created successfully");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//admin deleting candidates from voting database//

app.delete("/deleteUser", async (request, response) => {
  const { name } = request.body;
  const deleteUserQuery = `DELETE
    FROM user 
    WHERE name='${name}';`;
  await database.run(deleteUserQuery);
  response.send("Candidate Deleted");
});

//admin deleting candidates from voting poll//

app.delete("/deletePollUser", async (request, response) => {
  const { name } = request.body;
  const deletePollQuery = `DELETE
    FROM poll 
    WHERE name='${name}';`;
  await database.run(deletePollQuery);
  response.send("Candidate Deleted");
});

//poll result//

app.get("/pollResult/", async (request, response) => {
  const { search_q = "", order_by, order, limit } = request.query;
  const selectWinner = `
        SELECT *
        FROM poll
        WHERE name LIKE '%${search_q}%'
        ORDER BY ${order_by} ${order}
        LIMIT ${limit};`;
  const dbResponse = await database.all(selectWinner);
  response.send(dbResponse);
});

module.exports = app;
