import app from './app';
const port = Number(process.env.PORT) || 7000;

app.server.listen(port, () => {

    return console.log(`server is listening on ${port}`);
  });
