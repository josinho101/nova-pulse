const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/013_user_type_procedures_v3.sql"),
      "utf8",
    ),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/013_user_type_procedures_v3.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
