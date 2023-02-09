import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import  { connectDB } from "./database/index.js";
import routes from "./routes/index.js";
import { APP_PORT } from './config/index.js';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)




// initialize express app
const app = express();

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// connect database
connectDB();

// enable CORS
app.use(cors());

// parse request body
app.use(bodyParser.json());

// use routes
app.use("/", routes);

// start server
const port = process.env.PORT || APP_PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
