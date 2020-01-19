// UNTESTED
require('dotenv').config();
const moment = require('moment');
const express = require('express');
const PnW = require('pnw4js');
const MongoClient = require('mongodb').MongoClient;

/**
 * SUBSCRIBED: an array of alliance IDs to subscribe to. Caution regarding token usage.
 * As a suggestion, prioritize more important alliances earlier on so that if API calls run out, key calls will be stored.
 */
const SUBSCRIBED = [];

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
setInterval(() => {
    for (let i = 0; i < SUBSCRIBED; i++)
        saveCitySnapshot(SUBSCRIBED[i]);
}, REFRESH_TIME);

/**
 * Performs a GET request to the PNW for the specified alliance, and then iterates it's cities.
 * All data from each city is stored in the MongoDB database as an array.
 * Uses aa.city_count + 1 calls per execution.
 * @param {String} aa The alliance to snapshot.
 */
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

/**
 * A middleware authentication function called on every call to the server.
 * Checks for the existence of the username and password specified in headers against the database.
 * @param {Express.Request} req Modified to include the calling user records from the database.
 * @param {Express.Response} res
 * @param {Express.NextFunction} next 
 */
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

/**
 * Responds with the full historical record of cities for a specified date.
 * @param {String} date The date to search for, using format of 'current' day OR 'YYYYMMDD'.
 * @param {String} allianceID The alliance ID, NumberResolvable.
 */
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