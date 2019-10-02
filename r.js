const fs = require('fs');

class Properties{
    constructor(name){
        this.name = name;
    }
}

class JSONProperties{
    constructor(name){
        super(name);
    }
}

class RSQL {
    constructor(prop){
        this.property = prop;
    }
    
    proccess(listOfObjects){
        let clazz = typeof listOfObjects[0];
        if(!fs.existsSync(this.property.name)){
            var objs = [clazz, listOfObjects];
            fs.writeFile(this.property.name, JSON.stringify(objs));
        }
    }
}
module.exports = {
    RSQL: RSQL, 
    JSONProperties: JSONProperties
};