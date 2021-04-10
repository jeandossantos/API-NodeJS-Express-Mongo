const express = require('express');
const app = express();

app.use(express.json());
require('./controllers/index')(app);

app.listen(3001, () => console.log('Executando backend na porta 3001'));