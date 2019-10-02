const fs = require('fs');

class Properties{
    constructor(name){
        this.name = name;
    }
}

class JSONProperties extends Properties{
    constructor(name){
        super(name);
    }
}

class RSQL {
    constructor(prop){
        this.property = prop;
    }
    
    /**
     * Proccess data in sync form
     * @param {*} listOfObjects 
     */
    proccess(listOfObjects){
        let clazz = listOfObjects[0].constructor;
        if(!fs.existsSync(this.property.name)){
            var objs = [[clazz.name, listOfObjects]];
            fs.writeFileSync(this.property.name, JSON.stringify(objs), function(){});
            return;
        }
        var data = fs.readFileSync(this.property.name);
        var js = JSON.parse(data);
        for(let i in js){
            if(js[i][0] == clazz.name){
                js.splice(i, 1);
                js.push([clazz.name, listOfObjects]);
                fs.writeFileSync(this.property.name, JSON.stringify(js), function(){});
                return;
            }
        }
        js.push([clazz.name, listOfObjects]);
        fs.writeFileSync(this.property.name, JSON.stringify(js), function(){});

    }

    /**
     * Get data in sync.
     * @param {*} clazz 
     */
    get(clazz){
        var data = fs.readFileSync(this.property.name);
        var json = JSON.parse(data);
        for(let i in json){
            if(json[i][0] == clazz.name){
                var objList = [];
                for(let x in json[i][1]){
                    let obj = new clazz();
                    for(let prop in Reflect.ownKeys(json[i][1][x])){
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
}
module.exports = {
    RSQL: RSQL, 
    JSONProperties: JSONProperties
};