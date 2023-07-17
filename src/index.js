require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const routes = require('../src/routes/routes');
const bodyParser = require('body-parser');


const app = express();
const PORT = process.env.PORT || 8000;
const DB_URI = "mongodb+srv://princegap001:ggnDV9CL3lLGSwaW@cluster0.mtewcid.mongodb.net/raghu?retryWrites=true&w=majority";

mongoose.set('strictQuery', true)

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
