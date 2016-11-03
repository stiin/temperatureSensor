var pg = require('pg');
var credentials = require('../dbcredentials/credentials.js');
var apiClient = new pg.Client(credentials);
var express = require('express');
var router = express.Router();
/*
var Switch = require('react-bootstrap-switch');
*/

apiClient.on('notice', function(msg) {
  console.log("notice: %j", msg);
});

apiClient.on('error', function(error) {
  console.log(error);
});

apiClient.connect(function(err) {
  if(err) {
    return console.error('Could not connect to postgres', err);
  }
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('temperature', { title: 'Express' });
});

// Accessing ThingSpeak
var ThingSpeakClient = require('thingspeakclient');
var client = new ThingSpeakClient();

// Credentials
var yourWriteKey = 'JJLR5K6WB0KA0MIA';
var yourReadKey = '32KENJN58CR73TQ9';
var channelID = 158631;

client.attachChannel(channelID, { writeKey:yourWriteKey, readKey: yourReadKey}, callBackThingspeak);

router.post('/api/getChannelFeeds', function(req, res) {

  var results = [];
  client.getLastEntryInChannelFeed(channelID, function(err, resp) {
    if (!err && resp) {
      console.log('getFieldFeed successful. Entry number was: ' + resp);
      results.push(resp);
    }
    else {
      console.log(err);
    }

    if (results.length == 0) {
      res.json("NoFeed");
    } else {
      res.json(results);
    }
  });
});

function callBackThingspeak(err, resp)
{
  if (!err && resp) {
    console.log('Successfully. response was: ' + resp);
  }
  else {
    console.log(err);
  }
}

// Check settings form, integer validation
function checkFormInputInteger(intInputField, inputFieldSwitch, results, field) {

  // Temperature sensor DS18B20 specifications
  var maxSensorMeasurableTemp  = 125;
  var minSensorMeasurableTemp = -55;

    // Everything that's not a valid temperature gets saved as null to db
    if (isNaN(intInputField) || intInputField === "" || intInputField > maxSensorMeasurableTemp || intInputField < minSensorMeasurableTemp) {
        intInputField = null;
      // If temp switch is ON but input invalid - throw error message
      if (inputFieldSwitch) {
        console.log('A temperature (integer) between ' +  minSensorMeasurableTemp + ' °C and ' + maxSensorMeasurableTemp + ' °C needs to be specified.');
        console.log(results.errors);
        results.errors[field] = 'A temperature (integer) between ' +  minSensorMeasurableTemp + ' °C and ' + maxSensorMeasurableTemp + ' °C needs to be specified.';
      }
    }
  return intInputField;
}

// Save settings in db
router.post('/api/updateSettings', function(req, res) {

  var results = {errors: {}, results: []};

  var max_temp_alarm = req.body.max_temp_alarm;
  var min_temp_alarm = req.body.min_temp_alarm;
  var max_temp_comfort = req.body.max_temp_comfort;
  var min_temp_comfort = req.body.min_temp_comfort;

  var max_temp_alarm_active = req.body.max_temp_alarm_active.toLowerCase() == 'true' ? true : false;
  var min_temp_alarm_active = req.body.min_temp_alarm_active.toLowerCase() == 'true' ? true : false;
  var max_temp_comfort_active = req.body.max_temp_comfort_active.toLowerCase() == 'true' ? true : false;
  var min_temp_comfort_active = req.body.min_temp_comfort_active.toLowerCase() == 'true' ? true : false;

  max_temp_alarm = checkFormInputInteger(max_temp_alarm, max_temp_alarm_active, results, 'max_temp_alarm');
  min_temp_alarm = checkFormInputInteger(min_temp_alarm, min_temp_alarm_active, results, 'min_temp_alarm');
  max_temp_comfort = checkFormInputInteger(max_temp_comfort, max_temp_comfort_active, results, 'max_temp_comfort');
  min_temp_comfort = checkFormInputInteger(min_temp_comfort, min_temp_comfort_active, results, 'min_temp_comfort');

  // If any error exists in form input - do not save any changes to db
  if (Object.keys(results.errors).length > 0) {
    res.json(results);
    return;
  }

  var data = {id: req.body.product_id, max_temp_alarm: max_temp_alarm, min_temp_alarm: min_temp_alarm,
  max_temp_comfort: max_temp_comfort, min_temp_comfort: min_temp_comfort, product_alias: req.body.product_alias,
  max_temp_alarm_active: req.body.max_temp_alarm_active, min_temp_alarm_active: req.body.min_temp_alarm_active, max_temp_comfort_active: req.body.max_temp_comfort_active, min_temp_comfort_active: req.body.min_temp_comfort_active};

  // Note: Saves the last accepted integer input from the form max/min alarm/comf. The input value 900 (900 > max measurable sensor temp) may result in that 90 is being saved to db
  var query = apiClient.query("UPDATE products set max_temp_alarm = $1, min_temp_alarm = $2, max_temp_comfort = $3, min_temp_comfort = $4, product_alias = $5, " +
      "max_temp_alarm_active = $6, min_temp_alarm_active = $7, max_temp_comfort_active = $8, min_temp_comfort_active = $9 where id = $10",
      [data.max_temp_alarm, data.min_temp_alarm, data.max_temp_comfort, data.min_temp_comfort, data.product_alias,
        data.max_temp_alarm_active, data.min_temp_alarm_active, data.max_temp_comfort_active, data.min_temp_comfort_active, data.id]);

  query.on('row', function(row) {
    console.log(row);
    results.results.push(row);
  });

  query.on('end', function() {
    if (Object.keys(results.errors).length == 0) {
      res.json("updateSuccessful");
    } else {
      res.json(results);
    }
  });

  query.on('error', function(error) {
    console.log("There was an error with the update settings query: " + error);
    res.json(results);
  });

});




// Read settings from db
router.post('/api/readSettings', function(req, res) {
  var results = [];
  var data = {id: req.body.product_id};

  var query = apiClient.query("SELECT * from products where id = $1", [data.id]);

  query.on('row', function(row) {
    results.push(row);
  });

  query.on('end', function() {
    console.log("ON END!!!!!!!!!!");

    if (results.length == 0) {
      res.json("readNotSuccessful");
    } else {
      res.json(results);
    }
  });

  query.on('error', function(error) {
    console.log("There was an error with the read settings query: " + error);
    res.json(results);
  });
});



module.exports = router;
