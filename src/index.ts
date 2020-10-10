import express from 'express';
import { DataSourceStatus, IDataSource } from './dataSource';
import { SavedPlaces } from './savedPlaces';

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
  response.send(printJSON(data.getSummary()));
});

//----------------------------------
//Other Supported Routes
//----------------------------------
app.get('/places/', (_request, response) => {
  response.send(printJSON(data.getData()));
});

app.get('/places/random', (_request, response) => {
  response.send(printJSON(randomPlace(data)));
});

app.get('/places/randomMSN', (_request, response) => {
  let place;
  let tries = 0;
  while (!place || tries > 50) {
    const tmpPlace = randomPlace(data);
    if ((tmpPlace?.address as string)?.split(", ")?.find((str) => { return isMadisonArea(str); })) place = tmpPlace;
    tries++;
  }
  response.send(printJSON(place));
});

//----------------------------------
//Fallback Routes
//----------------------------------

app.route("/*")
  .get((request, response) => {
    response.send(requestInfo(request));
  })

  .post(function (request, response) {
    response.send(requestInfo(request));
  })

  .put(function (request, response) {
    response.send(requestInfo(request));
  })

  .delete(function (request, response) {
    response.send(requestInfo(request));
  });

//----------------------------------
//Functions
//----------------------------------

function requestInfo(request: { 'method': string, 'url': string, 'body': string}): string {
  return format(`Got a ${request.method} request.` + '<br>' 
    + 'URL: ' + request.url + '<br>' 
    + JSON.stringify(request.body, undefined, 4));
}

function format(str: string): string {
  return '<pre>' + str + '</pre>';
}

function isMadisonArea(str: string): boolean {
  const first = str.slice(0, 6);
  return (first === "WI 535" || first === "WI 537"); 
}

function randomPlace(data: any): any {
  const places = data.getData() as [];
  const randomIdx = Math.floor(Math.random() * (places.length + 1));
  return places[randomIdx];  
}

function printJSON(item: any): string {
  return "<pre>" + JSON.stringify(item, undefined, 4) + "</pre>";
}