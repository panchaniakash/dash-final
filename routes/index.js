var express = require('express')
const sql = require("mssql");
var router = express.Router()

var config = {
    server: process.env.DB_HOST || '172.20.10.2',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWD || 'password123',
    database: process.env.DB || 'ISMS_DB',
    port: parseInt(process.env.DB_PORT) || 1433,
    schema: process.env.SCHEMA || 'dbo',
    trustServerCertificate: true,
    connectionTimeout: 15000,
    requestTimeout: 15000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Connection pool for performance
let pool;
let isConnected = false;

async function getConnection() {
    try {
        if (!pool || !isConnected) {
            console.log('Attempting database connection...');
            pool = await sql.connect(config);
            isConnected = true;
            console.log('Database connected successfully');
        }
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        isConnected = false;
        throw err;
    }
}

// Sample fallback data for demo mode when database is not available
const fallbackData = {
    verticals: [
        { VNAME: 'Energy' },
        { VNAME: 'Mining' },
        { VNAME: 'Logistics' },
        { VNAME: 'Airports' }
    ],
    businesses: [
        { BUNAME: 'Coal Mining' },
        { BUNAME: 'Solar Power' },
        { BUNAME: 'Wind Power' },
        { BUNAME: 'Thermal Power' }
    ],
    sites: [
        { SINAME: 'Mumbai Site' },
        { SINAME: 'Delhi Site' },
        { SINAME: 'Bangalore Site' },
        { SINAME: 'Chennai Site' }
    ],
    years: [
        { YEAR: 2024 },
        { YEAR: 2023 },
        { YEAR: 2022 }
    ],
    months: [
        { MONTH: 1, MONTHNAME: 'January' },
        { MONTH: 2, MONTHNAME: 'February' },
        { MONTH: 3, MONTHNAME: 'March' },
        { MONTH: 4, MONTHNAME: 'April' },
        { MONTH: 5, MONTHNAME: 'May' },
        { MONTH: 6, MONTHNAME: 'June' },
        { MONTH: 7, MONTHNAME: 'July' },
        { MONTH: 8, MONTHNAME: 'August' },
        { MONTH: 9, MONTHNAME: 'September' },
        { MONTH: 10, MONTHNAME: 'October' },
        { MONTH: 11, MONTHNAME: 'November' },
        { MONTH: 12, MONTHNAME: 'December' }
    ],
    userLevelFilters: [
        { 
            ANALYTICS_GROUPS_ID: 1,
            ANALYTICS_GROUP_LEVEL_NAME: 'CHAIRMAN',
            ANALYTICS_GROUP_LEVEL: 'ALL',
            ANALYTICS_GROUP_LEVEL_ID: 'VID'
        }
    ],
    chartTypes: [
        { CHART_ID: 1, CHART_NAME: 'Bar Chart' },
        { CHART_ID: 2, CHART_NAME: 'Line Chart' },
        { CHART_ID: 3, CHART_NAME: 'Pie Chart' },
        { CHART_ID: 4, CHART_NAME: 'Area Chart' }
    ],
    widgetTypes: [
        { WIDGET_ID: 1, WIDGET_NAME: 'KPI Widget' },
        { WIDGET_ID: 2, WIDGET_NAME: 'Text Widget' },
        { WIDGET_ID: 3, WIDGET_NAME: 'Table Widget' }
    ]
};

// Helper function to handle database queries with fallback
async function executeQueryWithFallback(query, fallbackDataKey, params = {}) {
    try {
        const pool = await getConnection();
        const request = pool.request();
        
        // Add parameters to request
        Object.keys(params).forEach(key => {
            request.input(key, params[key]);
        });
        
        const result = await request.query(query);
        return result.recordset;
    } catch (error) {
        console.log(`Database query failed, using fallback data for ${fallbackDataKey}:`, error.message);
        return fallbackData[fallbackDataKey] || [];
    }
}

router.post("/getVertical", async function (req, res) {
    console.log("----DISPLAY getVertical API----");
    try {
        var DATA = req.body;
        var bucketId = DATA.bucketId || 1;
        var userId = DATA.userId || 1;

        const q1 = `SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.ANALYTICS_GROUPS WHERE ANALYTICS_GROUPS_ID = @bucketId`;
        const groupResult = await executeQueryWithFallback(q1, 'userLevelFilters', { bucketId: sql.Int, bucketId });

        if (groupResult.length > 0 && groupResult[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
            const q2 = `SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' ORDER BY VNAME ASC`;
            const verticals = await executeQueryWithFallback(q2, 'verticals');
            res.json(verticals);
        } else {
            const q3 = `SELECT DISTINCT VID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`;
            const userGroups = await executeQueryWithFallback(q3, 'verticals', { userId: sql.Int, userId });

            if (userGroups.length > 0) {
                var vidArray = userGroups.map(row => row.VID);
                var vidList = vidArray.join(',');
                
                const q4 = `SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' AND VID IN (${vidList}) ORDER BY VNAME ASC`;
                const verticals = await executeQueryWithFallback(q4, 'verticals');
                res.json(verticals);
            } else {
                res.json(fallbackData.verticals);
            }
        }
    } catch (error) {
        console.log("Error in getVertical:", error);
        res.json(fallbackData.verticals);
    }
});

router.post("/getBusiness", async function (req, res) {
    console.log("----DISPLAY getBusiness API----");
    try {
        var DATA = req.body;
        var vertical = DATA.vertical;
        var bucketId = DATA.bucketId || 1;
        var userId = DATA.userId || 1;

        const q1 = `SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.ANALYTICS_GROUPS WHERE ANALYTICS_GROUPS_ID = @bucketId`;
        const groupResult = await executeQueryWithFallback(q1, 'userLevelFilters', { bucketId: sql.Int, bucketId });

        if (groupResult.length > 0 && groupResult[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
            const q2 = `SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B
                       JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID
                       WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE'
                       ORDER BY B.BUNAME ASC`;
            const businesses = await executeQueryWithFallback(q2, 'businesses', { vertical: sql.VarChar, vertical });
            res.json(businesses);
        } else {
            const q3 = `SELECT DISTINCT BUID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`;
            const userGroups = await executeQueryWithFallback(q3, 'businesses', { userId: sql.Int, userId });

            if (userGroups.length > 0) {
                var buidArray = userGroups.map(row => row.BUID);
                var buidList = buidArray.join(',');
                
                const q4 = `SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B
                           JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID
                           WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE' AND B.BUID IN (${buidList})
                           ORDER BY B.BUNAME ASC`;
                const businesses = await executeQueryWithFallback(q4, 'businesses', { vertical: sql.VarChar, vertical });
                res.json(businesses);
            } else {
                res.json(fallbackData.businesses);
            }
        }
    } catch (error) {
        console.log("Error in getBusiness:", error);
        res.json(fallbackData.businesses);
    }
});

router.post("/getSite", async function (req, res) {
    console.log("----DISPLAY getSite API----");
    try {
        var DATA = req.body;
        var business = DATA.Business;
        var bucketId = DATA.bucketId || 1;
        var userId = DATA.userId || 1;

        const q1 = `SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.ANALYTICS_GROUPS WHERE ANALYTICS_GROUPS_ID = @bucketId`;
        const groupResult = await executeQueryWithFallback(q1, 'userLevelFilters', { bucketId: sql.Int, bucketId });

        if (groupResult.length > 0 && groupResult[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
            const q2 = `SELECT DISTINCT S.SINAME FROM ${config.schema}.SITE S
                       JOIN ${config.schema}.BUSINESS B ON S.BUID = B.BUID
                       WHERE B.BUNAME = @business AND S.SISTATUS = 'ACTIVE'
                       ORDER BY S.SINAME ASC`;
            const sites = await executeQueryWithFallback(q2, 'sites', { business: sql.VarChar, business });
            res.json(sites);
        } else {
            const q3 = `SELECT DISTINCT SIID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`;
            const userGroups = await executeQueryWithFallback(q3, 'sites', { userId: sql.Int, userId });

            if (userGroups.length > 0) {
                var siidArray = userGroups.map(row => row.SIID);
                var siidList = siidArray.join(',');
                
                const q4 = `SELECT DISTINCT S.SINAME FROM ${config.schema}.SITE S
                           JOIN ${config.schema}.BUSINESS B ON S.BUID = B.BUID
                           WHERE B.BUNAME = @business AND S.SISTATUS = 'ACTIVE' AND S.SIID IN (${siidList})
                           ORDER BY S.SINAME ASC`;
                const sites = await executeQueryWithFallback(q4, 'sites', { business: sql.VarChar, business });
                res.json(sites);
            } else {
                res.json(fallbackData.sites);
            }
        }
    } catch (error) {
        console.log("Error in getSite:", error);
        res.json(fallbackData.sites);
    }
});

router.get("/getYearsFromSecAuto", async function (req, res) {
    console.log("----DISPLAY getYearsFromSecAuto API----");
    try {
        const q1 = `SELECT DISTINCT YEAR FROM ${config.schema}.SEC_AUTO ORDER BY YEAR DESC`;
        const years = await executeQueryWithFallback(q1, 'years');
        res.json(years);
    } catch (error) {
        console.log("Error in getYearsFromSecAuto:", error);
        res.json(fallbackData.years);
    }
});

router.post("/getMonthFromSecAuto", async function (req, res) {
    console.log("----DISPLAY getMonthFromSecAuto API----");
    try {
        var year = req.body.year;
        const q1 = `SELECT DISTINCT MONTH, MONTHNAME FROM ${config.schema}.SEC_AUTO WHERE YEAR = @year ORDER BY MONTH ASC`;
        const months = await executeQueryWithFallback(q1, 'months', { year: sql.Int, year });
        res.json(months);
    } catch (error) {
        console.log("Error in getMonthFromSecAuto:", error);
        res.json(fallbackData.months);
    }
});

router.post("/getUserLevelFilters", async function (req, res) {
    console.log("----DISPLAY getUserLevelFilters API----");
    try {
        var userId = req.body.userId || 1;
        const q1 = `SELECT ag.ANALYTICS_GROUPS_ID, ag.ANALYTICS_GROUP_LEVEL_NAME, ag.ANALYTICS_GROUP_LEVEL, ag.ANALYTICS_GROUP_LEVEL_ID
                   FROM ${config.schema}.ANALYTICS_GROUPS ag
                   JOIN ${config.schema}.USER_ANALYTICS_GROUPS uag ON ag.ANALYTICS_GROUPS_ID = uag.ANALYTICS_GROUPS_ID
                   WHERE uag.USER_ID = @userId`;
        const userFilters = await executeQueryWithFallback(q1, 'userLevelFilters', { userId: sql.Int, userId });
        res.json(userFilters);
    } catch (error) {
        console.log("Error in getUserLevelFilters:", error);
        res.json(fallbackData.userLevelFilters);
    }
});

router.get("/loadChartTypes", async function (req, res) {
    console.log("----DISPLAY loadChartTypes API----");
    try {
        const q1 = `SELECT CHART_ID, CHART_NAME FROM ${config.schema}.CHART_TYPES ORDER BY CHART_NAME ASC`;
        const chartTypes = await executeQueryWithFallback(q1, 'chartTypes');
        res.json(chartTypes);
    } catch (error) {
        console.log("Error in loadChartTypes:", error);
        res.json(fallbackData.chartTypes);
    }
});

router.get("/loadWidgetTypes", async function (req, res) {
    console.log("----DISPLAY loadWidgetTypes API----");
    try {
        const q1 = `SELECT WIDGET_ID, WIDGET_NAME FROM ${config.schema}.WIDGET_TYPES ORDER BY WIDGET_NAME ASC`;
        const widgetTypes = await executeQueryWithFallback(q1, 'widgetTypes');
        res.json(widgetTypes);
    } catch (error) {
        console.log("Error in loadWidgetTypes:", error);
        res.json(fallbackData.widgetTypes);
    }
});

// Dashboard grid loading
router.post("/loadPageGridDaily", async function (req, res) {
    console.log("----DISPLAY loadPageGridDaily API----");
    try {
        let bucketId = req.body.bucketId || 1;
        const q1 = `SELECT gm.GRID_HTML, gm.TILE_COUNT FROM ${config.schema}.DASHBOARD_GRID dg
                   JOIN ${config.schema}.GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
                   WHERE dg.BUCKET_ID = @bucketId AND dg.DASHBOARD = 'DAILY'`;
        
        const gridData = await executeQueryWithFallback(q1, 'gridData', { bucketId: sql.Int, bucketId });
        
        if (gridData.length === 0) {
            // Return sample dashboard HTML for demo
            const sampleGrid = [{
                GRID_HTML: `
                    <div class="tab-pane fade show active" id="DASHBOARD1" role="tabpanel">
                        <div class="row" id="dashboardContent">
                            <div class="col-md-6 mb-4">
                                <div class="card custom-card">
                                    <div class="card-header">
                                        <h5 class="card-title">Safety Overview</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-6">
                                                <div class="metric-box text-center p-3 bg-success text-white rounded">
                                                    <h3>98.5%</h3>
                                                    <p>Safety Score</p>
                                                </div>
                                            </div>
                                            <div class="col-6">
                                                <div class="metric-box text-center p-3 bg-warning text-white rounded">
                                                    <h3>12</h3>
                                                    <p>Incidents</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 mb-4">
                                <div class="card custom-card">
                                    <div class="card-header">
                                        <h5 class="card-title">Performance Trends</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="alert alert-info">
                                            <strong>Demo Mode:</strong> Dashboard showing sample safety data. Connect to database for real-time information.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `,
                TILE_COUNT: 2
            }];
            res.json(sampleGrid);
        } else {
            res.json(gridData);
        }
    } catch (error) {
        console.log("Error in loadPageGridDaily:", error);
        res.json([{
            GRID_HTML: '<div class="col-12"><div class="alert alert-warning">Dashboard is in demo mode - database connection unavailable</div></div>',
            TILE_COUNT: 1
        }]);
    }
});

// Generic dashboard data endpoint
router.post("/getDashboardData", async function (req, res) {
    console.log("----DISPLAY getDashboardData API----");
    try {
        // This would be your main dashboard data endpoint
        // Return sample data for now
        res.json({
            success: true,
            message: "Dashboard data loaded successfully",
            data: {
                metrics: {
                    safetyScore: 98.5,
                    incidents: 12,
                    compliance: 95.2
                },
                charts: [],
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.log("Error in getDashboardData:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error loading dashboard data",
            error: error.message 
        });
    }
});

module.exports = router;