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
    constructor(name, a){
        this.name = name;
        this.a = a;
    }
}

const test = new RSQL.RSQL(new RSQL.SQLiteProperties("Userss.db"));
test.proccess([new Yeet("test", 43), new Yeet("test2", 33)]).then((proccesor) => {
    proccesor.getRSQL().get(Yeet).then((data) => {
        console.log(data[0].name);
    })
});

var data = [new Student("ha", 534), new Student("oof", 34)];
test.proccess(data).then(proccesor => {
    proccesor.getRSQL().get(Student).then(data => {
        console.log(data[0].name);
    })
});