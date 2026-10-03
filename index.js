const express = require('express');
const app = express();
const port = 8000;

app.get('/', (req, res) => {
  res.send('application is running');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
