const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/011_convert_actor_columns_to_user_fk.sql"),
      "utf8",
    ),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/011_convert_actor_columns_to_user_fk.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
