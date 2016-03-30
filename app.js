var express= require('express');
var app= express();

var bodyParser= require('body-parser');
var http= require("http");
app.use(express.static('public'));

app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());

var MongoClient = require('mongodb').MongoClient;
var mongoUrl = 'mongodb://localhost:27017/test';
//var mongoUrl = 'mongodb://eliftech:1@ds025239.mlab.com:25239/eliftech_companies';

var methodOverride= require("method-override");

function buildArrayById(arr1) {
	var arr2= [];
	for (var key in arr1) {
		arr2[arr1[key].id]= arr1[key];
	}
	return arr2;
}

app.get("/API/get-companies", function(req,res) {
	console.log("API GET");
	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;
		var collection= db.collection('companies');
		collection.find().toArray(function(err, results) { 
			if (err) throw err;
			var list= buildArrayById(results);
			db.close();
			res.json({  list });
		});
	});
});

app.post("/API/add-company", function(req,res) {
	console.log("API POST");
	var company= req.body;
	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;
		var collection= db.collection('companies');
		collection.find().toArray(function(err, results) {
			if (err) throw err;
			var count= buildArrayById(results).length;
			company.id= count;
			collection.insert(company, function(err,docs) {
				if (err) throw err;
				db.close();
				res.json({ id: count });
			});
		});
	});
});

app.put("/API/update-company", function(req,res) {
	console.log("API PUT");
	var company= req.body;
	MongoClient.connect(mongoUrl, function(err,db) {
		if (err) throw err;
		var collection= db.collection('companies');
		collection.update({id: parseInt(company.id)}, {	$set:{
			"name": company.name,
			"eE": parseFloat(company.eE)
		}}, { w:1}, function(err,docs) {
			if (err) throw err;
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
			collection.deleteOne({id: parseInt(idSet[key])});
		}
	});
});

app.set('port', (process.env.PORT || 3000));//
app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
