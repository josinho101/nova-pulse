const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(fs.readFileSync(path.join(__dirname, "../db/tables/002_create_users_table.sql"), "utf8"));
};

const down = (pgm) => {
  pgm.sql(fs.readFileSync(path.join(__dirname, "../db/tables/002_create_users_table.down.sql"), "utf8"));
};

module.exports = { up, down };
