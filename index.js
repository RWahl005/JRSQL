const fs = require('fs');
const mysql = require('mysql');
const sqlite = require('sqlite3').verbose();

/**
 * The states at which a proccess can be completed or failed with.
 */
const ProccessStates = {
    CreatedSuccess: "Created_Success",
    Success: "Success",
    LimitReached: "Limit_Reached"
}

/**
 * Generic Properties Class
 */
class Properties {
    constructor(name) {
        this.name = name;
    }
}

/**
 * Put RSQL into JSON mode.
 */
class JSONProperties extends Properties {
    /**
     * Put RSQL into JSON mode.
     * @param {String} name The name of the file (Includes the .json) Ex: test.json
     */
    constructor(name) {
        super(name);
    }
}

class MYSQLProperties extends Properties {
    constructor(name, host, user, password) {
        super(name);
        this.host = host;
        this.user = user;
        this.password = password;
        this.decimalType = "FLOAT";
    }
    /**
     * Change the type of decimal that is saved. (Default is FLOAT) (Options are: FLOAT and DOUBLE)
     * @param {*} type 
     */
    setDecimalType(type) {
        this.decimalType = type;
    }
}

/**
 * Put RSQL into SQL mode.
 * Notice: SQL can only run in Async mode. **Sync mode is not an option.**
 */
class SQLiteProperties extends Properties {
    /**
     * Put RSQL into SQL mode.
     * Notice: SQL can only run in Async mode. **Sync mode is not an option.**
     * @param {*} name The name of the database file. Including the .db (Ex: test.db)
     */
    constructor(name) {
        super(name);
        this.decimalType = "FLOAT";
    }
    /**
     * Change the type of decimal that is saved. (Default is FLOAT) (Options are: FLOAT and DOUBLE)
     * @param {*} type 
     */
    setDecimalType(type) {
        this.decimalType = type;
    }
}


/**
 * Handles data returned from async mode.
 */
class Proccessor {
    constructor(instRsql, reason) {
        this.rsql = instRsql;
        this.reason = reason;
    }

    /**
     * Get the instance of the RSQL file.
     */
    getRSQL() {
        return this.rsql;
    }

    /**
     * Get the reason.
     */
    getReason() {
        return this.reason;
    }
}

/**
 * The Main Class that Handles data.
 */
class RSQL {
    /**
     * Configure the format you want the data to be saved in.
     * @param {*} prop 
     */
    constructor(prop) {
        this.property = prop;
        this.asyncActions = [];
        this.limit = 10;
    }

    /**
     * Proccess data in sync form
     * @param {*} listOfObjects The list of objects to return from the processes.
     */
    proccess(listOfObjects) {
        if (this.property instanceof JSONProperties)
            proccessJSON(listOfObjects, this.property);
        else if (this.property instanceof MYSQLProperties)
            proccessMYSQL(listOfObjects, this.property);
        else if (this.property instanceof SQLiteProperties) {
            return new Promise((resolve, reject) => {
                proccessSQLite(listOfObjects, this.property).then(() => {
                    resolve(new Proccessor(this, "Complete"));
                })
            });
        }
    }

    /**
     * Proccess Data Asynchronously
     * @param {*} listOfObjects The list of objects to proccess.
     */
    proccessAsync(listOfObjects) {
        const inst = this;
        return new Promise((resolve, reject) => {
            if (inst.asyncActions.length > inst.limit) {
                reject(new Proccessor(null, ProccessStates.LimitReached));
            }
            if (this.property instanceof JSONProperties)
                resolve(new Proccessor(inst, proccessJSON(listOfObjects, inst.property)));
        });
    }

    /**
     * Get data in sync.
     * @param {*} clazz The class to get the data for.
     */
    get(clazz) {
        if (this.property instanceof JSONProperties) return getJSON(clazz, this.property.name);
        if (this.property instanceof SQLiteProperties) return getSQLite(clazz, this.property);
    }

    /**
     * Get the data Asynchronously
     * @param {*} clazz The class to get the data for.
     */
    getAsync(clazz) {
        return new Promise((resolve, reject) => {
            if (this.property instanceof JSONProperties) {
                var data = getJSON(clazz, this.property.name);
                if (data == null)
                    reject("Cannot find data for request class.");
                else
                    resolve(data);
            }
            if(this.property instanceof SQLiteProperties){
                resolve(getSQLite(clazz, this.property));
            }
        });
    }

    /**
     * Delete the data for the entire class.
     * @param {*} clazz 
     */
    delete(clazz) {
        if (this.asyncActions.length > 0) {
            throw ("Error: Cannot delete synchronously when async proccesses are in motion.");
        }
        var js = fs.readFileSync(this.property.name);
        let data = JSON.parse(js);
        for (let i in data) {
            if (data[i][0] == clazz.name) {
                data.splice(i, 1);
                fs.writeFileSync(this.property.name, JSON.stringify(data), function () {});
                return true;
            }
        }
        return false;
    }

    deleteAsync() {

    }

    /**
     * See if a class is currently being written to.
     * @param {*} clazz  
     */
    isBeingProccessed(clazz) {
        for (let i in this.asyncActions) {
            if (this.asyncActions[i][0] == clazz)
                return true;
        }
        return false;
    }
}

function getJSON(clazz, name) {
    var data = fs.readFileSync(name);
    var json = JSON.parse(data);
    for (let i in json) {
        if (json[i][0] == clazz.name) {
            var objList = [];
            for (let x in json[i][1]) {
                let obj = new clazz();
                for (let prop in Reflect.ownKeys(json[i][1][x])) {
                    let curProp = Reflect.ownKeys(json[i][1][x])[prop];
                    let curPropValue = Reflect.get(json[i][1][x], curProp);
                    Reflect.set(obj, curProp, curPropValue);
                }
                objList.push(obj);
            }
            return objList;
        }
    }
    return null;
}

function proccessJSON(listOfObjects, property) {
    let clazz = listOfObjects[0].constructor;
    if (!fs.existsSync(property.name)) {
        var objs = [
            [clazz.name, listOfObjects]
        ];
        fs.writeFileSync(property.name, JSON.stringify(objs), function () {});
        return ProccessStates.CreatedSuccess;
    }
    var data = fs.readFileSync(property.name);
    var js = JSON.parse(data);
    for (let i in js) {
        if (js[i][0] == clazz.name) {
            js.splice(i, 1);
            js.push([clazz.name, listOfObjects]);
            fs.writeFileSync(property.name, JSON.stringify(js), function () {});
            return ProccessStates.Success;
        }
    }
    js.push([clazz.name, listOfObjects]);
    fs.writeFileSync(property.name, JSON.stringify(js), function () {});
    return ProccessStates.Success;
}

function proccessMYSQL(listOfObjects, property) {
    let clazz = listOfObjects[0].constructor;
    let connection = mysql.createConnection({
        host: property.host,
        user: property.user,
        password: property.password,
        database: property.name,
        port: 3306
    });
    connection.connect((e) => console.log(e));
    connection.query('drop table if exists ' + clazz.name);
    connection.query('create table ' + clazz.name + '(' + getSQLColumnName(listOfObjects[0]) + ')');
    for (let i in listOfObjects) {
        connection.query(`insert into ${clazz.name} values(${getSQLValues(listOfObjects[i])})`);
    }

    connection.end();
}


async function proccessSQLite(listOfObjects, property) {
    let clazz = listOfObjects[0].constructor;
    let db = new sqlite.Database(`${property.name}`);
    // db.run('drop table if exists ' + clazz.name);
    // db.run('create table ' + clazz.name + '(' + getSQLColumnName(listOfObjects[0]) + ')');
    // for(let i in listOfObjects){
    //     db.run(`insert into ${clazz.name} values(${getSQLValues(listOfObjects[i])})`);
    // }
    return proccessData(clazz.name, listOfObjects).then(() => db.close());

    function proccessData(clazzName, listOfObjects) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('drop table if exists ' + clazzName)
                    .run('create table ' + clazzName + '(' + getSQLColumnName(listOfObjects[0]) + ')');
                let times = 1;
                for (let i in listOfObjects) {
                    db.run(`insert into ${clazz.name} values(${getSQLValues(listOfObjects[i])})`, () => {
                        if (times == listOfObjects.length) resolve();
                        else times++;
                    });
                }
            });

        });
    }
}

async function getSQLite(clazz, properties) {
    let db = new sqlite.Database(`${properties.name}`, sqlite.OPEN_READONLY);
    var get = new Promise((resolve, reject) => {
            var output = [];
            db.all('SELECT * FROM ' + clazz.name, (errors, rows) => {
                if (errors) {
                    reject(errors);
                }
                for (let i in rows) {
                    let obj = new clazz();
                    let keys = Reflect.ownKeys(rows[i]);
                    for (let x in keys) {
                        var value = Reflect.get(rows[i], keys[x]);
                        Reflect.set(obj, keys[x], value);
                    }
                    output.push(obj);
                }
                resolve(output);
            });
        });
    // db.close();
    // return output;
    return get.then((output) => {db.close(); return output;});
}

function getSQLColumnName(exObj) {
    var keys = Reflect.ownKeys(exObj);
    var output = "";
    for (let i in keys) {
        if (Reflect.get(exObj, keys[i]) === parseInt(Reflect.get(exObj, keys[i]), 10)) { //TODO Replace?
            if (output != "") output += ", " + keys[i] + " INT";
            else output += keys[i] + " INT";
        }
        if (typeof Reflect.get(exObj, keys[i]) === 'string') {
            let value = Reflect.get(exObj, keys[i]);
            if (value.length < 65535) {
                if (output != "") output += ", " + keys[i] + " TEXT";
                else output += keys[i] + " TEXT";
            } else {
                if (output != "") output += ", " + keys[i] + " MEDIUMTEXT";
                else output += keys[i] + " MEDIUMTEXT";
            }
        }
        if (Number(Reflect.get(exObj, keys[i])) === Reflect.get(exObj, keys[i]) && Reflect.get(exObj, keys[i]) % 1 !== 0) {
            if (output != "") output += ", " + keys[i] + " FLOAT";
            else output += keys[i] + " FLOAT";
        }
        if (typeof Reflect.get(exObj, keys[i]) === 'boolean') {
            if (output != "") output += ", " + keys[i] + " BOOLEAN";
            else output += keys[i] + " BOOLEAN";
        }
    }
    return output;
}

function getSQLValues(obj) {
    var keys = Reflect.ownKeys(obj);
    var output = "";
    for (let i in keys) {
        if (typeof keys[i] === "string") {
            output += "'" + Reflect.get(obj, keys[i]).toString().replace("'", "%$0027$%") + "'";
        } else if (keys[i].constructor.name == "Array") {
            output += generateList(Reflect.get(obj, keys[i]));
        } else
            output += Reflect.get(obj, keys[i]);
        if (keys.length > (i + 1)) output += ", ";
    }
    return output;
}

function generateList(list) {
    var output = "'RSQLLIST[";
    for (let i in list) {
        output += "`" + list[i].replace("'", "%$0027$%").replace("`", "%$0060$%").replace('"', "%$0022$%").replace("|", "%$007C$%")
            .replace("[", "%$005B$%").replace("]", "%$005D$%");
        if (i < list.size() - 1)
            output += "`|";
    }
    output += "`]'";
    return output;
}

module.exports = {
    RSQL: RSQL,
    JSONProperties: JSONProperties,
    MYSQLProperties: MYSQLProperties,
    SQLiteProperties: SQLiteProperties,
    ProccessStates: ProccessStates,
    Proccessor: Proccessor
};