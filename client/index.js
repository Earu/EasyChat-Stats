function getRandomColor() {
	return `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
}

function processGamemodeCounts(stats) {
	const gamemodes = [];
	for (const stat of stats) {
		if (!gamemodes[stat.Gamemode]) {
			gamemodes[stat.Gamemode] = 1;
		} else {
			gamemodes[stat.Gamemode]++;
		}
	}

	const gamemodeNames = [];
	const gamemodeCounts = [];
	const gamemodeColors = [];
	for (const gamemode in gamemodes) {
		gamemodeNames.push(gamemode);
		gamemodeCounts.push(gamemodes[gamemode]);
		gamemodeColors.push(getRandomColor());
	}

	const gamemodeCtx = document.getElementById("gamemodeCounts");
	const gamemodeChart = new Chart(gamemodeCtx, {
		type: "pie",
		data: {
			datasets: [{
				data: gamemodeCounts,
				backgroundColor: gamemodeColors
			}],
			labels: gamemodeNames
		},
		options: {
			title: {
				display: true,
				text: "Percentage of Gamemodes with EasyChat"
			}
		}
	});

	return gamemodeChart;
}

function processGamemodePlayers(stats) {
	const gamemodes = [];
	for (const stat of stats) {
		if (!gamemodes[stat.Gamemode]) {
			gamemodes[stat.Gamemode] = [];
		}

		gamemodes[stat.Gamemode].push(stat.PlayersConnected);
	}

	// transforms the array of values into its average value
	const gamemodeNames = [];
	const gamemodeAverages = [];
	for (const gamemode in gamemodes) {
		gamemodeNames.push(gamemode);
		gamemodeAverages.push(Math.round(gamemodes[gamemode].reduce((a, b) => a + b) / gamemodes[gamemode].length));
	}

	const gamemodeCtx = document.getElementById("gamemodePlayers");
	const gamemodeChart = new Chart(gamemodeCtx, {
		type: "bar",
		data: {
			datasets: [{
				label: "Player Count",
				backgroundColor: getRandomColor(),
				data: gamemodeAverages,
			}],
			labels: gamemodeNames,
		},
		options: {
			title: {
				display: true,
				text: "Average Player Count per Gamemode"
			}
		}
	})

	return gamemodeChart;
}

function processSrvWithWorkshop(stats) {
	let averageWorkshop = 0;
	for (stat of stats) {
		if (stat.FromWorkshop)
			averageWorkshop += 1;
	}
	averageWorkshop = (averageWorkshop / stats.length) * 100;

	const srvWithWorkshopCtx = document.getElementById("srvWithWorkshop");
	const srvWithWorkshopChart = new Chart(srvWithWorkshopCtx, {
		type: "pie",
		data: {
			datasets: [{
				data: [ averageWorkshop, 100 - averageWorkshop ],
				backgroundColor: [ getRandomColor(), getRandomColor() ]
			}],
			labels: [ "Workshop", "Others" ]
		},
		options: {
			title: {
				display: true,
				text: "Percentage of EasyChat Sources"
			}
		}
	});

	return srvWithWorkshopChart;
}

function processMsgHourGamemode(stats) {
	const gamemodes = [];
	for (const stat of stats) {
		if (!gamemodes[stat.Gamemode]) {
			gamemodes[stat.Gamemode] = [];
		}

		gamemodes[stat.Gamemode].push(stat.MessagePerHour);
	}

	// transforms the array of values into its average value
	const gamemodeNames = [];
	const gamemodeAverages = [];
	for (const gamemode in gamemodes) {
		gamemodeNames.push(gamemode);
		gamemodeAverages.push(Math.round(gamemodes[gamemode].reduce((a, b) => a + b) / gamemodes[gamemode].length));
	}

	const gamemodeCtx = document.getElementById("msgHourGamemode");
	const gamemodeChart = new Chart(gamemodeCtx, {
		type: "bar",
		data: {
			datasets: [{
				label: "Msg/Hour",
				backgroundColor: getRandomColor(),
				data: gamemodeAverages,
			}],
			labels: gamemodeNames,
		},
		options: {
			title: {
				display: true,
				text: "Average Msg/H per Gamemode"
			}
		}
	})

	return gamemodeChart;
}

function processMsgHourPlayerCount(stats) {
	const data = [];
	for (const stat of stats) {
		data.push({
			x: stat.MessagePerHour,
			y: stat.PlayersConnected,
			r: 5
		})
	}

	const msgHourCtx = document.getElementById("msgHourPlayerCount");
	const msgHourChart = new Chart(msgHourCtx, {
		type: "bubble",
		data: {
			datasets: [{
				label: "Msg/H/PlyCount",
				backgroundColor: getRandomColor(),
				data: data
			}]
		},
		options: {
			title: {
				display: true,
				text: "Msg/H per Player Count"
			}
		}
	})

	return msgHourChart;
}

function processPlayersEnabled(stats) {
	let averageEnabled = 0;
	for (stat of stats)
		averageEnabled += stat.PercentageEnabled;
	averageEnabled = averageEnabled / stats.length;

	const plyEnabledCtx = document.getElementById("plyEnabled");
	const plyEnabledChart = new Chart(plyEnabledCtx, {
		type: "pie",
		data: {
			datasets: [{
				data: [ averageEnabled, 100 - averageEnabled ],
				backgroundColor: [ getRandomColor(), getRandomColor() ]
			}],
			labels: [ "Enabled", "Disabled" ]
		},
		options: {
			title: {
				display: true,
				text: "Percentage of Players with EasyChat Enabled"
			}
		}
	});

	return plyEnabledChart;
}

function processDataRows(stats) {
	const table = document.getElementById("dataRows");
	for (stat of stats) {
		const tr = document.createElement("tr");
		for (key in stat) {
			const td = document.createElement("td");
			td.textContent = stat[key];
			tr.appendChild(td);
		}

		table.appendChild(tr);
	}
}

async function execute() {
	const res = await fetch("/stats");
	const stats = await res.json();

	processGamemodeCounts(stats);
	processGamemodePlayers(stats);
	processMsgHourGamemode(stats);
	processSrvWithWorkshop(stats);
	processPlayersEnabled(stats);
	processMsgHourPlayerCount(stats);

	processDataRows(stats);

	console.log("processed charts");
}

execute();