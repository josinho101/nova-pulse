const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/005_alter_users_add_phone_and_optional_address.sql"),
      "utf8",
    ),
  );
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/procedures/006_user_procedures_v2.sql"), "utf8"),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/procedures/006_user_procedures_v2.down.sql"), "utf8"),
  );
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/005_alter_users_add_phone_and_optional_address.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
