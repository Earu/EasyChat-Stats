const express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");

const HTTP_PORT = 9006;
const HTTP_SERVER = express();

HTTP_SERVER.use(express.static("./client/"));
HTTP_SERVER.use(express.json());
HTTP_SERVER.listen(HTTP_PORT, _ => console.log(`Listening on ${HTTP_PORT}`));

let isDbReady = false;
let database = null;

async function createTable() {
	await database.exec(`CREATE TABLE ECStats (
		MessagePerHour BIGINT,
		PercentageEnabled INT,
		PlayersConnected INT,
		Gamemode VARCHAR(255),
		FromWorkshop BOOLEAN,
		CreationDate DATE
	);`);
}

async function tableExists() {
	const result = await database.get("SELECT name FROM sqlite_master WHERE type='table' AND name='ECStats';")
	return result != null;
}

sqlite.open({
	filename: "database.db",
	driver: sqlite3.Database,
}).then(async db => {
	database = db;

	const shouldCreateTable = await tableExists();
	if (!shouldCreateTable)
		await createTable();

	isDbReady = true;
});

HTTP_SERVER.get("/stats", async (_, result) => {
	if (!isDbReady) {
		result.status(500);
		return result.send("database not ready");
	}

	try {
		const data = await database.all("SELECT * FROM ECStats ORDER BY CreationDate DESC LIMIT 200;");
		result.status(200);
		return result.json(data);
	} catch (err) {
		result.status(500);
		return result.send({ error: err.message });
	}
});

const validationLookup = {
	MessagePerHour: "number",
	PercentageEnabled: "number",
	PlayersConnected: "number",
	Gamemode: "string",
	FromWorkshop: "boolean",
};
function validateStats(statObj) {
	for (const key in validationLookup) {
		const type = typeof statObj[key];
		const correctType = validationLookup[key];
		if (type !== correctType)
			throw new Error(`invalid type for '${key}' property, given '${type}' but expected '${correctType}'`);
	}

	if (statObj.PercentageEnabled < 0 || statObj.PercentageEnabled > 100)
		throw new Error(`invalid value for PercentageEnabled: ${statObj.PercentageEnabled}`);
}

async function insertStats(statObj) {
	await database.run("INSERT INTO ECStats VALUES(?,?,?,?,?,date('now'));",
		statObj.MessagePerHour, statObj.PercentageEnabled, statObj.PlayersConnected, statObj.Gamemode, statObj.FromWorkshop);
}

const servers = [];
HTTP_SERVER.post("/stats/submit", async (request, result) => {
	if (!isDbReady) {
		result.status(500);
		return result.send({ error: "database not ready" });
	}

	if (servers[request.ip]) {
		result.status(403);
		return result.send({ error: "please wait before trying to submit again" });
	}

	try {
		if (request.body == null)
			throw new Error("invalid request");

		const stats = request.body;
		console.log(stats);

		validateStats(stats);
		insertStats(stats);

		const ip = request.ip;
		servers[ip] = true;
		setTimeout(_ => servers[ip] = null, 1000 * 60 * 60);

		result.status(200);
		return result.send();
	} catch (err) {
		result.status(500);
		return result.send({ error: err.message });
	}
});