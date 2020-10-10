/*
 * Node.js server start point for list of places sourced from Google maps json file
 * Download from 
 */

import express from 'express';
import { IDataSource } from './dataSource';
import { SavedPlaces } from './savedPlaces';
import { Utils } from './utils';

//----------------------------------
//Initial Setup
//----------------------------------

const data: IDataSource = new SavedPlaces("../data/Saved Places.json");
data.initialize((succeeded) => {
  console.log("Data source is " + (succeeded ? "" : "not") + "initialized.");
  console.log(data.getSummary());
});

const port = 3000;
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is listening on ${port} with Express.`);
});

//----------------------------------
//All Routes
//----------------------------------

app.all("*", (request, _response, next) => {
  console.log(request.path);
  next();
})

//----------------------------------
//Root Route
//----------------------------------
app.get('/', (_request, response) => {
  response.send(Utils.format("Welcome to my places app in Node.js and Express. Enjoy the peerless front-end experience!") + Utils.printJSON(data.getSummary()));
});

//----------------------------------
//Other Supported Routes
//----------------------------------
app.get('/places/', (_request, response) => {
  response.send(Utils.printJSON(data.getData()));
});

app.get('/places/random', (_request, response) => {
  response.send(Utils.printJSON(Utils.randomPlace(data)));
});

app.get('/places/randomMSN', (_request, response) => {
  let place;
  let tries = 0;
  while (!place || tries > 50) {
    const tmpPlace = Utils.randomPlace(data);
    if ((tmpPlace?.address as string)?.split(", ")?.find((str) => { return Utils.isMadisonArea(str); })) place = tmpPlace;
    tries++;
  }
  response.send(Utils.printJSON(place));
});

//----------------------------------
//Fallback Routes
//----------------------------------

app.route("/*")
  .get((request, response) => {
    response.send(Utils.requestInfo(request));
  })

  .post(function (request, response) {
    response.send(Utils.requestInfo(request));
  })

  .put(function (request, response) {
    response.send(Utils.requestInfo(request));
  })

  .delete(function (request, response) {
    response.send(Utils.requestInfo(request));
  });
