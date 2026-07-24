const fs = require("fs");
const path = require("path");

const up = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/005_create_user_group_members_table.sql"),
      "utf8",
    ),
  );
  pgm.sql(
    fs.readFileSync(path.join(__dirname, "../db/procedures/006_user_group_procedures.sql"), "utf8"),
  );
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/007_user_group_member_procedures.sql"),
      "utf8",
    ),
  );
};

const down = (pgm) => {
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/007_user_group_member_procedures.down.sql"),
      "utf8",
    ),
  );
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/procedures/006_user_group_procedures.down.sql"),
      "utf8",
    ),
  );
  pgm.sql(
    fs.readFileSync(
      path.join(__dirname, "../db/tables/005_create_user_group_members_table.down.sql"),
      "utf8",
    ),
  );
};

module.exports = { up, down };
