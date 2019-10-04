const fs = require('fs');

const ProccessStates = {
    CreatedSuccess: "Created_Success",
    Success: "Success",
    LimitReached: "Limit_Reached"
}

class Properties {
    constructor(name) {
        this.name = name;
    }
}

class JSONProperties extends Properties {
    constructor(name) {
        super(name);
    }
}

class Proccessor{
    constructor(instRsql, reason){
        this.rsql = instRsql;
        this.reason = reason;
    }

    getRSQL(){
        return this.rsql;
    }

    getReason(){
        return this.reason;
    }
}

class RSQL {
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
        let clazz = listOfObjects[0].constructor;
        if (!fs.existsSync(this.property.name)) {
            var objs = [
                [clazz.name, listOfObjects]
            ];
            fs.writeFileSync(this.property.name, JSON.stringify(objs), function () {});
            return;
        }
        var data = fs.readFileSync(this.property.name);
        var js = JSON.parse(data);
        for (let i in js) {
            if (js[i][0] == clazz.name) {
                js.splice(i, 1);
                js.push([clazz.name, listOfObjects]);
                fs.writeFileSync(this.property.name, JSON.stringify(js), function () {});
                return;
            }
        }
        js.push([clazz.name, listOfObjects]);
        fs.writeFileSync(this.property.name, JSON.stringify(js), function () {});

    }

    /**
     * Proccess Data Asynchronously
     * @param {*} listOfObjects The list of objects to proccess.
     */
    proccessAsync(listOfObjects) {
        const inst = this;
        return new Promise((resolve, reject) => {
            let clazz = listOfObjects[0].constructor;
            if(inst.asyncActions.length > inst.limit){
                reject(new Proccessor(null, ProccessStates.LimitReached));
            }
            console.log(this);
            inst.asyncActions.push([clazz, this]);
            for(let i = 0; i < 100000; i++){};
            while(inst.asyncActions.indexOf([clazz, this]) > 0){}
            if (!fs.existsSync(inst.property.name)) {
                var objs = [[clazz.name, listOfObjects]];
                fs.writeFileSync(inst.property.name, JSON.stringify(objs), function () {});
                inst.asyncActions.splice(inst.asyncActions.indexOf([clazz, this]), 1);
                resolve(new Proccessor(inst, ProccessStates.CreatedSuccess));
                return;
            }
            var data = fs.readFileSync(inst.property.name);
            var js = JSON.parse(data);
            for (let i in js) {
                if (js[i][0] == clazz.name) {
                    js.splice(i, 1);
                    js.push([clazz.name, listOfObjects]);
                    fs.writeFileSync(inst.property.name, JSON.stringify(js), function () {});
                    inst.asyncActions.splice(inst.asyncActions.indexOf([clazz, this]), 1);
                    resolve(new Proccessor(inst, ProccessStates.Success));
                    return;
                }
            }
            js.push([clazz.name, listOfObjects]);
            fs.writeFileSync(inst.property.name, JSON.stringify(js), function () {});
            inst.asyncActions.splice(inst.asyncActions.indexOf([clazz, this]), 1);
            resolve(new Proccessor(inst, ProccessStates.Success));
            return;
        });

    }

    /**
     * Get data in sync.
     * @param {*} clazz The class to get the data for.
     */
    get(clazz) {
        var data = fs.readFileSync(this.property.name);
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
    }

    delete(clazz){
        if(this.asyncActions.length > 0){
            throw("Error: Cannot delete synchronously when async proccesses are in motion.");
        }
        var js = fs.readFileSync(this.property.name);
        let data = JSON.parse(js);
        for(let i in data){
            if(data[i][0] == clazz.name){
                data.splice(i, 1);
                fs.writeFileSync(this.property.name, JSON.stringify(data), function () {});
                return true;
            }
        }
        return false;
    }

    deleteAsync(){

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

module.exports = {
    RSQL: RSQL,
    JSONProperties: JSONProperties,
    ProccessStates: ProccessStates,
    Proccessor: Proccessor
};