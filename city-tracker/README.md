# City Tracker
Author: [Canter#0548](https://github.com/dkantereivin)

## Purpose
To monitor a list of subscribed alliances, downloading the alliances cities and storing them historically (each day) in the database. This is useful for intelligence purposes.

## API
This program's output is a web API, and it periodically fetches and stores data in the database.

#### Endpoints:
This API currently has a single endpoint:
##### GET /cities/:date&:allianceID
Both parameters are required. To fetch the current date, write it or write `current` in the date slot. Dates should use the `YYYYMMDD` format.

#### Authentication:
This API uses header based authentication. In **all** calls to the database, include in the header:
```json
{
    "user": "your username",
    "pswd": "your pswd"
}
```
Unauthenticated calls to *any* endpoint will result in a `401: Unauthorized` HTTP response.

## Installation
__Requirements:__
- nodejs + npm
- expressjs
- moment
- dotenv (and a .env file, see below for template)
- pnw4js
- mongodb (npm) and a running mongodb server

Installation:
```shell
git clone https://github.com/dkantereivin/PnW-War-Tech
cd city-tracker
npm i
```
Create a `.env` file in the folder, with the below template.

To execute, run `node server.js`.

## LICENSE
This work is the sole intellectual property of it's original creator. Do not reproduce, modify, deploy, or use in any other way this code without express permission from the original creator.
