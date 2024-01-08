const sql = require("mssql");
require("dotenv").config(); //.env 불러오기

const config = {
  server: process.env.DB_IP,
  port: 1433,
  options: { useUTC: false, encrypt: false, database: process.env.DB_NAME },
  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_ID,
      password: process.env.DB_PW,
    },
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connect to Mssql");
    return pool;
  })
  .catch((err) => console.log("db connection failed : ", err));

module.exports = {
  sql,
  poolPromise,
};
