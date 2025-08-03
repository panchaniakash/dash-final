var express = require('express')
const sql = require("mssql");
var router = express.Router()

var config = {
    server: process.env.DB_HOST || '123.45.6.2',
    user: process.env.DB_USER || 'db',
    password: process.env.DB_PASSWD || 'db@123',
    database: process.env.DB || 'DB',
    port: parseInt(process.env.DB_PORT) || 1433,
    schema: process.env.SCHEMA || 'dbo',
    trustServerCertificate: true,
    connectionTimeout: 10000,
    requestTimeout: 10000,
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

// Sample fallback data for when database is not available
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
            ANALYTICS_GROUP_LEVEL: 'ALL'
        }
    ],
    gridData: [
        {
            GRID_HTML: `
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
                            <h5 class="card-title">Performance Metrics</h5>
                        </div>
                        <div class="card-body">
                            <div id="performanceChart" style="height: 200px;"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-12 mb-4">
                    <div class="card custom-card">
                        <div class="card-header">
                            <h5 class="card-title">Site Status</h5>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <strong>Demo Mode:</strong> Dashboard is running with sample data. Connect to your database to see real-time information.
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Site</th>
                                            <th>Status</th>
                                            <th>Last Update</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Mumbai Site</td>
                                            <td><span class="badge badge-success">Active</span></td>
                                            <td>2024-01-15 10:30</td>
                                        </tr>
                                        <tr>
                                            <td>Delhi Site</td>
                                            <td><span class="badge badge-success">Active</span></td>
                                            <td>2024-01-15 10:25</td>
                                        </tr>
                                        <tr>
                                            <td>Bangalore Site</td>
                                            <td><span class="badge badge-warning">Maintenance</span></td>
                                            <td>2024-01-15 09:15</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            TILE_COUNT: 3
        }
    ]
};

router.post("/loadAllPages", async function (req, res) {
    console.log("----DISPLAY loadAllPages API----\n");
    let bucketId = req.body.bucketId;
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        
        const q1 = `SELECT PAGE_NAME, GRID_ID FROM ${config.schema}.USER_CHARTS_GRID WHERE BUCKETID = @bucketId ORDER BY PAGE_NAME`;
        const result = await request.query(q1);
        res.json(result.recordset);
    } catch (error) {
        console.log("Error in loadAllPages:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/addNewPage", async function (req, res) {
    console.log("----DISPLAY addNewPage API----\n");
    let bucketId = req.body.bucketId;
    let page = req.body.page;
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        request.input('page', sql.VarChar, page);
        
        const q1 = `SELECT USER_CHART_GRID_ID, BUCKETID, GRID_ID, PAGE_NAME FROM ${config.schema}.USER_CHARTS_GRID WHERE PAGE_NAME = @page`;
        const result1 = await request.query(q1);
        
        if (result1.recordset.length == 0) {
            const q2 = `INSERT INTO ${config.schema}.USER_CHARTS_GRID (BUCKETID, GRID_ID, PAGE_NAME) VALUES(@bucketId, 1, @page)`;
            await request.query(q2);
            res.json({ status: 200 });
        } else {
            res.json({ status: 300 });
        }
    } catch (error) {
        console.log("Error in addNewPage:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/loadPageGridDaily", async function (req, res) {
    console.log("----DISPLAY loadPageGridDaily API----\n");
    let bucketId = req.body.bucketId;
    try {
        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('bucketId', sql.Int, bucketId);
            
            const q1 = `SELECT gm.GRID_HTML, gm.TILE_COUNT FROM ${config.schema}.DASHBOARD_GRID dg
                       JOIN ${config.schema}.GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
                       WHERE dg.BUCKET_ID = @bucketId AND dg.DASHBOARD = 'DAILY'`;
            const result = await request.query(q1);
            res.json(result.recordset);
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.gridData);
        }
    } catch (error) {
        console.log("Error in loadPageGridDaily:", error);
        res.json(fallbackData.gridData);
    }
});

router.post("/loadPageGridMonthly", async function (req, res) {
    console.log("----DISPLAY loadPageGridMonthly API----\n");
    let bucketId = req.body.bucketId;
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('bucketId', sql.Int, bucketId);
        
        const q1 = `SELECT gm.GRID_HTML, gm.TILE_COUNT FROM ${config.schema}.DASHBOARD_GRID dg
                   JOIN ${config.schema}.GRID_MASTER gm ON dg.GRID_ID = gm.GRID_ID
                   WHERE dg.BUCKET_ID = @bucketId AND dg.DASHBOARD = 'MONTHLY'`;
        const result = await request.query(q1);
        res.json(result.recordset);
    } catch (error) {
        console.log("Error in loadPageGridMonthly:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/removeTab", async function (req, res) {
    console.log("----DISPLAY removeTab API----\n");
    let page = req.body.page;
    try {
        const pool = await getConnection();
        const request = pool.request();
        request.input('page', sql.VarChar, page);
        
        const q1 = `DELETE FROM ${config.schema}.USER_CHARTS_GRID WHERE PAGE_NAME = @page`;
        await request.query(q1);
        
        const q2 = `DELETE FROM ${config.schema}.USER_CHARTS WHERE PAGE_NAME = @page`;
        await request.query(q2);
        
        res.json({ status: 200 });
    } catch (error) {
        console.log("Error in removeTab:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/loadAllGrids", async function (req, res) {
    console.log("----DISPLAY loadAllGrids API----\n");
    try {
        const pool = await getConnection();
        const request = pool.request();
        
        const q1 = `SELECT GRID_ID, GRID_HTML, TILE_COUNT FROM ${config.schema}.GRID_MASTER`;
        const result = await request.query(q1);
        res.json(result.recordset);
    } catch (error) {
        console.log("Error in loadAllGrids:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getVertical", async function (req, res) {
    console.log("----DISPLAY getVertical API----\n");
    try {
        var DATA = req.body;
        var bucketId = DATA.bucketId;
        var userId = DATA.userId;

        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('bucketId', sql.Int, bucketId);

            const q1 = `SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.ANALYTICS_GROUPS WHERE ANALYTICS_GROUP_ID = @bucketId`;
            const result = await request.query(q1);

            if (result.recordset.length > 0) {
                if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                    const q2 = `SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' ORDER BY VNAME ASC`;
                    const result1 = await request.query(q2);
                    res.json(result1.recordset);
                } else {
                    request.input('userId', sql.Int, userId);
                    const q3 = `SELECT DISTINCT VID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`;
                    const result3 = await request.query(q3);

                    if (result3.recordset.length > 0) {
                        var vidArray = result3.recordset.map(row => row.VID);
                        var vidList = vidArray.join(',');
                        
                        const q4 = `SELECT DISTINCT VNAME FROM ${config.schema}.VERTICAL WHERE VSTATUS = 'ACTIVE' AND VID IN (${vidList}) ORDER BY VNAME ASC`;
                        const result4 = await request.query(q4);
                        res.json(result4.recordset);
                    } else {
                        res.status(404).json({ error: 'No matching VID found in USERGROUPS for the provided USERID' });
                    }
                }
            } else {
                res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
            }
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.verticals);
        }
    } catch (error) {
        console.log("Error in getVertical:", error);
        res.json(fallbackData.verticals);
    }
});

router.post("/getBusiness", async function (req, res) {
    console.log("----DISPLAY getBusiness API----\n");
    try {
        var DATA = req.body;
        var vertical = DATA.vertical;
        var bucketId = DATA.bucketId;
        var userId = DATA.userId;

        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('bucketId', sql.Int, bucketId);
            request.input('vertical', sql.VarChar, vertical);

            const q1 = `SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.ANALYTICS_GROUPS WHERE ANALYTICS_GROUP_ID = @bucketId`;
            const result = await request.query(q1);

            if (result.recordset.length > 0) {
                if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                    const q2 = `SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B
                               JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID
                               WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE'
                               ORDER BY B.BUNAME ASC`;
                    const result1 = await request.query(q2);
                    res.json(result1.recordset);
                } else {
                    request.input('userId', sql.Int, userId);
                    const q3 = `SELECT DISTINCT BUID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`;
                    const result3 = await request.query(q3);

                    if (result3.recordset.length > 0) {
                        var buidArray = result3.recordset.map(row => row.BUID);
                        var buidList = buidArray.join(',');
                        
                        const q4 = `SELECT DISTINCT B.BUNAME FROM ${config.schema}.BUSINESS B
                                   JOIN ${config.schema}.VERTICAL V ON B.VID = V.VID
                                   WHERE V.VNAME = @vertical AND B.BUSTATUS = 'ACTIVE' AND B.BUID IN (${buidList})
                                   ORDER BY B.BUNAME ASC`;
                        const result4 = await request.query(q4);
                        res.json(result4.recordset);
                    } else {
                        res.status(404).json({ error: 'No matching BUID found in USERGROUPS for the provided USERID' });
                    }
                }
            } else {
                res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
            }
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.businesses);
        }
    } catch (error) {
        console.log("Error in getBusiness:", error);
        res.json(fallbackData.businesses);
    }
});

router.post("/getSite", async function (req, res) {
    console.log("----DISPLAY getSite API----\n");
    try {
        var DATA = req.body;
        var business = DATA.Business;
        var bucketId = DATA.bucketId;
        var userId = DATA.userId;

        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('bucketId', sql.Int, bucketId);
            request.input('business', sql.VarChar, business);

            const q1 = `SELECT ANALYTICS_GROUP_LEVEL_NAME FROM ${config.schema}.ANALYTICS_GROUPS WHERE ANALYTICS_GROUP_ID = @bucketId`;
            const result = await request.query(q1);

            if (result.recordset.length > 0) {
                if (result.recordset[0].ANALYTICS_GROUP_LEVEL_NAME === "GROUP SECURITY") {
                    const q2 = `SELECT DISTINCT S.SINAME FROM ${config.schema}.SITE S
                               JOIN ${config.schema}.BUSINESS B ON S.BUID = B.BUID
                               WHERE B.BUNAME = @business AND S.SISTATUS = 'ACTIVE'
                               ORDER BY S.SINAME ASC`;
                    const result1 = await request.query(q2);
                    res.json(result1.recordset);
                } else {
                    request.input('userId', sql.Int, userId);
                    const q3 = `SELECT DISTINCT SIID FROM ${config.schema}.USERGROUPS WHERE USERID = @userId`;
                    const result3 = await request.query(q3);

                    if (result3.recordset.length > 0) {
                        var siidArray = result3.recordset.map(row => row.SIID);
                        var siidList = siidArray.join(',');
                        
                        const q4 = `SELECT DISTINCT S.SINAME FROM ${config.schema}.SITE S
                                   JOIN ${config.schema}.BUSINESS B ON S.BUID = B.BUID
                                   WHERE B.BUNAME = @business AND S.SISTATUS = 'ACTIVE' AND S.SIID IN (${siidList})
                                   ORDER BY S.SINAME ASC`;
                        const result4 = await request.query(q4);
                        res.json(result4.recordset);
                    } else {
                        res.status(404).json({ error: 'No matching SIID found in USERGROUPS for the provided USERID' });
                    }
                }
            } else {
                res.status(404).json({ error: 'No analytics group found for the provided bucketId' });
            }
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.sites);
        }
    } catch (error) {
        console.log("Error in getSite:", error);
        res.json(fallbackData.sites);
    }
});

router.get("/getYearsFromSecAuto", async function (req, res) {
    console.log("----DISPLAY getYearsFromSecAuto API----\n");
    try {
        try {
            const pool = await getConnection();
            const request = pool.request();
            
            const q1 = `SELECT DISTINCT YEAR FROM ${config.schema}.SEC_AUTO ORDER BY YEAR DESC`;
            const result = await request.query(q1);
            res.json(result.recordset);
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.years);
        }
    } catch (error) {
        console.log("Error in getYearsFromSecAuto:", error);
        res.json(fallbackData.years);
    }
});

router.post("/getMonthFromSecAuto", async function (req, res) {
    console.log("----DISPLAY getMonthFromSecAuto API----\n");
    try {
        var year = req.body.year;
        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('year', sql.Int, year);
            
            const q1 = `SELECT DISTINCT MONTH, MONTHNAME FROM ${config.schema}.SEC_AUTO WHERE YEAR = @year ORDER BY MONTH ASC`;
            const result = await request.query(q1);
            res.json(result.recordset);
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.months);
        }
    } catch (error) {
        console.log("Error in getMonthFromSecAuto:", error);
        res.json(fallbackData.months);
    }
});

router.post("/getUserLevelFilters", async function (req, res) {
    console.log("----DISPLAY getUserLevelFilters API----\n");
    try {
        var userId = req.body.userId;
        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('userId', sql.Int, userId);
            
            const q1 = `SELECT ag.ANALYTICS_GROUPS_ID, ag.ANALYTICS_GROUP_LEVEL_NAME, ag.ANALYTICS_GROUP_LEVEL
                       FROM ${config.schema}.ANALYTICS_GROUPS ag
                       JOIN ${config.schema}.USER_ANALYTICS_GROUPS uag ON ag.ANALYTICS_GROUPS_ID = uag.ANALYTICS_GROUPS_ID
                       WHERE uag.USER_ID = @userId`;
            const result = await request.query(q1);
            res.json(result.recordset);
        } catch (dbError) {
            console.log("Database connection failed, using fallback data");
            res.json(fallbackData.userLevelFilters);
        }
    } catch (error) {
        console.log("Error in getUserLevelFilters:", error);
        res.json(fallbackData.userLevelFilters);
    }
});

// Additional endpoints for dashboard data
router.post("/getDashboardData", async function (req, res) {
    console.log("----DISPLAY getDashboardData API----\n");
    try {
        var filters = req.body.filters;
        var filterString = req.body.filterString || '';
        
        const pool = await getConnection();
        const request = pool.request();
        
        // Base query for dashboard data - customize based on your schema
        const q1 = `SELECT * FROM ${config.schema}.SEC_AUTO WHERE 1=1 ${filterString}`;
        const result = await request.query(q1);
        res.json(result.recordset);
    } catch (error) {
        console.log("Error in getDashboardData:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getChartData", async function (req, res) {
    console.log("----DISPLAY getChartData API----\n");
    try {
        var chartType = req.body.chartType;
        var filters = req.body.filters;
        var filterString = req.body.filterString || '';
        
        const pool = await getConnection();
        const request = pool.request();
        
        // Customize query based on chart type and filters
        let query = '';
        switch(chartType) {
            case 'bar':
                query = `SELECT CATEGORY, COUNT(*) as COUNT FROM ${config.schema}.SEC_AUTO WHERE 1=1 ${filterString} GROUP BY CATEGORY`;
                break;
            case 'pie':
                query = `SELECT STATUS, COUNT(*) as COUNT FROM ${config.schema}.SEC_AUTO WHERE 1=1 ${filterString} GROUP BY STATUS`;
                break;
            case 'line':
                query = `SELECT DATE, COUNT(*) as COUNT FROM ${config.schema}.SEC_AUTO WHERE 1=1 ${filterString} GROUP BY DATE ORDER BY DATE`;
                break;
            default:
                query = `SELECT * FROM ${config.schema}.SEC_AUTO WHERE 1=1 ${filterString}`;
        }
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (error) {
        console.log("Error in getChartData:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/getGridData", async function (req, res) {
    console.log("----DISPLAY getGridData API----\n");
    try {
        var gridId = req.body.gridId;
        var filters = req.body.filters;
        var filterString = req.body.filterString || '';
        
        const pool = await getConnection();
        const request = pool.request();
        
        // Get grid data based on filters
        const q1 = `SELECT * FROM ${config.schema}.SEC_AUTO WHERE 1=1 ${filterString}`;
        const result = await request.query(q1);
        res.json(result.recordset);
    } catch (error) {
        console.log("Error in getGridData:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
