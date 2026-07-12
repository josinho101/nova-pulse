const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/tables/001_create_user_types_table.sql"), "utf8"),
  );
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/procedures/003_user_type_procedures.sql"), "utf8"),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/003_user_type_procedures.down.sql"),
      "utf8",
    ),
  );
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/001_create_user_types_table.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
