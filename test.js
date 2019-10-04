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
var stu = [new Student("afs", 323232323232), new Student("a", 60)];
const jsonSave = new RSQL.RSQL(new RSQL.JSONProperties("test.json"));

jsonSave.proccessAsync(stu).then( res => {
    const rs = res.getRSQL();
    console.log(rs.asyncActions);
    // console.log(res.getReason())
    var gotStu = rs.get(Student);
    // console.log(gotStu[0])
    console.log("done");
});
// for(let i = 0; i < 100; i++){
//     jsonSave.proccessAsync(stu).then( res => {
//         console.log("works");
//     });
// }
console.log(jsonSave.asyncActions);
console.log("test");
jsonSave.delete(Student);
// jsonSave.proccess([new Yeet("Test"), new Yeet("Test2")]);
// var gotStudents = jsonSave.get(Yeet);
// console.log(gotStudents[1]);
