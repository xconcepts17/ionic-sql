import { Injectable } from '@angular/core';
import {
    CapacitorSQLite,
    capSQLiteChanges,
    capSQLiteResult,
    SQLiteConnection,
    SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { AlertController } from '@ionic/angular';
import { format } from 'date-fns';
import { dbschema, sqlDB } from './app-storage-db-schema';

@Injectable({
    providedIn: 'root',
})
export class AppStorageService {
    platform: string = '';
    sqlitePlugin: any;
    sqlite: SQLiteConnection;
    isService: boolean = false;
    native: boolean = false;
    private initPlugin: boolean = false;
    public isWeb: boolean = false;
    db: SQLiteDBConnection;
    dbName = '';
    constructor(public alertCtrl: AlertController) {
        this.dbName = sqlDB.database;
    }

    initializeSQlite(): Promise<boolean> {
        return new Promise((resolve) => {
            this.platform = Capacitor.getPlatform();
            // console.log(this.platform);
            if (this.platform === 'ios' || this.platform === 'android') {
                this.native = true;
            }
            this.sqlitePlugin = CapacitorSQLite;
            this.sqlite = new SQLiteConnection(this.sqlitePlugin);
            this.isService = true;
            resolve(true);
        });
    }

    init() {
        // console.log('got-hit');
        this.initializeSQlite().then(async (res) => {
            this.initPlugin = res;
            const p: string = this.platform;
            console.log(p);
            if (p === 'web') {
                this.isWeb = true;
                await customElements.whenDefined('jeep-sqlite');
                const jeepSqliteEl: any = document.querySelector('jeep-sqlite');
                console.log(jeepSqliteEl);
                if (jeepSqliteEl != null) {
                    await this.initWebStore();
                } else {
                    this.showAlert('jeepSqliteEl is null');
                    console.log('$$ jeepSqliteEl is null');
                }
            }
            try {
                let dbAvailable = await this.isDatabase();
                // console.log(dbAvailable);
                if (!dbAvailable.result) {
                    this.createDb();
                } else {
                    this.connectDb();
                }
            } catch (error) {
                this.showAlert(`Error: ${error}`);
                console.log(`Error: ${error}`);
                this.initPlugin = false;
            }

        });
    }

    // web
    async initWebStore(): Promise<void> {
        if (this.platform !== 'web') {
            return Promise.reject(
                new Error(`not implemented for this platform: ${this.platform}`)
            );
        }
        if (this.sqlite != null) {
            try {
                let webStore = await this.sqlite.initWebStore();
                this.logger('webstore' + webStore);
                return Promise.resolve();
            } catch (err) {
                return Promise.reject(new Error(err));
            }
        } else {
            return Promise.reject(new Error(`no connection open`));
        }
    }

    // alert
    async showAlert(msg) {
        const alert = await this.alertCtrl.create({
            header: 'Error',
            message: msg,
            buttons: ['OK'],
        });
        await alert.present();
    }

    // dbAvaliable
    async isDatabase(): Promise<capSQLiteResult> {
        if (this.sqlite != null) {
            try {
                return Promise.resolve(await this.sqlite.isDatabase(this.dbName));
            } catch (err) {
                return Promise.reject(new Error(err));
            }
        } else {
            return Promise.reject(new Error(`no connection open`));
        }
    }

    // create Db
    async createDb() {
        this.db = await this.createDbConnection();
        await this.db.open();
        let ret: any = await this.db.execute(dbschema);
        if (ret.changes.changes < 0) {
            return Promise.reject(new Error("Execute createSchema failed"));
        }
        await this.db.close();
    }

    async connectDb() {
        this.db = await this.createDbConnection();
    }

    async disconnectDb() {
        await this.sqlite.closeAllConnections();
    }

    private async createDbConnection(): Promise<SQLiteDBConnection> {
        if ((await this.isConnection()).result) {
            const db = await this.retrieveConnection();
            if (db != null) {
                return Promise.resolve(db);
            } else {
                return Promise.reject(new Error(`no db returned is null`));
            }
        } else {
            if (this.sqlite != null) {
                try {
                    const db: SQLiteDBConnection = await this.sqlite.createConnection(this.dbName, sqlDB.encrypted, sqlDB.mode, sqlDB.version);
                    if (db != null) {
                        return Promise.resolve(db);
                    } else {
                        return Promise.reject(new Error(`no db returned is null`));
                    }
                } catch (err) {
                    console.log(err);
                    return Promise.reject(new Error(err));
                }
            }
        }
    }
    async retrieveConnection(): Promise<SQLiteDBConnection> {
        if (this.sqlite != null) {
            try {
                return Promise.resolve(await this.sqlite.retrieveConnection(this.dbName));
            } catch (err) {
                return Promise.reject(new Error(err));
            }
        } else {
            return Promise.reject(new Error(`no connection open for ${this.dbName}`));
        }
    }

    async isConnection(): Promise<capSQLiteResult> {
        if (this.sqlite != null) {
            try {
                return Promise.resolve(await this.sqlite.isConnection(this.dbName));
            } catch (err) {
                return Promise.reject(new Error(err));
            }
        } else {
            return Promise.reject(new Error(`no connection open`));
        }
    }

    async deleteDatabase(): Promise<void> {
        try {
            if (this.db) {
                let ret: any = await this.db.isExists();
                console.log(ret);
                if (ret.result) {
                    const dbName = this.db.getConnectionDBName();
                    // debugger;
                    await this.db.delete();
                    await this.sqlite.closeAllConnections();
                    return Promise.resolve();
                } else {
                    return Promise.resolve();
                }
            } else {
                console.log('DB not initialized');
                return Promise.reject('DB not initialized');
            }
        } catch (err) {
            return Promise.reject(err);
        }
    }

    uuidv4() {
        return Math.random().toString().slice(2, 11);
    }

    proccessQuery(qry, type): Promise<any> {
        // select - query, insert - run , update - execute
        return new Promise((resolve) => {
            const interval = setInterval(async () => {
                if (this.db) {
                    clearInterval(interval);
                    await this.db.open();
                    let qryResponse: any = '';
                    switch (type) {
                        case 'query':
                            qryResponse = await this.db.query(qry);
                            break;
                        case 'run':
                            qryResponse = await this.db.run(qry);
                            break;
                        case 'execute':
                            qryResponse = await this.db.execute(qry);
                            break;
                        default:
                            break;
                    }
                    await this.db.close();
                    resolve(qryResponse);
                } else {
                    console.log('DB is Null');
                }
            }, 400)
        });
    }

    setData(key, value): Promise<boolean> {
        return new Promise(async (resolve) => {
            let selectQry = "SELECT * FROM app_data WHERE key_name = '" + key + "';";
            let qryResponse = await this.proccessQuery(selectQry, 'query');
            let jvalue = JSON.stringify(value);
            jvalue = jvalue.replace(/\'/g, "''");
            const date_added = format(new Date(), 'yyyy-MM-dd HH:mm');
            if (qryResponse.values.length === 0) {
                const id = this.uuidv4();
                let insertQry =
                    "INSERT INTO app_data (id, key_name, value_data, date_added) VALUES ('" + id + "', '" + key + "', '" + jvalue + "', '" + date_added + "');";
                let insertResponse = await this.proccessQuery(insertQry, 'run');
                if (insertResponse.changes) {
                    resolve(true);
                } else {
                    this.showAlert(insertResponse);
                }
            } else {
                // console.log('Update Qry');
                let updateQry =
                    "UPDATE app_data SET value_data = '" +
                    jvalue +
                    "' WHERE key_name = '" +
                    key +
                    "'";
                let updateResponse = await this.proccessQuery(updateQry, 'execute');
                if (updateResponse.changes) {
                    resolve(true);
                } else {
                    this.showAlert(updateResponse);
                }
            }
        });
    }

    getData(key) {
        return new Promise(async (resolve) => {
            let selectQry = "SELECT * FROM app_data WHERE key_name = '" + key + "';";
            let qryResponse = await this.proccessQuery(selectQry, 'query');
            if (qryResponse.values.length === 0) {
                return resolve(null);
            } else {
                let data = qryResponse.values[0];
                return resolve(JSON.parse(data.value_data));
            }
        });
    }

    logger(val: any) {
        console.log(val);
    }
}