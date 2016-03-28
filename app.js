var express= require('express');
var app= express();

var bodyParser= require('body-parser');
var http= require("http");
//var url= require("url");


//app.set('view engine', 'html'); //?

app.use(express.static('public')); //тут усі статичні файли, як-то: favicon, javascripts, style.css etc




app.use(bodyParser.urlencoded({'extended': 'true'})); //без цього не хотіло читати дані POST :) Очевидно!
app.use(bodyParser.json());

//var fs= require('fs');


var MongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/test';
var mongoUrl = 'mongodb://eliftech:1@ds025239.mlab.com:25239/eliftech_companies';


var methodOverride= require("method-override");
//------------------------------------------------------------------------------




app.get('/', function (req, res) { //index
	//res.render('index.html');
	//console.log( ">", req.body.test );//x


	//res.sendFile(__dirname+'/public/index.html');
	res.end();//

	//var uName = url.parse(req.url, true).query.uName || "Anonymous";
	//console.log("start refresh | uName: ", uName);//x
});

function buildArrayById(arr1) {
	//var tmp= array;
	var arr2= [];
	for (var key in arr1) {
		//console.log("--",key,arr1[key]);
		arr2[arr1[key].id]= arr1[key];
	}
	//console.log(">>",arr2);
	return arr2;
}

app.get("/API/get-companies", function(req,res) {
	console.log("API GET");

	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;

		var collection= db.collection('companies');
		collection.find().toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;

			//console.log(results);


			var list= buildArrayById(results);

			//console.log(list);
			db.close();

			//...
			res.json({  list });
		});

	});

});

app.post("/API/add-company", function(req,res) { //insert new company
	console.log("API POST");

	var company= req.body;
	console.log(company);

	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;

		var collection= db.collection('companies');

		collection.find().toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;


			var count= buildArrayById(results).length;

			company.id= count;

			collection.insert(company, function(err,docs) {
				if (err) throw err;
				//console.log("docs after insert:",docs);//x
				db.close();

				res.json({ id: count });

			});
		});
		/*
		collection.count(function(err, count) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;
			console.log(count);//x
			company.id= count;

			collection.insert(company, function(err,docs) {
				if (err) throw err;
				console.log("docs after insert:",docs);//x
				db.close();

				res.json({ id: count });

			});

		});
		*/
	});

});



app.put("/API/update-company", function(req,res) {
	console.log("API PUT");

	var company= req.body;
	console.log("update:",company.id,company.name);


	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;

		var collection= db.collection('companies');
		collection.update({id: parseInt(company.id)}, {	$set:{
			"name": company.name,
			"eE": parseFloat(company.eE)
		}}, { w:1}, function(err,docs) {
			if (err) throw err;
			//console.log(docs);
			db.close();

			res.json({ answer: "ok" });

		});

	});

});



app.delete("/API/delete-company", function(req,res) {
	console.log("API DEL");

	var idSet= req.body.idSet;
	console.log("del:",idSet);


	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;

		var collection= db.collection('companies');
		for (var key in idSet) {
			//console.log("[x]:",idSet[key]);
			collection.deleteOne({id: parseInt(idSet[key])});
		}

	});

});






app.post('/AJAX/sign-up', function(req,res) { //AJAX sign up
	//only from original site
	var dateTime= new Date().getTime();

	console.log( req.body.CMLogin, " | ", dateTime );//x

	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;



		var collection= db.collection('users');
		collection.find({ CMLogin: req.body.CMLogin }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;
			console.log(results);//x


			if (results.length) {
				db.close();

				var answer= "user already exits";
				res.json({ answer }); //user exits
			} else {
				collection.insert({
					CMLogin: req.body.CMLogin, //email
					CMPassword: req.body.CMPassword,
					CMEmail: req.body.CMEmail,
					dateTime: dateTime
				}, function(err,docs) {
					if (err) throw err;

					db.close();

					var answer= "registration succesfull";
					res.json({ answer }); //ok
				});
			}



			//db.close();

			//answer= results;
			//res.json({ answer });
			//console.log(answer);
		});


	});
});




app.post('/AJAX/get-app', function(req,res) { //AJAX get app
	//original page only
	var dateTime= new Date().getTime();
	console.log(dateTime,req.body.CMLogin,req.body.CMPassword);//x - hostDomain ДОЦІЛЬНІШЕ ВИЗНАЧАТИ ПРЯМО В app.js
	var answer= "---";

	var fileStamp= fs.readFileSync("public/comment-more.user.js","utf8");
	var CMVersion= fs.readFileSync("public/CMVersion.txt","utf8").trim();

	fileStamp= fileStamp.replace("var CMLogin=undefined;","var CMLogin=\""+req.body.CMLogin+"\";")
	.replace("var CMPassword=undefined;","var CMPassword=\""+req.body.CMPassword+"\";")
	.replace("var hostDomain=\"http://localhost:3000/\";","var hostDomain=\""+req.body.hostDomain+"\";")
	.replace("var CMVersion=\"0.0\";","var CMVersion=\""+CMVersion+"\";");


	fileStamp= "// ==UserScript==\n// @name CommentMore\n// @namespace comment-more\n// @description	comment on any web page\n// @include http*\n// @version "+CMVersion+"\n// @require "+req.body.hostDomain+"jquery/jquery-1.12.0.min.js\n// @require "+req.body.hostDomain+"jquery-ui-1.11.4.custom/jquery-ui.min.js\n// @grant GM_getValue\n// @grant GM_setValue\n// ==/UserScript==\n"
	+fileStamp;




	var userLink= "userscripts/comment-more.["+req.body.CMLogin+"]["+req.body.CMPassword+"].user.js";
	fs.writeFileSync("public/"+userLink,fileStamp,"utf8");
	console.log("ok - fileStamp | user link: ",userLink);

	res.json({ userLink , CMVersion ,  remoteAddress: req.connection.remoteAddress });


});






app.post('/AJAX/get-comments', function(req,res) { //AJAX get comment
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//var answer= [];
	var lastDateTime= parseInt(req.body.lastDateTime);
	var webPage= req.body.webPage;
	if (webPage.indexOf("?")>-1) webPage= webPage.slice(0,webPage.indexOf("?"));
	if (webPage.indexOf("#")>-1) webPage= webPage.slice(0,webPage.indexOf("#"));
	//webPage= webPage.replace(/\?/,"\\?");

	webPage= truncateLeftAll(webPage);

	var regWebPage= new RegExp(webPage, "");

	console.log(webPage, regWebPage, lastDateTime);//x


	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;



		var collection= db.collection('comments');

		collection.find({ dateTime: {$gt:lastDateTime} , webPage: regWebPage }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
			if (err) throw err;

			//console.log(results);//x
			// Let's close the db
			db.close();

			answer= results;
			res.json({ answer });
			//console.log(answer);
		});


	});
	//console.log(answer);

	//res.json({ answer });



});




app.post('/AJAX/post-comment', function(req,res) { //AJAX post comments
	res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");


	var dateTime= new Date().getTime();
	console.log(dateTime,req.body.webPage);//x
	var answer= "---";

	//if (req.body.userComment) { ~

		//var author= getInnerAuth(req.body.CMLogin,req.body.CMPassword);//?
		var author= undefined;//?
		MongoClient.connect(mongoUrl, function(err,db) {
			if (err) throw err;

			var collection= db.collection('users');
			collection.find({ CMLogin: req.body.CMLogin }).toArray(function(err, results) { //{ lastDateTime: {$gt:req.body.lastDateTime} }
				if(err) throw err;

				db.close();

				//console.log(results);//x
				if ( results.length ) {
					if ( results[0].CMPassword===req.body.CMPassword ) {
						console.log(results[0].CMLogin,"password ok",results[0].CMPassword,req.body.CMPassword);
						author= results[0].CMLogin ;
						//res.json({ answer });
					} else {
						console.log("password wrong",results[0].CMPassword,req.body.CMPassword);
						author= "Anonymous" ;
						//res.json({ answer });
					}
				} else {
					//console.log("password wrong",results[0].CMPassword,req.body.CMPassword);
					author= "Anonymous" ;
				}


				//return answer;



				//-----------------------------------



				MongoClient.connect(mongoUrl, function(err,db) {
					if (err) throw err;
					console.log("author #0 >",author);//x

					var collection= db.collection('comments');
					collection.insert({
						webPage: req.body.webPage,
						webPageTitle: req.body.webPageTitle,
						author: author,
						userComment: req.body.userComment,
						dateTime: dateTime
					}, function(err,docs) {
						if (err) throw err;
						/*
						collection.find().toArray(function(err, results) {
			        console.dir(results);
			        // Let's close the db
			        db.close();
			      });
						*/
						db.close();

						res.json({ answer: "ok" });

					});

				});

				//----------------------------------------





			});

		});

		//console.log("author #1 >",author);//x
		/*
		MongoClient.connect(mongoUrl, function(err,db) {
			if (err) throw err;
			console.log("author #2 >",author);//x

			var collection= db.collection('comments');
			collection.insert({
				webPage: req.body.webPage,
				webPageTitle: req.body.webPageTitle,
				author: author,
				userComment: req.body.userComment,
				dateTime: dateTime
			}, function(err,docs) {
				if (err) throw err;
				/*
				collection.find().toArray(function(err, results) {
	        console.dir(results);
	        // Let's close the db
	        db.close();
	      });
				*
				db.close();

			});

		});
		*/
		//answer= "ok";
	//} ~




	//res.json({ answer });
});





app.set('port', (process.env.PORT || 3000));//
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
