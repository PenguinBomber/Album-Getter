//imports and requirements
const express = require('express');
const fetch = require('cross-fetch');
const convert = require('xml-js');
const config = require('./config.json');
const keyFile = require(config.keyFile);

//set up the express app
const app = express();

var nowPlaying = "null - null";
var npArtURL = "";
async function getNowPlaying() {
	//fetch data from streamInfoURL
	res = await fetch(config.streamInfoURL);
	json = await res.json();

	//check if the source is playing
	if (json.icestats.source !== undefined) {
		//return now playing
		return json.icestats.source.title;
	} else {
		//return null
		return "null - null";
	}
}

async function getAlbumnArt() {
	//parse the nowPlaying string
	npData = nowPlaying.split(" - ");
	console.log(npData);

	//request for the album art
	res = await fetch(config.apiURL + new URLSearchParams({
		method : "track.getInfo",
		api_key : keyFile.apiKey,
		artist : npData[0],
		track : npData[1]
	}))
	//take the raw XML and turn it into JSON data
	rawText = await res.text();
	json = JSON.parse(convert.xml2json(rawText));
	console.log(rawText);
	
	//yeah i don't even fucking know man
	try {
		artURL = json.elements[0].elements[0].elements[8].elements[7].elements[0].text;
	} catch(err) {
		artURL = "no art";
		console.log(err);
	}

	//return the URL
	return artURL;
}

app.get("/", (req, res) => {
	res.send('Hello World!');
});

app.get("/art", (req, res) => {
	//CORS header
	res.header("Access-Control-Allow-Origin", "https://radio.mocrd.org");
	//get the now playing track
	getNowPlaying().then((np) => {
		console.log(np);

		//check if now playing has changed since last requested
		if (np != nowPlaying) {
			//if so, retreve the new art URL and send it
			nowPlaying = np;
			getAlbumnArt().then((artURL) => {
				console.log(artURL);
				npArtURL = artURL;
				res.send(npArtURL);
			})
		} else {
			//if not, send the cached art URL.
			console.log("Using Cache", npArtURL);
			res.send(npArtURL);
		}
	})
});

app.listen(config.port, () => {
})