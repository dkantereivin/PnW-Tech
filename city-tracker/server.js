require('dotenv').config();
const moment = require('moment');
const express = require('express');
const PnW = require('pnw4js');
const MongoClient = require('mongodb').MongoClient;

// init
const app = express();
server.use(authenticateRequest);

const pnw = new PnW(process.env.API_KEY);

// TODO: Add Connection and Init code for Database

// schemas
const citiesSchema = db.collection('cities');
const authSchema = db.collection('auth');

// periodic
const REFRESH_TIME = 86760000;
setInterval(saveCitySnapshot, REFRESH_TIME);

async function saveCitySnapshot(aa/*id*/)
{
  const alliance = await pnw.alliance(aa); // a nice phat library i made myself :D
  let {cities} = alliance; // 1D arr
  for (let i = 0; i < cities.length; i++)
    cities[i] = pnw.city(cities[i]);
  await Promise.all(cities);

  
  citiesSchema.insertOne({
    date: moment().startOf('D').toISOString(),
    alliance: aa,
    cities
  });
}

async function authenticateRequest(req, res, next)
{

    const {user, pswd} = req.headers;
    const usr = await authSchema.findOne({user, pswd});
    if (db)
    {
        req.user = usr;
        next()
    }
    res.sendStatus(401);
}

server.get('/cities/:date&:allianceID', (req, res) => {
    let {date, allianceID} = req.params;
    if (date === 'current' || typeof date !== 'string')
        date = moment().startOf('D').toISOString();
    else
        date = moment(date, "YYYYMMDD").toISOString();
    
    const cits = await citiesSchema.findOne({
        date,
        alliance: parseInt(allianceID)
    });

    res.send({
        success: !!cits,
        data: cits ? cits : {...cits, failure: 'No matching entry found.'}
    });
})