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
var stu = [new Student("absdvjigisgj", 323232323232), new Student("a", 60)];
const jsonSave = new RSQL.RSQL(new RSQL.JSONProperties("test.json"));
jsonSave.proccess(stu);
// jsonSave.proccess([new Yeet("Test"), new Yeet("Test2")]);
// var gotStudents = jsonSave.get(Student);
// console.log(gotStudents[1]);
