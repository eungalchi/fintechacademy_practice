var fs = require('fs');

console.log('첫번째 기능입니다.');
function callbackFunc(callback){
    fs.readFile('./example/text.txt', 'utf8', function (err, result) {
        if (err) {
            console.error(err);
            throw err;
        }
        else {
            console.error("두번째 기능인데 파일을 읽어오느라 시간이... 조큼 ... 걸려요");
            callback(result)
        }
    });
}

callbackFunc(function(readResult){
    console.log(readResult)
    console.log("c")
})