const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.enable('trust proxy');



// Listen to the specified port
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});