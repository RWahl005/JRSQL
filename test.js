const RSQL = require('./index.js');
class Student{
    constructor(name, age){
        this.name = name
        this.age = age;
    }
    getName(){
        return this.name;
    }
}
class Yeet{
    constructor(name){
        this.name = name;
    }
}
const jsonSave = new RSQL.RSQL(new RSQL.JSONProperties("test.json"));

var stu = [];
for(var i = 0; i < 100; i++){
    stu.push(new Student("tes", Math.random()));
}
// jsonSave.proccess(stu);
jsonSave.proccessAsync(stu);
jsonSave.getAsync(Student).then(data => {
    console.log(data[4]);
}
);
console.log("test");
