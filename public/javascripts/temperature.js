/**
 * Created by ministini on 2016-10-23.
 */

let orangeLow;
let orangeHigh;

let alarmMaxTempLimit;
let alarmMinTempLimit;
let comfortMinTemp;
let comfortMaxTemp;

let max_temp_alarm_switch;
let min_temp_alarm_switch;
let max_temp_comfort_switch;
let min_temp_comfort_switch;

var marker;

$(document).ready(function() {

    // Check type of user device
    var md = new MobileDetect(window.navigator.userAgent);
    /*    console.log("md: " );
     console.log(md.mobile());*/
    if (md.mobile()) {
        $('html').addClass('mobile');
    } else {
        $('html').addClass('noMobile');
    }

/*    // FIXME
    $("#formControlsProductID").val("2A");
    var product_id = $("#formControlsProductID").val();*/




/*    // Do not save any changes to input form before all values are read from DB
    var combinedPromise = $.when(readSettings(product_id));
    combinedPromise.done(function() {
        inputChangeDetection();
    });*/

    // Initiate map
    var mymap = L.map('mapID').setView([57.704005, 11.967924], 14);
    var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 17,
        minZoom: 8
    }).addTo(mymap);
    marker = L.marker([57.704005, 11.967924]).addTo(mymap);

/*    getCurrentTemp(marker);

    // Read temperature every 20 sec
    var counter = 0;
    setInterval(function(){
        getCurrentTemp(marker);
        counter = counter + 20;
    }, 20000);

    // Add help image as popup on click on help-button
    $("[name='my-popover']").popover({
        content: "<img src='images/helpTemp.png'  id='settingsHelpImage' />",
        html: true,
        viewport: {selector: "#show_pageline"}
    });*/

    show_page("temperature");

});

function temperatureDisplay() {
    // FIXME
    $("#formControlsProductID").val("2A");
    var product_id = $("#formControlsProductID").val();

    // Do not save any changes to input form before all values are read from DB
    var combinedPromise = $.when(readSettings(product_id));
    combinedPromise.done(function() {
        inputChangeDetection();
    });

    getCurrentTemp(marker);

    // Read temperature every 20 sec
    var counter = 0;
    setInterval(function(){
        getCurrentTemp(marker);
        counter = counter + 20;
    }, 20000);

    // Add help image as popup on click on help-button
    $("[name='my-popover']").popover({
        content: "<img src='images/helpTemp.png'  id='settingsHelpImage' />",
        html: true,
        viewport: {selector: "#show_pageline"}
    });

}


// FORM INPUT FIELD - save input automatically
// Input: "#formControlField"
function saveInputOnKeyup(formControlField) {
    $(formControlField).bind("keyup change", function(){
        saveSettings();
    });
}

// SWITCHBUTTON - save state automatically
// Input: "#formControlField"
function switchbuttonAutoSaveState(formControlField) {
    $(formControlField).on('switchChange.bootstrapSwitch', function () {
        saveSettings();
    });
}

function inputChangeDetection() {

    // Settings form - save changes automatically
    saveInputOnKeyup("#formControlsProductAlias");
    saveInputOnKeyup("#formControlsMaxAlarm");
    saveInputOnKeyup("#formControlsMinAlarm");
    saveInputOnKeyup("#formControlsMaxComfort");
    saveInputOnKeyup("#formControlsMinComfort");

    // Settings switch buttons - save state automatically
    switchbuttonAutoSaveState('#max_temp_alarm');
    switchbuttonAutoSaveState('#min_temp_alarm');
    switchbuttonAutoSaveState('#max_temp_comfort');
    switchbuttonAutoSaveState('#min_temp_comfort');
}

// Sets switch state by reading state from DB
// Takes switchID (value from DB) and switchFormID (form switch identification) as input
// input switchFormID as "#switchFormID"
function setSwitchState(switchID, switchFormID) {
    if (switchID) {
        $(switchFormID).bootstrapSwitch('state', true);
    } else {
        $(switchFormID).bootstrapSwitch('state', false);
    }
}

// READ SETTINGS FROM DB
// Takes the temp sensor product id as input
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

            // SWITCH BUTTONS
            max_temp_alarm_switch = settings[0].max_temp_alarm_active;
            min_temp_alarm_switch = settings[0].min_temp_alarm_active;
            max_temp_comfort_switch = settings[0].max_temp_comfort_active;
            min_temp_comfort_switch = settings[0].min_temp_comfort_active;

            // READS AND SETS SWITCH BUTTON STATE
            setSwitchState(max_temp_alarm_switch, "#max_temp_alarm");
            setSwitchState(min_temp_alarm_switch, "#min_temp_alarm");
            setSwitchState(max_temp_comfort_switch, "#max_temp_comfort");
            setSwitchState(min_temp_comfort_switch, "#min_temp_comfort");

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

/*    if ($(id).is(':checked')){
        return true;
    } else {
        return false;

    }*/

    return $(id).is(':checked');
}

// UPDATE SETTINGS IN DB
function saveSettings() {

    // CONTROL THAT comfort span within alarm max, min
    // CONTROL max alarm < min alarm, comf max < min max

    // Retrieve value from input fields
    var product_id = $("#formControlsProductID").val();
    var product_alias = $("#formControlsProductAlias").val();
    var max_temp_alarm = $("#formControlsMaxAlarm").val();
    var min_temp_alarm = $("#formControlsMinAlarm").val();
    var max_temp_comfort = $("#formControlsMaxComfort").val();
    var min_temp_comfort = $("#formControlsMinComfort").val();

    // STORE TEMPERATURE SETTINGS SWITCH BUTTONS' STATE
    var max_temp_alarm_active = switchButtonCheckIfActive("#max_temp_alarm");
    var min_temp_alarm_active = switchButtonCheckIfActive("#min_temp_alarm");
    var max_temp_comfort_active = switchButtonCheckIfActive("#max_temp_comfort");
    var min_temp_comfort_active = switchButtonCheckIfActive("#min_temp_comfort");

    $("#formControlsMaxAlarmGroup").removeClass("has-error");
    $("#formControlsMaxAlarmFeedback").html("");
    $("#formControlsMinAlarmGroup").removeClass("has-error");
    $("#formControlsMinAlarmFeedback").html("");
    $("#formControlsMaxComfortGroup").removeClass("has-error");
    $("#formControlsMaxComfortFeedback").html("");
    $("#formControlsMinComfortGroup").removeClass("has-error");
    $("#formControlsMinComfortFeedback").html("");

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
            console.log(msg.errors);

            // If any error occurred during update - highlight the input field and display error
            for (var key in msg.errors) {
                var formControlField;
                if (key === "max_temp_alarm") {
                    formControlField = "#formControlsMaxAlarm";
                }
                if (key === "min_temp_alarm") {
                    formControlField = "#formControlsMinAlarm";
                }
                if (key === "max_temp_comfort") {
                    formControlField = "#formControlsMaxComfort";
                }
                if (key === "min_temp_comfort") {
                    formControlField = "#formControlsMinComfort";
                }
                $(formControlField + "Group").addClass("has-error");
                $(formControlField + "Feedback").html(" " + msg.errors[key]);
            }
        }
    });

    request.fail(function(jqXHR, textStatus) {
        console.log(textStatus);
    });
}

function getCurrentTemp(marker) {

    var request = $.ajax({
            url: "api/getChannelFeeds",
            type: "POST",
            data: {},
            cache: false
        });

        request.done(function(msg) {

            if (msg == "noFeed") {
                console.log("No feed were found.");
            } else {

                var currentTemp = parseInt(msg[0].field1);
                var createdAt = msg[0].created_at;

                var localTimestamp = new Date(createdAt);
                var localTimestampString = dateFormat(localTimestamp, 'yyyy-mm-dd HH:MM:ss');


                currentTemp = 0;

                var tempData = {currentTemp: currentTemp, createdAt: localTimestampString};

                ReactDOM.render(<DispTempData tempData={tempData}/>, document.getElementById('temperatureDisplay'));

                // https://github.com/anomal/RainbowVis-JS
                // Library for colour data visualization. Map numbers to a smooth-transitioning colour legend.
                let orangeColorHigh;
                let orangeColorLow;
                let orangeColorHex;

                orangeLow = new Rainbow();
                orangeHigh = new Rainbow();
                orangeLow.setSpectrum("#FF7416", "#FFB836");
                orangeHigh.setSpectrum("#FFB836", "#FF7416");

                if (comfortMaxTemp && alarmMaxTempLimit) {
                    orangeHigh.setNumberRange(comfortMaxTemp+1, alarmMaxTempLimit-1);  // (comfortMax, alarmMax) - comf int.
                }
                if (comfortMinTemp && alarmMinTempLimit) {
                    orangeLow.setNumberRange(alarmMinTempLimit+1, comfortMinTemp-1);    // (alarmMin, comfortMin) - comf int.
                }

                // SET COLORS based on temperature and temperature settings
                // IF ANY SWITCH IS ON: DEFAULT TO GREEN
                if (max_temp_alarm_switch || min_temp_alarm_switch || max_temp_comfort_switch || min_temp_comfort_switch) {
                    $(".dispTempData").css("background-color", "#76C760"); //GREEN
                    console.log("green");
                }
                // ORANGE HIGH
                if (max_temp_comfort_switch) {
                    if (currentTemp > comfortMaxTemp) {
                        console.log("orange high currentTemp > comfortMaxTemp");
                        orangeColorHigh = orangeHigh.colourAt(currentTemp);
                        orangeColorHex = "#" + orangeColorHigh;
                        $(".dispTempData").css("background-color", orangeColorHex); //ORANGE
                    }
                }
                // ORANGE LOW
                if (min_temp_comfort_switch) {
                    if (currentTemp < comfortMinTemp) {
                        console.log("orange low currentTemp < comfortMinTemp");
                        orangeColorLow = orangeLow.colourAt(currentTemp);
                        orangeColorHex = "#" + orangeColorLow;
                        $(".dispTempData").css("background-color", orangeColorHex); //ORANGE
                    }
                }
                // RED HIGH
                if (max_temp_alarm_switch) {
                    if (currentTemp >= alarmMaxTempLimit) {
                        console.log("red high currentTemp >= alarmMaxTempLimit");
                        $(".dispTempData").css("background-color", "#EB4549"); //RED
                    } // ORANGE HIGH - Bounded above by max alarm
                    if (max_temp_comfort_switch) {
                        if (currentTemp > comfortMaxTemp && currentTemp < alarmMaxTempLimit) {
                            console.log("red high currentTemp > comfortMaxTemp && currentTemp < alarmMaxTempLimit");

                            orangeColorHigh = orangeHigh.colourAt(currentTemp);
                            orangeColorHex = "#" + orangeColorHigh;
                            $(".dispTempData").css("background-color", orangeColorHex); //ORANGE HIGH
                        }
                    }
                }
                // RED LOW
                if (min_temp_alarm_switch) {
                    if (currentTemp <= alarmMinTempLimit) {
                        $(".dispTempData").css("background-color", "#EB4549"); //RED // FIXME Or E01931
                        console.log(" red low currentTemp <= alarmMinTempLimit");
                    } // ORANGE LOW - Bounded below by min alarm
                    if (min_temp_comfort_switch) {
                        if (currentTemp < comfortMinTemp && currentTemp > alarmMinTempLimit) {
                            console.log(" red low currentTemp < comfortMaxTemp && currentTemp > alarmMinTempLimit");
                            orangeColorLow = orangeLow.colourAt(currentTemp);
                            orangeColorHex = "#" + orangeColorLow;
                            $(".dispTempData").css("background-color", orangeColorHex); //ORANGE LOW
                        }
                    }
                }

                var now = new Date();
                var localTimestampNow = new Date(now);

                console.log("Now         : " + localTimestampNow);
                console.log("Last reading: " + localTimestamp)

                // http://stackoverflow.com/questions/18623783/get-the-time-difference-between-two-datetimes
                // Attributions to Matt Johnson
                // Get the time between two date times
                var timeFromLastReadingSeconds = moment.utc(moment(now).diff(moment(localTimestamp))).format("HH:mm:ss")

                var diffMs = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(localTimestamp,"DD/MM/YYYY HH:mm:ss"));
                var diffDuration = moment.duration(diffMs);
                var s = Math.floor(diffDuration.asHours()) + moment.utc(diffMs).format(":mm:ss");

                var timeFromLastReadingDays = diffDuration._days;
                var timeFromLastReadingMinutes = diffDuration._data.minutes;

                console.log("Time from last reading: " + timeFromLastReadingSeconds + " s");

                timeFromLastReadingDays = 0;
                timeFromLastReadingMinutes = 2;

                if (timeFromLastReadingDays > 0 || timeFromLastReadingMinutes >= 3) {
                    $(".dispTimeData").css("background-color", "#EB4549"); //RED

                    function blink(selector){
                        $(selector).fadeOut(1200, function(){
                            $(this).fadeIn(1200, function(){
                                blink(this);
                            });
                        });
                    }
                    blink('.dispTimeData');
                }

                console.log("Trying to update temp...");

                // Add popup to map with temp and user info
                var popupContent = "<b>Challe's car</b><br>Current&nbsptemp: " + currentTemp + " °C.<br> Time from last reading: ";
                if (timeFromLastReadingDays === 1) {
                    popupContent += timeFromLastReadingDays + " day.";
                } else if (timeFromLastReadingDays > 1) {
                    popupContent += timeFromLastReadingDays + " days.";
                } else {
                    popupContent += timeFromLastReadingMinutes + " minutes.";
                }
                marker.bindPopup(popupContent);

            }
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
}


function show_page(page_name) {
    console.log("in show_page");

    $("#temperatureDisplay").hide();
    $("#settingsPageOutline").hide();
    $("#mapID").hide();

    $('html').removeClass('location');

    if (page_name == "settings") {
        $("#settingsPageOutline").show();
    } else if (page_name == "temperature") {
        $("#temperatureDisplay").show();
        temperatureDisplay();
    } else if (page_name == "location") {
        console.log("in show_page location");

        $("#mapID").show();
        location();

        $('html').addClass('location');
    }
}

function settings() {
    console.log("in settings");
    show_page("settings");
}
