var dashboardName = ''
var date = new Date();
var day = date.getDate();
if (day.toString().length == 1) {
    day = `0${day}`;
}
var month
var year
var monthsAbbrev = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
var monthName
getUserLevelFilters()
var mode = 'edit'
var filterString = ``
var filterStringForId = ``
var userLevelFilterString = ``
var userLevelFilterStringForId = ``
var vFilter = ``
var bFilter = ``
var sFilter = ``
var monthFilter = ``
var filterArray = []
var uL = `VNAME`
var uLName = 'VERTICAL'

function getVertical() {
    let verticals = document.getElementById('VerticalDashboardFilter');
    let bucketId = sessionStorage.getItem('bucketId')
    const myUrl = new URL(window.location.toLocaleString()).searchParams;
    var userId = myUrl.get('uid')
    let newObj = {};
    newObj['bucketId'] = bucketId
    newObj["userId"] = userId
    
    $.ajax({
        "url": `/index/getVertical`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(newObj)
    }).done(function (data) {
        console.log(data);
        let html = '<option value="All" selected="selected">SELECT ALL</option>';
        vFilter = `VNAME IN (`

        for (var i = 0; i < data.length; i++) {
            if (i == 0) {
                vFilter += `'${data[i].VNAME}'`
            } else {
                vFilter += `,'${data[i].VNAME}'`
            }
            html += `<option value="${data[i].VNAME}">${data[i].VNAME}</option>`;
        }
        vFilter += `)`
        verticals.innerHTML = html;
        $('#VerticalDashboardFilter').val('All').trigger('change')
    }).fail(function(xhr, status, error) {
        console.error('Error loading verticals:', error);
        verticals.innerHTML = '<option value="All">SELECT ALL</option>';
    });

    var site = document.getElementById('SiteDashboardFilter');
    var business = document.getElementById('BusinessDashboardFilter');
    site.innerHTML = `<option value="">Select</option>`;
    business.innerHTML = `<option value="">Select</option>`;
}

function getBusiness(select) {
    if (select.value === 'All') {
        document.getElementById('BusinessDashboardFilter').innerHTML = `<option value="All">SELECT ALL</option>`
        document.getElementById('SiteDashboardFilter').innerHTML = `<option value="All">SELECT ALL</option>`
        document.getElementById('SiteDashboardFilter').setAttribute('disabled', 'true')
        document.getElementById('BusinessDashboardFilter').setAttribute('disabled', 'true')
    } else {
        document.getElementById('SiteDashboardFilter').removeAttribute('disabled')
        document.getElementById('BusinessDashboardFilter').removeAttribute('disabled')
        if (select.value != "") {
            let business = document.getElementById('BusinessDashboardFilter')
            let bucketId = sessionStorage.getItem('bucketId')
            const myUrl = new URL(window.location.toLocaleString()).searchParams;
            var userId = myUrl.get('uid')
            let newObj = {};
            newObj['bucketId'] = bucketId
            newObj["userId"] = userId
            newObj['vertical'] = select.value

            $.ajax({
                "url": `/index/getBusiness`,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(newObj)
            }).done(function (data) {
                let html = '<option value="All">SELECT ALL</option>';
                bFilter = `BUNAME IN (`
                for (var i = 0; i < data.length; i++) {
                    if (i == 0) {
                        bFilter += `'${data[i].BUNAME}'`
                    } else {
                        bFilter += `,'${data[i].BUNAME}'`
                    }
                    html += `<option value="${data[i].BUNAME}">${data[i].BUNAME} </option>`;
                }
                bFilter += `)`
                business.innerHTML = html
                $('#BusinessDashboardFilter').val(data[0]?.BUNAME).trigger('change')
            }).fail(function(xhr, status, error) {
                console.error('Error loading businesses:', error);
                business.innerHTML = '<option value="All">SELECT ALL</option>';
            });
            var site = document.getElementById('SiteDashboardFilter');
            site.innerHTML = `<option value="">Select</option>`;
        }
    }
}

function getSite(select) {
    if (select.value === 'All') {
        document.getElementById('SiteDashboardFilter').innerHTML = `<option value="All">SELECT ALL</option>`
        document.getElementById('SiteDashboardFilter').setAttribute('disabled', 'true')
    } else {
        document.getElementById('SiteDashboardFilter').removeAttribute('disabled')
        if (select.value != "") {
            let site = document.getElementById('SiteDashboardFilter');
            let bucketId = sessionStorage.getItem('bucketId')
            const myUrl = new URL(window.location.toLocaleString()).searchParams;
            var userId = myUrl.get('uid')
            let newObj = {}

            newObj['bucketId'] = bucketId
            newObj["userId"] = userId
            newObj['Business'] = select.value
            $.ajax({
                "url": `/index/getSite`,
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify(newObj)
            }).done(function (data) {
                console.log(data);
                let html = '<option value="All">SELECT ALL</option>';
                sFilter = `SINAME IN (`

                for (var i = 0; i < data.length; i++) {
                    if (i == 0) {
                        sFilter += `'${data[i].SINAME}'`
                    } else {
                        sFilter += `,'${data[i].SINAME}'`
                    }
                    html += `<option value="${data[i].SINAME}">${data[i].SINAME} </option>`;
                }
                sFilter += `)`
                site.innerHTML = html
                $('#SiteDashboardFilter').val(data[0]?.SINAME).trigger('change')
            }).fail(function(xhr, status, error) {
                console.error('Error loading sites:', error);
                site.innerHTML = '<option value="All">SELECT ALL</option>';
            });
        }
    }
}

function getYearsFromSecAuto() {
    $.ajax({
        "url": `/index/getYearsFromSecAuto`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
    }).done(function (data) {
        document.getElementById('yearDashboardFilter').innerHTML = ``
        var yearOptions = ``

        data.forEach(year => {
            yearOptions += `<option value="${year.YEAR}">${year.YEAR}</option>`
        })
        document.getElementById('yearDashboardFilter').innerHTML = yearOptions
        getMonthFromSecAuto(`${data[0]?.YEAR}`)
    }).fail(function(xhr, status, error) {
        console.error('Error loading years:', error);
        document.getElementById('yearDashboardFilter').innerHTML = '<option value="2024">2024</option>';
        getMonthFromSecAuto('2024');
    });
}

function getMonthFromSecAuto(year) {
    var jsonObj = {}
    jsonObj["year"] = year
    $.ajax({
        "url": `/index/getMonthFromSecAuto`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        }, "data": JSON.stringify(jsonObj)
    }).done(function (data) {
        document.getElementById('monthDashboardFilter').innerHTML = ``
        var yearOptions = ``

        data.forEach(year => {
            yearOptions += `<option value="${year.MONTH}">${year.MONTHNAME}</option>`
        })
        document.getElementById('monthDashboardFilter').innerHTML = yearOptions
        getDate()
        setYearMonth()
    }).fail(function(xhr, status, error) {
        console.error('Error loading months:', error);
        document.getElementById('monthDashboardFilter').innerHTML = '<option value="1">January</option>';
        getDate();
        setYearMonth();
    });
}

function getDate() {
    var year1 = document.getElementById('yearDashboardFilter').value;
    var month1 = document.getElementById('monthDashboardFilter').value;

    var numberOfDays = new Date(year1, month1, 0).getDate();
    var dateDropdown = document.getElementById('DateDashboardFilter');
    dateDropdown.innerHTML = '';
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    var prevYear = currentDate.getFullYear();
    var prevMonth = currentDate.getMonth() + 1;
    var prevDay = currentDate.getDate();
    var prevDateFormatted = `${prevYear}-${prevMonth < 10 ? '0' + prevMonth : prevMonth}-${prevDay < 10 ? '0' + prevDay : prevDay}`;
    var defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Date';
    dateDropdown.appendChild(defaultOption);

    for (var day = 1; day <= numberOfDays; day++) {
        var option = document.createElement('option');
        var dayFormatted = day < 10 ? '0' + day : day;
        var monthFormatted = month1 < 10 ? '0' + month1 : month1;
        var formattedDate = `${year1}-${monthFormatted}-${dayFormatted}`;

        option.value = formattedDate;
        option.textContent = formattedDate;
        dateDropdown.appendChild(option);
        if (formattedDate === prevDateFormatted) {
            option.selected = true;
        }
    }
}

function setYearMonth() {
    var year1 = document.getElementById('yearDashboardFilter').value;
    var month1 = document.getElementById('monthDashboardFilter').value;
    var VID = document.getElementById('VerticalDashboardFilter').value;
    var BUID = document.getElementById('BusinessDashboardFilter').value;
    var SIID = document.getElementById('SiteDashboardFilter').value;
    var DATE = document.getElementById('DateDashboardFilter').value;
    var selectElement = document.getElementById("monthDashboardFilter");
    var selectedIndex = selectElement.selectedIndex;

    var selectedOption = selectElement.options[selectedIndex];
    var monthName1 = selectedOption.text;

    var dataFilterString = ``;
    if (VID === 'All') {
        dataFilterString = vFilter;
    } else {
        if (BUID === 'All') {
            dataFilterString = bFilter;
        } else {
            if (SIID === 'All') {
                dataFilterString = sFilter;
            }
        }
    }
    console.log(dataFilterString);

    var monthFilterString = ``;
    if (month1 === 'All') {
        monthFilterString = monthFilter;
    } else {
        monthFilterString = ` MONTHNAME = '${monthName1}'`;
    }

    month = month1;
    year = year1;
    monthName = monthName1;
    date = DATE;
    var dateIsValid = DATE && DATE.trim() !== '';
    var filterStringDropdown = ``;
    if (VID == 'All') {
        filterStringDropdown = `AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
    } else if (BUID == 'All') {
        filterStringDropdown = ` AND "VNAME" = '${VID}' AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
    } else if (SIID == 'All') {
        filterStringDropdown = ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''} AND ${dataFilterString}`;
    } else {
        filterStringDropdown = ` AND "VNAME" = '${VID}' AND "BUNAME" = '${BUID}' AND "SINAME" = '${SIID}' AND YEAR = ${year} AND ${monthFilterString} ${dateIsValid ? `AND DATE = '${DATE}'` : ''}`;
    }

    filterString = userLevelFilterString + filterStringDropdown;
    filterStringForId = userLevelFilterStringForId + ``;
    resolveLoadPageGrid()
        .then(() => {
            setUserView();
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function getUserLevelFilters() {
    const myUrl = new URL(window.location.toLocaleString()).searchParams;
    var userId = myUrl.get('uid')
    var jsonObj = {}
    jsonObj["userId"] = userId
    $.ajax({
        "url": `/index/getUserLevelFilters`,
        "method": "POST",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
        "data": JSON.stringify(jsonObj),
    }).done(function (data) {
        console.log(data, "User level filters loaded");
        if (data.length > 0) {
            sessionStorage.setItem('bucketId', parseInt(data[0].ANALYTICS_GROUPS_ID))
            dashboardName = `${data[0].ANALYTICS_GROUP_LEVEL_NAME} LEVEL DASHBOARD`
            if (data[0].ANALYTICS_GROUP_LEVEL !== 'ALL') {
                uL = data[0].ANALYTICS_GROUP_LEVEL
                uLName = data[0].ANALYTICS_GROUP_LEVEL_NAME
                userLevelFilterString += ` AND ${data[0].ANALYTICS_GROUP_LEVEL} IN (`
                userLevelFilterStringForId += ` AND ${data[0].ANALYTICS_GROUP_LEVEL_ID} IN (`
                for (var i = 0; i < data.length; i++) {
                    if (i == 0) {
                        userLevelFilterString += `'${data[i][`${data[0].ANALYTICS_GROUP_LEVEL}`]}'`
                        userLevelFilterStringForId += `'${data[i][`${data[0].ANALYTICS_GROUP_LEVEL_ID}`]}'`
                    } else {
                        userLevelFilterString += `,'${data[i][`${data[0].ANALYTICS_GROUP_LEVEL}`]}'`
                        userLevelFilterStringForId += `,'${data[i][`${data[0].ANALYTICS_GROUP_LEVEL_ID}`]}'`
                    }
                }
                userLevelFilterString += `)`
                userLevelFilterStringForId += `)`
                console.log(userLevelFilterString);
            }
            document.getElementById('dashboardTitle').textContent = `${data[0].ANALYTICS_GROUP_LEVEL_NAME} DASHBOARD `
            getVertical()
            getYearsFromSecAuto()
        } else {
            // Fallback for demo mode
            sessionStorage.setItem('bucketId', 1);
            dashboardName = 'CHAIRMAN LEVEL DASHBOARD';
            document.getElementById('dashboardTitle').textContent = dashboardName;
            getVertical();
            getYearsFromSecAuto();
        }
    }).fail(function(xhr, status, error) {
        console.error('Error loading user filters:', error);
        // Fallback for demo mode
        sessionStorage.setItem('bucketId', 1);
        dashboardName = 'CHAIRMAN LEVEL DASHBOARD';
        document.getElementById('dashboardTitle').textContent = dashboardName;
        getVertical();
        getYearsFromSecAuto();
    });
}

async function resolveLoadPageGrid() {
    return new Promise((resolve, reject) => {
        let bucketId = sessionStorage.getItem('bucketId')
        let newObj = {};
        newObj['bucketId'] = bucketId

        // Show content in the tab container
        const tabContent = document.getElementById('tabContents');
        
        // Create initial tab content structure
        tabContent.innerHTML = `
            <div class="tab-pane fade show active" id="DASHBOARD1" role="tabpanel">
                <div class="row" id="dashboardContent">
                    <div class="col-12 text-center p-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="sr-only">Loading...</span>
                        </div>
                        <p class="mt-3">Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        `;

        $.ajax({
            "url": `/index/loadPageGridDaily`,
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(newObj)
        }).done(function (data) {
            console.log('Dashboard grid loaded:', data);
            if (data.length > 0) {
                const dashboardContent = document.getElementById('dashboardContent');
                dashboardContent.innerHTML = data[0].GRID_HTML || `
                    <div class="col-12">
                        <div class="alert alert-info">
                            <h4>Dashboard Demo Mode</h4>
                            <p>Dashboard is running with sample data. Database connection not available.</p>
                        </div>
                    </div>
                `;
                resolve();
            } else {
                const dashboardContent = document.getElementById('dashboardContent');
                dashboardContent.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning">
                            <h4>No Dashboard Data</h4>
                            <p>No dashboard configuration found for this user level.</p>
                        </div>
                    </div>
                `;
                resolve();
            }
        }).fail(function(xhr, status, error) {
            console.error('Error loading dashboard grid:', error);
            const dashboardContent = document.getElementById('dashboardContent');
            dashboardContent.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning">
                        <h4>Dashboard Demo Mode</h4>
                        <p>Dashboard is running in demo mode. Database connection not available.</p>
                        <button class="btn btn-primary" onclick="location.reload()">Retry Connection</button>
                    </div>
                </div>
            `;
            resolve(); // Don't reject, continue with fallback
        });
    });
}

function setUserView() {
    console.log('Dashboard view set for user');
}

// Additional functions for chart/widget management
function loadChartTypes() {
    $.ajax({
        "url": `/index/loadChartTypes`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
    }).done(function (data) {
        document.getElementById('chartType').innerHTML = ``
        var chartOptions = ``
        chartOptions += `<option value="0">Select Chart</option>`
        data.forEach(chart => {
            chartOptions += `<option value="${chart.CHART_ID}">${chart.CHART_NAME}</option>`
        })
        document.getElementById('chartType').innerHTML = chartOptions
    }).fail(function(xhr, status, error) {
        console.error('Error loading chart types:', error);
    });
}

function loadWidgetTypes() {
    $.ajax({
        "url": `/index/loadWidgetTypes`,
        "method": "GET",
        "timeout": 0,
        "headers": {
            "Content-Type": "application/json"
        },
    }).done(function (data) {
        document.getElementById('widgetType').innerHTML = ``
        var chartOptions = ``
        chartOptions += `<option value="0">Select Widget</option>`
        data.forEach(chart => {
            chartOptions += `<option value="${chart.WIDGET_ID}">${chart.WIDGET_NAME}</option>`
        })
        document.getElementById('widgetType').innerHTML = chartOptions
    }).fail(function(xhr, status, error) {
        console.error('Error loading widget types:', error);
    });
}

function changeView() {
    console.log('View changed');
}

// Initialize when page loads
$(document).ready(function() {
    console.log('Dashboard initialized');
});