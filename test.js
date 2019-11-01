const RSQL = require('./rsql.js');

class ExampleClass{
    constructor(name, age, float){
        this.name = name;
        this.age = age;
        this.float = float;
    }
}

class ExampleData{
    constructor(name, alive){
        this.name = name;
        this.alive = alive;
    }
}

const rinst = new RSQL.RSQL(new RSQL.MongoDBProperties({
    address: 'mongodb://localhost:27017',
    name: 'abc'
}));
const cl = [new ExampleClass("test", 21, 2.4), new ExampleClass("yes", 21, 3223.4)];
rinst.proccess(cl).then((result) => {
    result.getRSQL().get(ExampleClass).then((data) => {
        console.log(data);
    })
})
rinst.proccess([new ExampleData("Test", false), new ExampleData("Other", true)])

// let data = rinst.get(ExampleClass);
// data.then((d) => {
//     console.log(d);
// })




// const RSQL = require('./index.js');
// class Student{
//     constructor(name, age){
//         this.name = name
//         this.age = age;
//     }
//     getName(){
//         return this.name;
//     }
// }
// class Yeet{
//     constructor(name, a){
//         this.name = name;
//         this.a = a;
//     }
// }

// const test = new RSQL.RSQL(new RSQL.SQLiteProperties("Userss.db"));
// // test.proccess([new Yeet("test", 43), new Yeet("test2", 33)]).then((proccesor) => {
// //     proccesor.getRSQL().get(Yeet).then((data) => {
// //         console.log(data[0].name);
// //     })
// // });

// // var data = [new Student("ha", 534), new Student("oof", 34)];
// // test.proccess(data).then(proccesor => {
// //     proccesor.getRSQL().get(Student).then(data => {
// //         console.log(data[1].age);
// //     });
// // });

// test.proccess([new Yeet("test", 43)]).then((proccesor) => {
//     console.log("done");
// })
// // test.proccess([new Yeet("a", 12)]).then((proccesor) => {
// //     console.log("test 2");
// // })

// test.get(Yeet).then(data => {
//     console.log(data);
// })