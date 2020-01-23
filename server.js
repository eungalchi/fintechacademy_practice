var express = require("express");
var request = require('request');
var jwt = require('jsonwebtoken');
var tokenKey = "fintechAcademy23495";
var auth = require('./lib/auth')

app = express();
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));


var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '359812wjd',
  database : 'fintech',
  port     : '3306'
});
 
connection.connect();

app.get('/testAuth', auth, function(req, res){
    res.json("로그인 된 사용자입니다.");
})

app.get('/', function(req, res){
    res.render('index');
})

app.get('/test', function(req, res){
    res.render('test');
})

app.get('/signup', function(req, res){
    res.render('signup');
})

app.get('/login', function(req, res){
    res.render('login');
})

app.get('/authResult', function(req, res){
    var authCode = req.query.code;
    console.log(authCode);
    var option = {
        method : "POST",
        url : "https://testapi.openbanking.or.kr/oauth/2.0/token",
        headers : "",
        form : {
            code : authCode,
            client_id : '9KKyqWRW9lYZkV5goqiDYwfBbMYW9cetAIyurhAE',
            client_secret : 'PFZUIBrecec4O9BUdK8YMQHdJCYdkWxhCA9EQyhF',
            redirect_uri : 'http://localhost:3000/authResult',
            grant_type : 'authorization_code'
        }
    }
    request(option, function (error, response, body) {
        console.log(body);
        var accessRequestResult = JSON.parse(body);
        res.render('resultChild',{data : accessRequestResult})
    });
})


app.get('/dbtofront', function(req, res){
    connection.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;
        console.log('The result is: ', results);
        res.json(results);
    });
})

app.get('/main', function(req, res){
    res.render('main');
})

app.get('/balance', function(req,res){
    res.render('balance');
})

app.get('/qrcode', function(req, res){
    res.render('qrcode');
})

app.get('/qrReader', function(req, res){
    res.render('qrReader');
})

//--------------------- post 기능 --------------------------//

app.post('/login', function(req, res){
    var email = req.body.email;
    var userPassword = req.body.password;
    var sql = "SELECT * FROM fintech.user WHERE email = ?";
    connection.query(sql, [email], function (error, results, fields) {
        if (error) throw error;
        console.log(results[0].password, userPassword) ;
            if(results[0].password == userPassword){
                jwt.sign(
                    {
                        userName : results[0].name,
                        userId : results[0].id,
                        userEmail : results[0].email
                    },
                    tokenKey,
                    {
                        expiresIn : '10d',
                        issuer : 'fintech.admin',
                        subject : 'user.login.info'
                    },
                    function(err, token){
                        console.log('로그인 성공', token)
                        res.json(token)
                    }
                )
            }
            else{
                console.log('비밀번호 틀렸습니다.');
            }    
        });
})


app.post('/user', function(req, res){
    console.log(req.body);
    var name = req.body.name;
    var password = req.body.password;
    var email = req.body.email;
    var accessToken = req.body.accessToken;
    var	refreshToken = req.body.refreshToken;
	var	userseqno = req.body.userseqno;

    var sql = "INSERT INTO fintech.user (name, email, password, accesstoken, refreshtoken, userseqno) VALUES (?, ?, ?, ?, ?, ?)";
    connection.query(sql,[name, email, password, accessToken, refreshToken, userseqno], function (error, results, fields) {
        if (error) throw error;
        console.log('The result is: ', results);
        console.log('sql is ', this.sql);        
        res.json(1);
    });
})

app.post('/accountlist', auth, function(req, res){
    var userData = req.decoded;
    var sql = "SELECT * FROM user WHERE id =?"
    connection.query(sql, [userData.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            var option = {
                method : "GET",
                url : "https://testapi.openbanking.or.kr/v2.0/account/list",
                headers : {
                    'Authorization' : "Bearer " + result[0].accesstoken
                },
                qs : {
                    'user_seq_no' : result[0].userseqno,
                    'include_cancel_yn' : 'Y',
                    'sort_order' : 'D'
                }
            }
            
            request(option, function (error, response, body) {
                console.log(body);
                var parseData = JSON.parse(body);
                res.json(parseData);
            })

        }

    })
})


app.post('/balance', auth, function(req, res){
    var userData = req.decoded;
    var finusenum = req.body.fin_use_num;

    var sql ="SELECT * FROM user WHERE id = ?"
    connection.query(sql, [userData.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result);
            var random = Math.floor(Math.random() * 1000000000) + 1;    
            var ranId = "T991605830U" + random;
            var option = {
                method: 'GET',
                url: 'https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num',
                headers: {
                  'Authorization': 'Bearer ' + result[0].accesstoken
                 },
                qs : {
                    
                    bank_tran_id : ranId,
                    fintech_use_num : finusenum,
                    tran_dtime : '20200109145559'
                }
              }
              request(option, function(error,response, body){
                console.log(body);
                var parseData = JSON.parse(body);
                res.json(parseData);
            })  
        }
})
})


app.post('/balancelist', auth, function(req, res){
    var userData = req.decoded;
    var finusenum = req.body.fin_use_num;

    var sql ="SELECT * FROM user WHERE id = ?"
    connection.query(sql, [userData.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result);
            var random = Math.floor(Math.random() * 1000000000) + 1;    
            var ranId = "T991605830U" + random;
            var options = {
                method: 'GET',
                url: 'https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num',
                headers: {
                  Authorization: 'Bearer ' + result[0].accesstoken
                },
                qs : {
                    bank_tran_id : ranId,
                    fintech_use_num : finusenum,
                    inquiry_type :'A',
                    inquiry_base:'D',
                    from_date : '20190101',
                    to_date : '20190110',
                    sort_order :'D',
                    tran_dtime : '20200110102959'
                }
              }
              request(options, function (error, response, body) { 
                console.log(body);
                var parseData = JSON.parse(body);
                res.json(parseData);
              })
              
        }
})
})


app.post('/withdrawQr', auth, function(req, res){
    var userData = req.decoded;
    var finusenum = req.body.fin_use_num;

    var sql ="SELECT * FROM user WHERE id = ?"
    connection.query(sql, [userData.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result);
            var random = Math.floor(Math.random() * 1000000000) + 1;    
            var ranId = "T991605830U" + random;
           
            var options = {
                method: 'POST',
                url: 'https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num',
                headers: {
                    'Authorization': 'Bearer ' + result[0].accesstoken,
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                json: {
                    "bank_tran_id" : ranId,
                    "cntr_account_type" : "N",
                    "cntr_account_num" : "9958200419",
                    "dps_print_content" : "이용료(홍길동)",
                    "fintech_use_num" : "199160583057881543899606",
                    "wd_print_content": "오픈뱅킹출금",
                    "tran_amt": "1000",
                    "tran_dtime" : "20200110102959",
                    "req_client_name": "김정은",
                    "req_client_num": "HONGGILDONG1234",
                    "req_client_account_num" : "9958200419",
                    "req_client_bank_code": "097",
                    "transfer_purpose": "TR",
                    "recv_client_name" : "김정은",
                    "recv_client_bank_code" : "097",
                    "recv_client_account_num": "9958200419"
                 }
            }
    
            request(options, function (error, response, body) {
                console.log(body);
                var resultObject = body;
                if(resultObject.rsp_code == "A0000"){
                    res.json(1);
                } 
                else {
                    res.json(resultObject.rsp_code)
                }
    
            });
    
        }
    })
})

app.post('/withdrawQr', auth, function(req, res){
    var userData = req.decoded;
    var finusenum = req.body.fin_use_num;

    var sql ="SELECT * FROM user WHERE id = ?"
    connection.query(sql, [userData.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }
        else {
            console.log(result);
            var random = Math.floor(Math.random() * 1000000000) + 1;    
            var ranId = "T991605830U" + random;
           
            var options = {
                method: 'POST',
                url: 'https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num',
                headers: {
                    'Authorization': 'Bearer ' + result[0].accesstoken,
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                json: {
                    "bank_tran_id" : ranId,
                    "cntr_account_type" : "N",
                    "cntr_account_num" : "9958200419",
                    "dps_print_content" : "이용료(홍길동)",
                    "fintech_use_num" : "199160583057881543899606",
                    "wd_print_content": "오픈뱅킹출금",
                    "tran_amt": "1000",
                    "tran_dtime" : "20200110102959",
                    "req_client_name": "김정은", //우리
                    "req_client_num": "HONGGILDONG1234",
                    "req_client_account_num" : "9958200419",
                    "req_client_bank_code": "097",
                    "transfer_purpose": "TR",
                    "recv_client_name" : "김정은", //회사
                    "recv_client_bank_code" : "097",
                    "recv_client_account_num": "9958200419"
                 }
            }
    
            request(options, function (error, response, body) {
                console.log(body);
                var resultObject = body;
                if(resultObject.rsp_code == "A0000"){
                    res.json(1);
                } 
                else {
                    res.json(resultObject.rsp_code)
                }
    
            });
    
        }
    })
})


app.post('/depositQr', auth, function(req, res){
    var userData = req.decoded;
    var finusenum = req.body.fin_use_num;

    var sql ="SELECT * FROM user WHERE id = ?"
    connection.query(sql, [userData.userId], function(err, result){
        if(err){
            console.error(err);
            throw err;
        }   
        else {
            console.log(result);
            var random = Math.floor(Math.random() * 1000000000) + 1;    
            var ranId = "T991605830U" + random;
           
            var options = {
                method: 'POST',
                url: 'https://testapi.openbanking.or.kr/v2.0/transfer/deposit/fin_num',
                headers: {
                    'Authorization': 'Bearer ' + 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJUOTkxNjA1ODMwIiwic2NvcGUiOlsib29iIl0sImlzcyI6Imh0dHBzOi8vd3d3Lm9wZW5iYW5raW5nLm9yLmtyIiwiZXhwIjoxNTg2NzY4NjQ0LCJqdGkiOiI0MTgxNjAyYS0yODExLTQ3OWEtOGNjNC04ODcxMDI5OWZhOWEifQ.Os8RCkFzp89mxdn1cGfCTMXk9wlG4RF8sL4GHTnRGbw',//result[1].accesstoken,
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                json: {
                    "cntr_account_type": "N", 
                    "cntr_account_num": "0460562799",
                    "wd_pass_phrase": "NONE", 
                    "wd_print_content": "이용료(홍길동)", 
                    "name_check_option": "on", 
                    "tran_dtime": "20200110102959", 
                    "req_cnt": "1", 
                    "req_list": [
                        { "tran_no": "1", 
                        "bank_tran_id": ranId, 
                        "fintech_use_num": "199160583057881543899606", 
                        "print_content": "오픈서비스캐시백", 
                        "tran_amt": "500", 
                        "req_client_name": "김정남", 
                        "req_client_bank_code": "097", 
                        "req_client_account_num": "0460562799", 
                        "req_client_num": "HONGGILDONG1234", 
                        "transfer_purpose":   "TR" 
                        }
                        ]
                    }
            }
    
            request(options, function (error, response, body) {
                console.log(body);
                var resultObject = body;
                if(resultObject.rsp_code == "A0000"){
                    res.json(1);
                } 
                else {
                    res.json(resultObject.rsp_code)
                }
    
            });
    
        }
    })
})



app.listen(port);
console.log("Listening on port ", port);
