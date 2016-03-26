

(function() {
	setTimeout(function() {
		var companies= new Companies();
		companies.dbGetCompanies(function() {
			companies.printList();

			//companies.companyChain(6);//
			companies.populateRecur();
			companies.sumEarnings();
		});
		companies.setMainCompanyAdjunction();





		/*
		setInterval(function() {
			//companies.companyChain(6);//
			companies.populateRecur();
			companies.sumEarnings();

		}, 3000);
		*/

	}, 100);



})();

function Companies() {


	var list= [];

	this.printList= function() {
		console.log(list);
	}


	var tpl= '<div id={{id}} class="company" >'+
		'<h3  >'+
			'<a id=name-{{id}} class="name" href="#editName">{{name}}</a><input id=editName-{{id}} class="editName hidden" value="{{name}}" > '+
			'<small><a id=addCompany-{{id}} class="addCompany" href="#+">(+)</a> '+
			'<a id=delCompany-{{id}} class="delCompany" href="#x">(x)</a></small>'+
		'</h3>'+
		'<span class="eE" >$<a id=eE-{{id}} href="#changeEE" class="eE" >{{eE}}</a><input id=changeEE-{{id}} class="changeEE hidden" type=number step="0.01" value="{{eE}}" ></span> '+
		'<sup id=sumEE-{{id}} class="sEE" ></sup>'+
	'</div>';
	//redo later as html-template

	this.companyChain= function(id) {
		insertCompany(list[id],list[0]);
		this.populateRecur(list[id]);
	}


	var insertCompany= function(id) {
		//console.log(c, owner);

		var el= document.createElement('div');
		//$(el).attr({"id":c.id});
		el.setAttribute("id", id);

		//$(el).addClass("company-scope");
		el.setAttribute("class", "company-scope");


		var elHTML= tpl.replace(/{{name}}/g, list[id].name);
		elHTML= elHTML.replace(/{{eE}}/g, list[id].eE);
		elHTML= elHTML.replace("{{belongs2}}", list[id].belongs2);
		elHTML= elHTML.replace(/{{id}}/g, id);

		el.innerHTML= elHTML;

		//console.log(elHTML);

		var maxColor= 150;
		$(el).css({background:"rgb("+Math.floor(Math.random()*maxColor)+","+Math.floor(Math.random()*maxColor)+","+Math.floor(Math.random()*maxColor)+")"});

		console.log(id,">>",list[id]);
		document.getElementById(list[id].belongs2).appendChild(el);
		document.getElementById("name-"+id).onclick= function() { editName(id); }
		//document.getElementById("editName-"+c.id).onkeypress= function(e) { renameCompany(c.id, e); }
		document.getElementById("editName-"+id).onblur= function() { renameCompany(id); }
		document.getElementById("eE-"+id).onclick= function() { changeEE(id); }
		document.getElementById("changeEE-"+id).onblur= function() { setNewEE(id); }
		document.getElementById("addCompany-"+id).onclick= function() { addCompany(id); }
		document.getElementById("delCompany-"+id).onclick= function() { delCompany(id); }

		//if ()

	}



	/*
	this.populateOwn= function(owner) {
		for (var key in list) {
			if (list[key].belongs2===owner.id) insertCompany(list[key], owner);
		}
	}
	*/

	this.populateRecur= function(ownerId) {
		//console.log(list);
		ownerId= ownerId || 0;
		console.log("-",ownerId);//
		for (var key in list) {
			console.log("--",ownerId,key);//,list[key].belongs2,"?==",owner.id);//
			if (parseInt(list[key].belongs2)===parseInt(ownerId)) {
				insertCompany(key); //insertCompany(list[key], owner);
				this.populateRecur(key);
			}

		}

	}

	/*
	this.populateRecur= function(owner) {
		//console.log(list);
		owner= owner || list[0];
		console.log("-",owner.id);//
		for (var key in list) {
			console.log("--",owner.id,key);//,list[key].belongs2,"?==",owner.id);//
			if (list[key].belongs2==owner.id) {
				insertCompany(key); //insertCompany(list[key], owner);
				this.populateRecur(list[key]);
			}

		}

	}
	*/


	/*
	this.populateAll= function() {
		for (var key in list) {

			this.populateOwn(list[key]);
		}
	}
	*/

	this.sumEarnings= function() {
		sumRecur();
	}

	var sumRecur= function(ownerId) {
		ownerId= ownerId || 0;
		//console.log("->",ownerId);//


		var sumEE= parseFloat(list[ownerId].eE);
		var hasSubsidiaries= false;
		for (var key in list) {
			//console.log(ownerId,"?==",list[key].belongs2,"("+key+")",(list[key].belongs2-ownerId));
			if (list[key].belongs2==ownerId) {
				//console.log("===");
				sumEE+= sumRecur(key);
				hasSubsidiaries= true;
			}


		}
		//console.log(">>>",ownerId,"$",sumEE);
		if (hasSubsidiaries) {
			var el= document.getElementById("sumEE-"+ownerId);
			if (el) el.innerHTML= "$"+sumEE;
		}

		return sumEE;
	}


	var editName= function(id) {

		$("#name-"+id).addClass("hidden");
		$("#editName-"+id).removeClass("hidden");
		$("#editName-"+id).select();
	}

	var renameCompany= function(id/*,e*/) {
		//console.log(e.keyCode);
		var newName= $("#editName-"+id).val();
		if (newName) {
			list[id].name= newName;
			document.getElementById("name-"+id).innerText= newName;
			dbUpdateCompany(id);
		}
		$("#name-"+id).removeClass("hidden");
		$("#editName-"+id).addClass("hidden");
	}


	var changeEE= function(id) {
		$("#eE-"+id).addClass("hidden");
		$("#changeEE-"+id).removeClass("hidden");
		$("#changeEE-"+id).select();
	}

	var setNewEE= function(id) {
		var newEE= $("#changeEE-"+id).val(); //prompt("Enter estimated earnings", list[id].eE);
		if (newEE) {
			list[id].eE= parseFloat(newEE);
			document.getElementById("eE-"+id).innerText= newEE;
			sumRecur();
			dbUpdateCompany(id);
		}
		$("#eE-"+id).removeClass("hidden");
		$("#changeEE-"+id).addClass("hidden");
	}

	var addCompany= function(ownerId) {

		//var companyName= "New Company";
		//var id= list.length;
		var company= {
			//id: id,
			name: "New Company",
			eE: 0,
			belongs2: ownerId
		};

		dbAddCompany(company, function(id) {
			console.log("addCompany id=",id);//x
			insertCompany(id); //insertCompany(list[id], list[ownerId]);
			editName(id);
			window.location= "#editName-"+id;

		});





		//document.getElementById("name-"+id).innerHTML= newName;
		/*
		var subsidiaryName= prompt("Enter subsidiary company name");
		if (subsidiaryName) {
			var sid= list.length;
			list[sid]= {
				id: sid,
				name: subsidiaryName,
				eE: 0,
				belongs2: id
			};
			insertCompany(list[sid], list[id]);
			//document.getElementById("name-"+id).innerHTML= newName;
		}
		*/
	}

	this.setMainCompanyAdjunction= function() {
		document.getElementById("addCompany-0").onclick= function() { addCompany(0); }
	}

	var delCompany= function(id) {
		delete list[id];
		// також не забути видалити всі дочірні елементи масиву!
		$("#"+id).remove();
	}



	//------A-J-A-X-----


	var dbAddCompany= function(company, callback) {
		//list[id]._id= list[id].id;
		//delete list[id].id;
		//for (var key in list) {
		//	list[key]._id= list[key].id;
		//}

		$.ajax({
			method: "post",
			url: "/API/insert-company",
			dataType: "json",
			data: company,
			success: function(res) {
				var id= res.id;
				list[id]= company;
				list[id].id= id;
				console.log("inserted to db, id=",id,"company=",list[id]);
				callback(id);
			},
			error: function() {
				console.log("Error post");//dm
			}
		});
	}

	this.dbGetCompanies= function(callback) {
		$.ajax({
			method: "get",
			url: "/API/get-companies",
			dataType: "json",
			//data: list[id],
			success: function(res) {
				//console.log("res",res);
				var tmp= res.answer;

				for (var key in tmp) {
					list[tmp[key].id]= tmp[key];
				}





				if (list.length===0) { //start point

					dbAddCompany({
						//id: 0,
						name: "root",
						eE: 0,
						belongs2: null
					});
				}



				//insert({"id":0,"name":"root", "eE":0, "belongs2":null})



				callback();
			},
			error: function() {
				console.log("Error get");//dm
			}
		});
	}



	var dbUpdateCompany= function(id) {
		$.ajax({
			method: "put",
			url: "/API/update-company?id="+id,
			dataType: "json",
			data: list[id],
			success: function(res) {
				console.log("updated in db");
			},
			error: function() {
				console.log("Error update");//dm
			}
		});
	}



}
