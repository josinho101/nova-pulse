const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/010_user_type_procedures_v2.sql"),
      "utf8",
    ),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/010_user_type_procedures_v2.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
