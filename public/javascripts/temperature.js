/**
 * Created by ministini on 2016-10-23.
 */

let map;
let marker;

let settings = {};
let tempDataSerie = {temp: [], timestamp: [], timestamp_raw: [], lat: [], lon: []};
let myLineChart;

let getCurrentTempGlobal;

$(document).ready(function() {

    // Close navbar on click - http://stackoverflow.com/questions/21203111/bootstrap-3-collapsed-menu-doesnt-close-on-click
    $(document).on('click','.navbar-collapse.in',function(e) {
        if( $(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle' ) {
            $(this).collapse('hide');
        }
    });

    // Check type of user device
    var md = new MobileDetect(window.navigator.userAgent);
    /*    console.log("md: " );
     console.log(md.mobile());*/
    if (md.mobile()) {
        $('html').addClass('mobile');
    } else {
        $('html').addClass('noMobile');
    }
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
        getCurrentTempGlobal = function() {

            // Default number of entries to show on temperature chart: 20
            let number_of_chart_entries = settings.entries;
            if (!number_of_chart_entries) {
                number_of_chart_entries = 20;
            }
            getCurrentTemp(marker, number_of_chart_entries);
        };
        getCurrentTempGlobal();

        // Read temperature every 20 sec
        var counter = 0;
        setInterval(function () {
            getCurrentTempGlobal();
            counter = counter + 20;
        }, 20000);
    });

    // Add help image as popup on click on help-button
    $("[name='my-popover']").popover({
        content: "<img src='images/helpTemp.png'  id='settingsHelpImage' />",
        html: true,
        viewport: {selector: "#settingsOutline"}
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
    saveInputOnKeyup("#formControlsNumberOfChartEntries");

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

    request.done(function(msg) {

        if (msg) {
            console.log("Read Successful");

            // Read settings and write values into form
            settings.product_alias = msg[0].product_alias;
            settings.max_temp_alarm = msg[0].max_temp_alarm;
            settings.min_temp_alarm = msg[0].min_temp_alarm;
            settings.max_temp_comfort = msg[0].max_temp_comfort;
            settings.min_temp_comfort = msg[0].min_temp_comfort;
            settings.entries = msg[0].chart_entries;
            $("#formControlsProductAlias").val(settings.product_alias);
            $("#formControlsMaxAlarm").val(settings.max_temp_alarm);
            $("#formControlsMinAlarm").val(settings.min_temp_alarm);
            $("#formControlsMaxComfort").val(settings.max_temp_comfort);
            $("#formControlsMinComfort").val(settings.min_temp_comfort);
            $("#formControlsNumberOfChartEntries").val(settings.entries);

            // SWITCH BUTTONS
            settings.max_temp_alarm_switch = msg[0].max_temp_alarm_active;
            settings.min_temp_alarm_switch = msg[0].min_temp_alarm_active;
            settings.max_temp_comfort_switch = msg[0].max_temp_comfort_active;
            settings.min_temp_comfort_switch = msg[0].min_temp_comfort_active;

            // READS AND SETS SWITCH BUTTON STATE
            setSwitchState(settings.max_temp_alarm_switch, "#max_temp_alarm");
            setSwitchState(settings.min_temp_alarm_switch, "#min_temp_alarm");
            setSwitchState(settings.max_temp_comfort_switch, "#max_temp_comfort");
            setSwitchState(settings.min_temp_comfort_switch, "#min_temp_comfort");

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
    return $(id).is(':checked');
}

function removeErrors(formControlID) {
    $(formControlID + "Group").removeClass("has-error");
    $(formControlID + "Feedback").html("");
}

// UPDATE SETTINGS IN DB
function saveSettings() {

    // Retrieve value from input fields
    var product_id = $("#formControlsProductID").val();
    var product_alias = $("#formControlsProductAlias").val();
    var max_temp_alarm = $("#formControlsMaxAlarm").val();
    var min_temp_alarm = $("#formControlsMinAlarm").val();
    var max_temp_comfort = $("#formControlsMaxComfort").val();
    var min_temp_comfort = $("#formControlsMinComfort").val();
    var entries = $("#formControlsNumberOfChartEntries").val();

    // STORE TEMPERATURE SETTINGS SWITCH BUTTONS' STATE
    var max_temp_alarm_active = switchButtonCheckIfActive("#max_temp_alarm");
    var min_temp_alarm_active = switchButtonCheckIfActive("#min_temp_alarm");
    var max_temp_comfort_active = switchButtonCheckIfActive("#max_temp_comfort");
    var min_temp_comfort_active = switchButtonCheckIfActive("#min_temp_comfort");

    removeErrors("#formControlsMaxAlarm");
    removeErrors("#formControlsMinAlarm");
    removeErrors("#formControlsMaxComfort");
    removeErrors("#formControlsMinComfort");
    removeErrors("#formControlsNumberOfChartEntries");

    var request = $.ajax({
        url: "/api/updateSettings",
        type: "POST",
        data: {product_id: product_id, product_alias: product_alias, max_temp_alarm: max_temp_alarm, min_temp_alarm: min_temp_alarm, max_temp_comfort: max_temp_comfort, min_temp_comfort: min_temp_comfort,
            max_temp_alarm_active: max_temp_alarm_active, min_temp_alarm_active: min_temp_alarm_active, max_temp_comfort_active: max_temp_comfort_active, min_temp_comfort_active: min_temp_comfort_active, entries: entries},
        cache: false
    });

    request.done(function(msg) {

        if (msg == "updateSuccessful") {
            console.log("Update Successful");

            settings.product_alias = product_alias;
            settings.max_temp_alarm = parseInt(max_temp_alarm);
            settings.min_temp_alarm = parseInt(min_temp_alarm);
            settings.max_temp_comfort = parseInt(max_temp_comfort);
            settings.min_temp_comfort = parseInt(min_temp_comfort);
            settings.entries = parseInt(entries);

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
                if (key === "entries") {
                    formControlField = "#formControlsNumberOfChartEntries";
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

function getTemperatureColor(temperature) {

    // Keep the DEFAULT COLOR
    if (! (settings.max_temp_alarm_switch || settings.min_temp_alarm_switch || settings.max_temp_comfort_switch || settings.min_temp_comfort_switch)) {
        return "default";
    }
    // ALARM COLOR
    if ((settings.min_temp_alarm_switch && temperature <= settings.min_temp_alarm) ||
        (settings.max_temp_alarm_switch && temperature >= settings.max_temp_alarm)) {
        return "alarm";
    }
    // WARNING COLOR HIGH END GRADIENT
    if (settings.min_temp_alarm_switch && settings.min_temp_comfort_switch && temperature < settings.min_temp_comfort) {
        return "low_gradient_warning";
    }
    // WARNING COLOR LOW END GRADIENT
    if (settings.max_temp_alarm_switch && settings.max_temp_comfort_switch && temperature > settings.max_temp_comfort) {
        return "high_gradient_warning";
    }
    // WARNING COLOR, HIGH AND LOW END, NO GRADIENT
    if ((settings.min_temp_comfort_switch && temperature < settings.min_temp_comfort) ||
        (settings.max_temp_comfort_switch && temperature > settings.max_temp_comfort)) {
        return "warning";
    }
    // COMFORT COLOR (WITHIN COMFORT INTERVAL)
    return "comfort";
}

// Retrieves the last 10 temperature data entries
function getCurrentTemp(marker, number_of_entries) {

    var request = $.ajax({
            url: "api/getChannelFeeds",
            type: "POST",
            data: {number_of_entries: number_of_entries},
            cache: false
        });

        request.done(function(msg) {

            if (msg == "noFeed") {
                console.log("No feed were found.");

            } else {

                tempDataSerie["timestamp"] = [];
                tempDataSerie["timestamp_raw"] = [];
                tempDataSerie["temp"] = [];
                tempDataSerie["lat"] = [];
                tempDataSerie["lon"] = [];

                for (let i = 0; i < msg[0].feeds.length; i++) {

                    let created_at_tmp = msg[0].feeds[i].created_at;
                    let currentTemp_tmp = parseFloat(msg[0].feeds[i].field1);
                    let lat_tmp = parseFloat(msg[0].feeds[i].field2);
                    let lon_tmp = parseFloat(msg[0].feeds[i].field3);

                    var localTimestamp_tmp = new Date(created_at_tmp);
                    var localTimestampString_tmp = dateFormat(localTimestamp_tmp, 'yyyy-mm-dd HH:MM:ss');

                    tempDataSerie["timestamp_raw"].push(localTimestamp_tmp);
                    tempDataSerie["timestamp"].push(localTimestampString_tmp);
                    tempDataSerie["temp"].push(currentTemp_tmp);
                    tempDataSerie["lat"].push(lat_tmp);
                    tempDataSerie["lon"].push(lon_tmp);
                }

                // Retrieves the last temperature data entry
                var currentTemp = tempDataSerie["temp"][tempDataSerie["temp"].length - 1];
                var localTimestamp = tempDataSerie["timestamp_raw"][tempDataSerie["timestamp"].length - 1];
                var localTimestampString = tempDataSerie["timestamp"][tempDataSerie["timestamp"].length - 1];
                var lat = tempDataSerie["lat"][tempDataSerie["lat"].length - 1];
                var lon = tempDataSerie["lon"][tempDataSerie["lon"].length - 1];

                if (myLineChart) {
                    myLineChart.data.datasets[0].data = tempDataSerie["temp"];
                    myLineChart.data.labels = tempDataSerie["timestamp"];
                    myLineChart.update();
                }

                // Displays the latest temperature data
                var tempData = {currentTemp: currentTemp, createdAt: localTimestampString};
                ReactDOM.render(<DispTempData tempData={tempData}/>, document.getElementById('temperatureDisplay'));

                ////////////////////////////////////////////////////////////////////////////////////////////
                // SET COLORS BASED ON TEMPERATURE AND TEMPERATURE SETTINGS
                // IF NO SWITCH IS ON: KEEP DEFAULT BLUE COLOR
                // [ALARM T, ∞) RED
                // [COMFORT MIN, COMFORT MAX] GREEN
                // (COMFORT MAX, ALARM MAX) ORANGE GRADIENT
                // (ALARM MIN, COMFORT MIN) ORANGE GRADIENT
                // !ALARM: - (COMFORT, ∞) 0R (-∞, COMFORT) SINGLE ORANGE COLOR
                // NOTE: ALARM MAX > COMFORT MAX > COMFORT MIN > ALARM MIN
                // NO SETTING IS REQUIRED. ALL COMBINATIONS ARE ACCEPTED.
                // THE TEMPERATURE MAX AND MIN SETTINGS ARE HANDLED ON THE SERVER SIDE

                let currentColor = getTemperatureColor(currentTemp);

                // https://github.com/anomal/RainbowVis-JS
                // Library for colour data visualization. Map numbers to a smooth-transitioning colour legend.
                let orangeAlarm = "#FF7416";    // The orange color closest to alarm temp limit   (darkest)
                let orangeComfort = "#FFB836";  // The orange color closest to comfort temp limit (brightest)
                let red = "#EB4549";
                let green = "#76C760";
                let defaultBlue = "rgba(0,0,0,0.0)";

                if (currentColor === "default") {
                    $(".dispTempData").css("background-color", defaultBlue);                            //DEFAULT BLUE

                } else if (currentColor === "alarm") {
                    $(".dispTempData").css("background-color", red);                                    //RED

                } else if (currentColor === "low_gradient_warning") {
                    var rainbowLG = new Rainbow();
                    rainbowLG.setSpectrum(orangeAlarm, orangeComfort);
                    rainbowLG.setNumberRange(settings.min_temp_alarm+1, settings.min_temp_comfort-1);   //(alarmMin, comfortMin).
                    let color = rainbowLG.colourAt(currentTemp);
                    let colorHex = "#" + color;
                    $(".dispTempData").css("background-color", colorHex);                               //ORANGE LOW END GRADIENT

                } else if (currentColor === "high_gradient_warning") {
                    var rainbowHG = new Rainbow();
                    rainbowHG.setSpectrum(orangeComfort, orangeAlarm);
                    rainbowHG.setNumberRange(settings.max_temp_comfort+1, settings.max_temp_alarm-1);   //(comfortMax, alarmMax)
                    let color = rainbowHG.colourAt(currentTemp);
                    let colorHex = "#" + color;
                    $(".dispTempData").css("background-color", colorHex);                               //ORANGE HIGH END GRADIENT

                } else if (currentColor === "warning") {
                    $(".dispTempData").css("background-color", orangeAlarm);                            //SINGLE ORANGE COLOR

                } else if (currentColor === "comfort") {
                    $(".dispTempData").css("background-color", green);                                  //GREEN

                }

                var now = new Date();
                var localTimestampNow = new Date(now);

/*                console.log("Now         : " + localTimestampNow);
                console.log("Last reading: " + localTimestamp);*/

                // http://stackoverflow.com/questions/18623783/get-the-time-difference-between-two-datetimes
                // Attributions to Matt Johnson
                // Get the time between two date times
                var timeFromLastReadingSeconds = moment.utc(moment(now).diff(moment(localTimestamp))).format("HH:mm:ss")

                var diffMs = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(localTimestamp,"DD/MM/YYYY HH:mm:ss"));
                var diffDuration = moment.duration(diffMs);
                var s = Math.floor(diffDuration.asHours()) + moment.utc(diffMs).format(":mm:ss");

                var timeFromLastReadingDays = diffDuration._days;
                var timeFromLastReadingMinutes = diffDuration._data.minutes;
                var timeFromLastReadingHours = diffDuration._data.hours;

/*
                console.log("Time from last reading: " + timeFromLastReadingSeconds + " s");
*/

/*                timeFromLastReadingDays = 0;
                timeFromLastReadingMinutes = 2;*/

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

                // Add popup to map with temperature, time and product info
                var popupContent = "<b>" + settings.product_alias + "</b><br>Current&nbsptemp: " + currentTemp + " °C.<br> Time from last reading: ";
                if (timeFromLastReadingDays === 1) {
                    popupContent += timeFromLastReadingDays + " day.";
                } else if (timeFromLastReadingDays > 1) {
                    popupContent += timeFromLastReadingDays + " days.";
                } else {
                    if (timeFromLastReadingHours > 0) {
                        popupContent += timeFromLastReadingHours + " hours and ";
                    }
                    popupContent += timeFromLastReadingMinutes + " minutes.";
                }

                // If temperature sensor's location is available - set map view to the sensor's position
                // Otherwise keep the default view bounds of Sweden
                if (map && lat && lon) {
                    var latlng = L.latLng(lat, lon);
                    marker = L.marker(latlng).addTo(map);
                    marker.bindPopup(popupContent);
                    map.flyTo(latlng, 14);
                }
            }
        });

        request.fail(function(jqXHR, textStatus) {
            console.log(textStatus);
        });
}

function tempChart() {
    console.log("in tempChart");

    getCurrentTempGlobal();

    // If chart already initiated - do nothing
    if (myLineChart) {
        return;
    }

    var ctx = $("#tempChart");
    var options = {
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                scaleLabel: {
                    display: true,
                    position: 'top',
                    labelString: 'T °C'
                }
            }]
        }
    };

    var data = {
        labels:  tempDataSerie["timestamp"],
        datasets: [
            {
                label: "Temperature (°C)",
                fill: false,
                lineTension: 0.1,
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: "rgba(75,192,192,1)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(75,192,192,1)",
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: tempDataSerie["temp"],
                spanGaps: false
            }
        ]
    };
    myLineChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

function show_page(page_name) {

    // Make sure the popup closes when choosing a tab in navbar
    if (map) {
        map.closePopup();
    }

    $("#temperatureDisplay").hide();
    $("#settingsPageOutline").hide();
    $("#mapID").hide();
    $("#chart").hide();

    if (page_name == "settings") {
        $("#settingsPageOutline").show();
    } else if (page_name === "temperature") {
        $("#temperatureDisplay").show();
        temperatureDisplay();
    } else if (page_name === "location") {
        console.log("in show_page location");
        $("#mapID").show();
        showLocation();

    }  else if (page_name === "tempChart") {
        $("#tempChart").show();
        $("#chart").show();
        tempChart();
    }
}