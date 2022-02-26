export const sqlDB = {
  database: 'ionic-sql',
  version: 1,
  encrypted: true,
  mode: 'secret',
}

export const dbschema: string = `
CREATE TABLE IF NOT EXISTS app_data (
    id INTEGER PRIMARY KEY NOT NULL,
    key_name TEXT NOT NULL,
    value_data TEXT NOT NULL,
    date_added INTEGER DEFAULT (strftime(\'%s\', \'now\')),
    last_modified INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS offline_login (
    id INTEGER PRIMARY KEY NOT NULL,
    login_date INTEGER DEFAULT (strftime(\'%s\', \'now\')),
    login_data TEXT NOT NULL,
    last_modified INTEGER
  );
`;