const express = require('express');

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');

const mainRoute = require("./routes/main");

app.use(mainRoute);

app.listen(process.env.PORT || 3030);
