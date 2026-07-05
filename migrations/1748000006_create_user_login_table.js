const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/tables/007_create_user_login_table.sql"), "utf8"),
  );
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/procedures/008_user_login_procedures.sql"), "utf8"),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/008_user_login_procedures.down.sql"),
      "utf8",
    ),
  );
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/007_create_user_login_table.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
