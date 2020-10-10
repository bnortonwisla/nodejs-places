import express from 'express';

const port = 3000;
const app = express();

app.use(express.json());

app.listen(port, () => {
  console.log(`Server is listening on ${port} with Express.`);
});

app.all("*", (request, _response, next) => {
  console.log(request.path);
  next();
})

app.get('/', (request, response) => {
  response.send(format('It\'s...a Node.js Server with Express!<br>') + requestInfo(request));
});

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

function requestInfo(request: { 'method': string, 'url': string, 'body': string}): string {
  return format(`Got a ${request.method} request.` + '<br>' 
    + 'URL: ' + request.url + '<br>' 
    + JSON.stringify(request.body, undefined, 4));
}

function format(str: string): string {
  return '<pre>' + str + '</pre>';
}