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
    
    fetch('/index/getVertical', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        },
        body: JSON.stringify(newObj)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let html = '<option value="All" selected = "selected">SELECT ALL</option>';
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
    })
    .catch(error => {
        console.error('Error fetching verticals:', error);
        verticals.innerHTML = '<option value="">Error loading data</option>';
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

            fetch('/index/getBusiness', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
                },
                body: JSON.stringify(newObj)
            })
            .then(response => response.json())
            .then(data => {
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
            })
            .catch(error => {
                console.error('Error fetching business:', error);
                business.innerHTML = '<option value="">Error loading data</option>';
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
            
            fetch('/index/getSite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
                },
                body: JSON.stringify(newObj)
            })
            .then(response => response.json())
            .then(data => {
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
            })
            .catch(error => {
                console.error('Error fetching sites:', error);
                site.innerHTML = '<option value="">Error loading data</option>';
            });
        }
    }
}

function getYearsFromSecAuto() {
    fetch('/index/getYearsFromSecAuto', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('yearDashboardFilter').innerHTML = ``
        var yearOptions = ``

        data.forEach(year => {
            yearOptions += `<option value="${year.YEAR}">${year.YEAR}</option>`
        })
        document.getElementById('yearDashboardFilter').innerHTML = yearOptions
        getMonthFromSecAuto(`${data[0]?.YEAR}`)
    })
    .catch(error => {
        console.error('Error fetching years:', error);
        document.getElementById('yearDashboardFilter').innerHTML = '<option value="">Error loading data</option>';
    });
}

function getMonthFromSecAuto(year) {
    var jsonObj = {}
    jsonObj["year"] = year
    
    fetch('/index/getMonthFromSecAuto', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        },
        body: JSON.stringify(jsonObj)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('monthDashboardFilter').innerHTML = ``
        var yearOptions = ``

        data.forEach(year => {
            yearOptions += `<option value="${year.MONTH}">${year.MONTHNAME}</option>`
        })
        document.getElementById('monthDashboardFilter').innerHTML = yearOptions
        getDate()
        setYearMonth()
    })
    .catch(error => {
        console.error('Error fetching months:', error);
        document.getElementById('monthDashboardFilter').innerHTML = '<option value="">Error loading data</option>';
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
    
    fetch('/index/getUserLevelFilters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        },
        body: JSON.stringify(jsonObj)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data, "iii");
        if (data.length > 0) {
            sessionStorage.setItem('bucketId', parseInt(data[0].ANALYTICS_GROUPS_ID))
            dashboardName = `${data[0].ANALYTICS_GROUP_LEVEL_NAME} LEVEL DASHBOARD`
            if (data[0].ANALYTICS_GROUP_LEVEL !== 'ALL') {
                uL = data[0].ANALYTICS_GROUP_LEVEL
                uLName = data[0].ANALYTICS_GROUP_LEVEL_NAME
                userLevelFilterString = ` AND ${uL} = '${data[0].ANALYTICS_GROUP_LEVEL_NAME}'`
                userLevelFilterStringForId = ` AND ${uL} = '${data[0].ANALYTICS_GROUP_LEVEL_NAME}'`
            }
            document.getElementById('dashboardTitle').innerText = dashboardName
            getVertical()
            getYearsFromSecAuto()
        }
    })
    .catch(error => {
        console.error('Error fetching user level filters:', error);
    });
}

async function resolveLoadPageGrid() {
    return new Promise((resolve, reject) => {
        let bucketId = sessionStorage.getItem('bucketId')
        let newObj = {};
        newObj['bucketId'] = bucketId

        fetch('/index/loadPageGridDaily', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
            },
            body: JSON.stringify(newObj)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.length > 0) {
                let htmlString = data[0].GRID_HTML;
                document.getElementById('dashboardContent').innerHTML = htmlString;
                
                // Initialize any charts or grids after content is loaded
                setTimeout(() => {
                    initializeDashboardComponents();
                    resolve();
                }, 500);
            } else {
                document.getElementById('dashboardContent').innerHTML = '<div class="col-12"><h3>No dashboard data available</h3></div>';
                resolve();
            }
        })
        .catch(error => {
            console.error('Error loading dashboard grid:', error);
            document.getElementById('dashboardContent').innerHTML = '<div class="col-12"><h3>Error loading dashboard</h3></div>';
            reject(error);
        });
    });
}

function initializeDashboardComponents() {
    // Initialize charts with real data
    initializeCharts();
    
    // Initialize grids with real data
    initializeGrids();
    
    // Initialize any other dashboard components
    initializeOtherComponents();
}

function initializeCharts() {
    // Find all chart containers and initialize them with data from API
    const chartContainers = document.querySelectorAll('[id*="chart"], [class*="chart"]');
    
    chartContainers.forEach(container => {
        const chartType = container.getAttribute('data-chart-type') || 'bar';
        loadChartData(container.id, chartType);
    });
}

function loadChartData(chartId, chartType) {
    const requestData = {
        chartType: chartType,
        filters: {
            year: year,
            month: month,
            vertical: document.getElementById('VerticalDashboardFilter').value,
            business: document.getElementById('BusinessDashboardFilter').value,
            site: document.getElementById('SiteDashboardFilter').value,
            date: date
        },
        filterString: filterString
    };

    fetch('/index/getChartData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        renderChart(chartId, chartType, data);
    })
    .catch(error => {
        console.error(`Error loading chart data for ${chartId}:`, error);
    });
}

function renderChart(chartId, chartType, data) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    // Configure chart options based on type
    let options = {
        chart: {
            type: chartType,
            height: 350
        },
        series: [],
        xaxis: {
            categories: []
        }
    };

    // Format data based on chart type
    switch(chartType) {
        case 'bar':
        case 'column':
            options.series = [{
                name: 'Count',
                data: data.map(item => item.COUNT)
            }];
            options.xaxis.categories = data.map(item => item.CATEGORY);
            break;
        case 'pie':
        case 'donut':
            options.series = data.map(item => item.COUNT);
            options.labels = data.map(item => item.STATUS);
            break;
        case 'line':
            options.series = [{
                name: 'Count',
                data: data.map(item => item.COUNT)
            }];
            options.xaxis.categories = data.map(item => item.DATE);
            break;
    }

    // Render the chart
    const chart = new ApexCharts(chartElement, options);
    chart.render();
}

function initializeGrids() {
    // Find all grid containers and initialize them with data from API
    const gridContainers = document.querySelectorAll('[id*="grid"], [class*="grid"], [id*="table"], [class*="table"]');
    
    gridContainers.forEach(container => {
        loadGridData(container.id);
    });
}

function loadGridData(gridId) {
    const requestData = {
        gridId: gridId,
        filters: {
            year: year,
            month: month,
            vertical: document.getElementById('VerticalDashboardFilter').value,
            business: document.getElementById('BusinessDashboardFilter').value,
            site: document.getElementById('SiteDashboardFilter').value,
            date: date
        },
        filterString: filterString
    };

    fetch('/index/getGridData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        renderGrid(gridId, data);
    })
    .catch(error => {
        console.error(`Error loading grid data for ${gridId}:`, error);
    });
}

function renderGrid(gridId, data) {
    const gridElement = document.getElementById(gridId);
    if (!gridElement || !data.length) return;

    // Create table structure
    let tableHtml = '<table class="table table-striped table-bordered">';
    
    // Create header
    if (data.length > 0) {
        tableHtml += '<thead><tr>';
        Object.keys(data[0]).forEach(key => {
            tableHtml += `<th>${key}</th>`;
        });
        tableHtml += '</tr></thead>';
    }
    
    // Create body
    tableHtml += '<tbody>';
    data.forEach(row => {
        tableHtml += '<tr>';
        Object.values(row).forEach(value => {
            tableHtml += `<td>${value || ''}</td>`;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    
    gridElement.innerHTML = tableHtml;
}

function initializeOtherComponents() {
    // Initialize any other dashboard components like KPI cards, etc.
    loadDashboardSummary();
}

function loadDashboardSummary() {
    const requestData = {
        filters: {
            year: year,
            month: month,
            vertical: document.getElementById('VerticalDashboardFilter').value,
            business: document.getElementById('BusinessDashboardFilter').value,
            site: document.getElementById('SiteDashboardFilter').value,
            date: date
        },
        filterString: filterString
    };

    fetch('/index/getDashboardData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'ea44fc101aa6ed91da192fad74bffd37a94992e59732669edcb6d21de18315a3c657c8c6455c9d8daaf7539f5144c0dc1a50ac005593f6abc6a7ab82dc4bc9fa'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        updateDashboardSummary(data);
    })
    .catch(error => {
        console.error('Error loading dashboard summary:', error);
    });
}

function updateDashboardSummary(data) {
    // Update summary cards or KPIs based on the data
    const summaryElements = document.querySelectorAll('[id*="summary"], [class*="kpi"], [class*="summary"]');
    
    summaryElements.forEach(element => {
        // Update element content based on data
        // This would be customized based on your specific dashboard requirements
    });
}

function setUserView() {
    // Set user-specific view configurations
    console.log('Setting user view...');
    
    // Apply any user-specific customizations
    applyUserCustomizations();
}

function applyUserCustomizations() {
    // Apply user-specific dashboard customizations
    console.log('Applying user customizations...');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Select2 for dropdowns
    $('.dropdown-select').select2({
        width: '100%'
    });
    
    console.log('Dashboard initialized');
});
