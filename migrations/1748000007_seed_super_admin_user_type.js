const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/009_seed_super_admin_user_type.sql"),
      "utf8",
    ),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/009_seed_super_admin_user_type.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
