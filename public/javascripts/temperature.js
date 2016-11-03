/**
 * Created by ministini on 2016-10-23.
 */

let orangeLow;
let orangeHigh;
let redLow;
let redHigh;

var alarmMaxTempLimit;
var alarmMinTempLimit;
var comfortMinTemp;
var comfortMaxTemp;


function init() {

    // Check type of user device
    var md = new MobileDetect(window.navigator.userAgent);
/*    console.log("md: " );
    console.log(md.mobile());*/
    if (md.mobile()) {
        $('html').addClass('mobile');
    } else {
        $('html').addClass('noMobile');
    }


    $("#formControlsProductID").val("2A");
    var product_id = $("#formControlsProductID").val();

    // Do not save any changes to input form before all values are read from DB
    var combinedPromise = $.when(readSettings(product_id));
    combinedPromise.done(function() {
        inputChangeDetection();
    });

    getCurrentTemp();

    var counter = 0;
    setInterval(function(){
        getCurrentTemp();
        counter = counter + 20;
    }, 20000);

}

$(document).ready(function() {
    init();
    ReactDOM.render(<NavbarDisp />, document.getElementById('navigation'));

    // add help image as popup on click on help-button
    $("[name='my-popover']").popover({
        content: "<img src='images/helpTemp.png'  id='settingsHelpImage' />",
        html: true,
        viewport: {selector: "#settingsOutline"}
    });

});

// Automatically save changes in settings form
function inputChangeDetection() {

    // FORM INPUT FIELD - save input automatically
    $("#formControlsProductAlias").bind("keyup change", function(){
        saveSettings();
    });
    $("#formControlsMaxAlarm").bind("keyup change", function(){
        saveSettings();
    });
    $("#formControlsMinAlarm").bind("keyup change", function(){
        saveSettings();
    });
    $("#formControlsMaxComfort").bind("keyup change", function(){
        saveSettings();
    });
    $("#formControlsMinComfort").bind("keyup change", function(){
        saveSettings();
    });

    // FORM SWITCH BUTTONS - save state automatically
    $('#max_temp_alarm').on('switchChange.bootstrapSwitch', function (event, state) {
        saveSettings();
    });
    $('#min_temp_alarm').on('switchChange.bootstrapSwitch', function (event, state) {
        saveSettings();
    });
    $('#max_temp_comfort').on('switchChange.bootstrapSwitch', function (event, state) {
        saveSettings();
    });
    $('#min_temp_comfort').on('switchChange.bootstrapSwitch', function (event, state) {
        saveSettings();
    });
}

// READ SETTINGS FROM DB
function readSettings(product_id) {

    // To be used for promise
    var deferred = $.Deferred();

    var request = $.ajax({
        url: "/api/readSettings",
        type: "POST",
        data: {product_id: product_id},
        cache: false
    });

    request.done(function(settings) {

        if (settings) {
            console.log("Read Successful");

            // CONTROL THAT comfort span within larm max, min
            var timeFromLastReading = 4;

            $("#formControlsProductAlias").val(settings[0].product_alias);

            // Reads and sets temperature setting limits
            alarmMaxTempLimit = settings[0].max_temp_alarm;
            alarmMinTempLimit = settings[0].min_temp_alarm;
            comfortMaxTemp = settings[0].max_temp_comfort;
            comfortMinTemp = settings[0].min_temp_comfort;
            $("#formControlsMaxAlarm").val(alarmMaxTempLimit);
            $("#formControlsMinAlarm").val(alarmMinTempLimit);
            $("#formControlsMaxComfort").val(comfortMaxTemp);
            $("#formControlsMinComfort").val(comfortMinTemp);

            alarmMaxTempLimit = 25;
            alarmMinTempLimit = -20;
            comfortMaxTemp = 20;
            comfortMinTemp = -10;

            // https://github.com/anomal/RainbowVis-JS
            // Library for colour data visualization. Map numbers to a smooth-transitioning colour legend.
            orangeLow = new Rainbow();
            orangeLow.setSpectrum("#FF7416", "#FFB836");
            orangeLow.setNumberRange(alarmMinTempLimit+1, comfortMinTemp-1);

            orangeHigh = new Rainbow();
            orangeHigh.setSpectrum("#FFB836", "#FF7416");
            orangeHigh.setNumberRange(comfortMaxTemp+1, alarmMaxTempLimit-1);

            redHigh = new Rainbow();
            redHigh.setSpectrum("#FF4E3D", "#E01931");
            redHigh.setNumberRange(alarmMaxTempLimit, alarmMaxTempLimit+10);

            redLow = new Rainbow();
            redLow.setSpectrum("#E01931", "#FF4E3D");
            redLow.setNumberRange(alarmMinTempLimit-10, alarmMinTempLimit);

            alarmMaxTempLimit = settings[0].max_temp_alarm;
            alarmMinTempLimit = settings[0].min_temp_alarm;
            comfortMaxTemp = settings[0].max_temp_comfort;
            comfortMinTemp = settings[0].min_temp_comfort;


            // SWITCH BUTTONS
            var max_temp_alarm_switch = settings[0].max_temp_alarm_active;
            var min_temp_alarm_switch = settings[0].min_temp_alarm_active;
            var max_temp_comfort_switch = settings[0].max_temp_comfort_active;
            var min_temp_comfort_switch = settings[0].min_temp_comfort_active;

            if (max_temp_alarm_switch) {
                console.log(max_temp_alarm_switch);
                $("#max_temp_alarm").bootstrapSwitch('state', true);
            } else {
                $("#max_temp_alarm").bootstrapSwitch('state', false);
            }
            if (min_temp_alarm_switch) {
                $("#min_temp_alarm").bootstrapSwitch('state', true);
            } else {
                $("#min_temp_alarm").bootstrapSwitch('state', false);
            }
            if (max_temp_comfort_switch) {
                $("#max_temp_comfort").bootstrapSwitch('state', true);
            } else {
                $("#max_temp_comfort").bootstrapSwitch('state', false);
            }
            if (min_temp_comfort_switch) {
                console.log(max_temp_alarm_switch);
                $("#min_temp_comfort").bootstrapSwitch('state', true);
            } else {
                $("#min_temp_comfort").bootstrapSwitch('state', false);
            }

            deferred.resolve();

        }  else {
            console.log('Read not Successful');
            deferred.reject('Read not Successful');
        }
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
        deferred.reject('Read settings fail');
    });

    return deferred.promise();
}

function switchButtonCheckIfActive(id) {

    if ($(id).is(':checked')){
        return true;
    } else {
        return false;
    }
}

// SAVE SETTINGS TO DB
function saveSettings() {

    // Retrieve value from input fields
    var product_id = $("#formControlsProductID").val();
    var product_alias = $("#formControlsProductAlias").val();
    var max_temp_alarm = $("#formControlsMaxAlarm").val();
    var min_temp_alarm = $("#formControlsMinAlarm").val();
    var max_temp_comfort = $("#formControlsMaxComfort").val();
    var min_temp_comfort = $("#formControlsMinComfort").val();

    // STORE TEMPERATURE SETTINGS SWITCH BUTTONS' STATE
    var max_temp_alarm_active;
    var min_temp_alarm_active;
    var max_temp_comfort_active;
    var min_temp_comfort_active;

    max_temp_alarm_active = switchButtonCheckIfActive("#max_temp_alarm");
    min_temp_alarm_active = switchButtonCheckIfActive("#min_temp_alarm");
    max_temp_comfort_active = switchButtonCheckIfActive("#max_temp_comfort");
    min_temp_comfort_active = switchButtonCheckIfActive("#min_temp_comfort");

    var request = $.ajax({
        url: "/api/updateSettings",
        type: "POST",
        data: {product_id: product_id, product_alias: product_alias, max_temp_alarm: max_temp_alarm, min_temp_alarm: min_temp_alarm, max_temp_comfort: max_temp_comfort, min_temp_comfort: min_temp_comfort,
            max_temp_alarm_active: max_temp_alarm_active, min_temp_alarm_active: min_temp_alarm_active, max_temp_comfort_active: max_temp_comfort_active, min_temp_comfort_active: min_temp_comfort_active},
        cache: false
    });

    request.done(function(msg) {

        if (msg == "updateSuccessful") {
            console.log("Update Successful");
        }  else {
            console.log('Update not Successful');
            console.log(msg);
        }
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
    });
}

function getCurrentTemp() {

        var request = $.ajax({
            url: "api/getChannelFeeds",
            type: "POST",
            data: {},
            cache: false
        });

        request.done(function(msg) {

            if (msg == "noFeed") {
                console.log("No feed were found.");
                return;
            } else {
                var currentTemp = msg[0].field1;
                var createdAt = msg[0].created_at;
                var entryID = msg[0].entry_id;

                var localTimestamp = new Date(createdAt);
                var localTimestampString = dateFormat(localTimestamp, 'yyyy-mm-dd HH:MM:ss');

                currentTemp = 12;

                var tempData = {currentTemp: currentTemp, createdAt: localTimestampString};
                ReactDOM.render(<DispTempData tempData={tempData}/>, document.getElementById('root'));

/*
                $("#root").hide();
*/
                if (currentTemp <= alarmMinTempLimit) {
                    var redColorLow = redLow.colourAt(currentTemp);
                    var redColorHex = "#" + redColorLow;
                    $(".dispTempData").css("background-color", redColorHex); //RED LOW
                }
                else if (currentTemp >= alarmMaxTempLimit) {
                    var redColorHigh = redHigh.colourAt(currentTemp);
                    var redColorHex = "#" + redColorHigh;
                    $(".dispTempData").css("background-color", redColorHex); //RED HIGH
                }
                else if ((alarmMinTempLimit < currentTemp && currentTemp < comfortMinTemp)) {
                    var orangeColorLow = orangeLow.colourAt(currentTemp);
                    var orangeColorHex = "#" + orangeColorLow;
                    $(".dispTempData").css("background-color", orangeColorHex); //ORANGE
                }
                else if ((comfortMaxTemp < currentTemp && currentTemp < alarmMaxTempLimit)) {
                    var orangeColorHigh = orangeHigh.colourAt(currentTemp);
                    var orangeColorHex = "#" + orangeColorHigh;
                    $(".dispTempData").css("background-color", orangeColorHex); //ORANGE
                }
                else if (comfortMinTemp <= currentTemp && currentTemp <= comfortMaxTemp) {
                    $(".dispTempData").css("background-color", "#76C760"); //GREEN
                }

                var now = new Date();
                var localTimestampNow = new Date(now);

/*                console.log("Now         : " + localTimestampNow);
                console.log("Last reading: " + localTimestamp)*/

                // http://stackoverflow.com/questions/18623783/get-the-time-difference-between-two-datetimes
                // Attributions to Matt Johnson
                // Get the time between two date times
                var timeFromLastReadingSeconds = moment.utc(moment(now).diff(moment(localTimestamp))).format("HH:mm:ss")

                var diffMs = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(localTimestamp,"DD/MM/YYYY HH:mm:ss"));
                var diffDuration = moment.duration(diffMs);
                var s = Math.floor(diffDuration.asHours()) + moment.utc(diffMs).format(":mm:ss");

                var timeFromLastReadingDays = diffDuration._days;
                var timeFromLastReadingMinutes = diffDuration._data.minutes;

/*
                console.log("Time from last reading: " + timeFromLastReadingSeconds + " s");
*/

                timeFromLastReadingDays = 0;
                timeFromLastReadingMinutes = 2;

                if (timeFromLastReadingDays > 0 || timeFromLastReadingMinutes >= 3) {
                    $(".dispTimeData").css("background-color", "#E01931"); //RED

                    function blink(selector){
                        $(selector).fadeOut(1200, function(){
                            $(this).fadeIn(1200, function(){
                                blink(this);
                            });
                        });
                    }
                    blink('.dispTimeData');
                }
            }
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
}

function Settings () {
    console.log("in settings");
    $("#root").hide();
    ReactDOM.render(formInstance, document.getElementById('settings'));
}