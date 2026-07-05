const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(fs.readFileSync(path.join(__dirname, "../db/procedures/004_user_procedures.sql"), "utf8"));
};

const down = (pgm) => {
  pgm.sql(fs.readFileSync(path.join(__dirname, "../db/procedures/004_user_procedures.down.sql"), "utf8"));
};

module.exports = { up, down };
