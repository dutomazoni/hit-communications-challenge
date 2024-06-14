import express from 'express';
import mongoose from 'mongoose';
import routes from './Routes/index';
import cors from 'cors'
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from "path";
import { promises as fs } from 'fs'
import { google } from 'googleapis'
import { authenticate } from '@google-cloud/local-auth'

const SCOPES = ['https://www.googleapis.com/auth/calendar']
const TOKEN_PATH = path.join(process.cwd(), 'token.json')
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json')

async function loadSavedCredentialsIfExist () {
  try {
    const content = await fs.readFile(TOKEN_PATH)
    const credentials = JSON.parse(content)
    return google.auth.fromJSON(credentials)
  } catch (err) {
    return null
  }
}

async function saveCredentials (client) {
  const content = await fs.readFile(CREDENTIALS_PATH)
  const keys = JSON.parse(content)
  const key = keys.installed || keys.web
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  })
  await fs.writeFile(TOKEN_PATH, payload)
}

async function authorize () {
  let client = await loadSavedCredentialsIfExist()
  if (client) {
    return client
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })
  if (client.credentials) {
    await saveCredentials(client)
  }
  return client
}

dotenv.config({ path: path.join(__dirname, '.env') });
let app = express();
app.use(cors());
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '100mb'}));
app.use(routes);
let port = process.env.PORT || 3000

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(require('express-status-monitor')())

let env = process.env.NODE_ENV || 'dev'
let mongoDb
if (env === 'dev'){
  mongoDb = process.env.MONGOURI
}else{
  mongoDb = process.env.MONGOURI_TEST
  port = process.env.TEST_PORT
}

mongoose.connect(mongoDb, { useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify: false});
let db = mongoose.connection
db.on('error', (error) => {
  console.log(error);
  console.error.bind(console, 'connection error:');
});
db.on('connected', () => {
  console.log('Connected to the database.');
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
  authorize()
});

export {app};
