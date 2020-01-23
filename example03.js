var cars = [];

var car01 = {
	name : "sonata",
	ph : "500ph",
	start : function () {
		console.log("engine is starting");
	},
	stop : function () {
		console.log("engine is stoped");
	}
}

var car02 = {
	name : "bmw",
	ph : "500ph",
	start : function () {
		console.log("engine is starting");
	},
	stop : function () {
		console.log("engine is stoped");
	}
}


var car03 = {
	name : "poter",
	ph : "500ph",
	start : function () {
		console.log("engine is starting");
	},
	stop : function () {
		console.log("engine is stoped");
	}
}

cars[0] = car01
cars[1] = car02
cars[2] = car03

//----------------------
for(var i = 0; i < cars.length; i ++){
    console.log(cars[i].name);
    //---- 자동차 이름이 BMW 일때 FIND 출력 ----///
    if(cars[i].name == "bmw"){
        console.log('find!');
    }
}
//----------------------
