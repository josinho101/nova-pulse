const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/tables/004_create_user_groups_table.sql"), "utf8"),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/004_create_user_groups_table.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
