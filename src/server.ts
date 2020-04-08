import app from './app';
const port = Number(process.env.PORT) || 7000;
app.server.listen(port,'0.0.0.0', () => {
    return console.log(`server is listening on ${port}`);
});
