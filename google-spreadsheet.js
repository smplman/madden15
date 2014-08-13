/*
	Request madden data from spreadsheet () and then insert all of the team and player data into a mogo DB.
*/

var spreadSheetKey = '1-6XFD4QDoMcPSqo2WeY_o8LWM1LYI_GA6Z-FV6T4oY4';

var MongoClient = require('mongodb').MongoClient;
var GoogleSpreadsheets = require("google-spreadsheets");
var players = 0;

connectToDb(function(err, collection){
	if (err) console.log( err );

	getSpreadsheetData(function(err, spreadsheet){
		if (err) console.log( err );

		getTeamData(spreadsheet.worksheets, function(err, team){
			if (err) console.log( err );

			getPlayerData(team, function(err, player){
				if (err) console.log( err );

				collection.insert(player, function(err, inserted){
					if (err) console.log( err );

					players++;
					console.log(players);
				});
			});
		});
	});
});

function getPlayerData(team, cb) {
	//Loop through each player
	team.forEach(function(player){
		//Cleanup Data
    	player.team = team.title;
    	delete player.id;
    	delete player.updated;
    	delete player.title;
    	delete player.content;

    	cb(null,player);
	});
}

function getTeamData(teams, cb) {
	//Loop through each team (worksheet)
	teams.forEach(function(team){
		//Get teams rows (players)
		team.rows({},function(err, rows) {
			cb(null, rows);
		});
	});
}

function getSpreadsheetData(cb) {
	GoogleSpreadsheets({
	    key: spreadSheetKey
	}, function(err, spreadsheet) {
		if (err) console.log( err );
		console.log(spreadsheet.title + " Loaded");
		console.log('Teams (' + spreadsheet.worksheets.length + '):');

		cb(null, spreadsheet);
	});
}

function connectToDb(cb) {
	// Connect to the db
	MongoClient.connect("mongodb://localhost:27017/madden2015", function(err, db) {
  		if(err) { return cb(new Error("Error connecting to DB")); }

  		//var collection = db.collection('players');

  		db.createCollection('players', function(err, collection) {
  			cb(null, collection);
  		});

  	});
}