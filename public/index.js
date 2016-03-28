

(function() {

	setTimeout(function() {
		var companies= new Companies();
		setTimeout(function() {//tpl
			companies.dbGetCompanies(function() {
				//companies.printList();
				//companies.dropdownPopulate();

				//companies.companyChain(1);//
				companies.populateRecur();//
				companies.sumEarnings();


				//companies.printNestedChain(4)//
				$('[data-toggle="tooltip"]').tooltip();//tooltip
			});
			companies.setMainCompanyAdjunction();

			//companies.getTemplate('template.html');

		}, 100);//tpl




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

	/*
	$.get('ajax/test.html', function(data) {
	  $('.result').html(data);
	  alert('Load was performed.');
	});
	'template.html'
	*/
	var tpl= "";
	$.get('company.tpl.html', function(res) {
		tpl= res;
		//console.log("tpl:",tpl);//
	});

	var liTpl= "";
	$.get('list.tpl.html', function(res) {
		liTpl= res;
	});

	this.dropdownPopulate= function() {
		for (var key in list) {


			if ( !list[key] ) continue; //|| key==0
			console.log(key, !list[key] || key==0);


			var el= document.createElement('li');
			//$(el).attr({"id":c.id});
			//el.setAttribute("id", id);

			//$(el).addClass("company-scope");
			//el.setAttribute("class", "company-scope");

			var elHTML= liTpl;
			elHTML= elHTML.replace("{{companyName}}", list[key].name);
			//elHTML= elHTML.replace(/{{id}}/g, id);

			el.innerHTML= elHTML;


			document.getElementById("dropdownList").appendChild(el);
		}
	}

	/*
	var getTemplate= function(templateUrl) {
		$.get(templateUrl, function(tpl) {
			console.log(tpl);//

		  return tpl;
		});
	}


	var tpl= getTemplate('template.html');
	/*
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
	*/

	this.companyChain= function(id) {
		insertCompany(id,0);
		this.populateRecur(id);
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
		//$(el).css({background:"rgb("+Math.floor(Math.random()*maxColor)+","+Math.floor(Math.random()*maxColor)+","+Math.floor(Math.random()*maxColor)+")"});

		//console.log(id,">>",list[id]);
		document.getElementById(list[id].belongs2).appendChild(el);

		//console.log(">>",tpl, elHTML);//x
		document.getElementById("name-"+id).onclick= function() { editName(id); }
		//document.getElementById("editName-"+c.id).onkeypress= function(e) { renameCompany(c.id, e); }
		document.getElementById("editName-"+id).onblur= function() { renameCompany(id); }
		document.getElementById("eE-"+id).onclick= function() { changeEE(id); }
		document.getElementById("changeEE-"+id).onblur= function() { setNewEE(id); }
		document.getElementById("addCompany-"+id).onclick= function() { addCompany(id); }
		document.getElementById("delCompany-"+id).onclick= function() { delCompany(id); }

		document.getElementById("company-"+id).onclick= function() { highlightCompany(id); }
		document.getElementById("delCompany-"+id).onmouseover= function() { highlightRelatedCompanies(id); }
		document.getElementById("delCompany-"+id).onmouseout= function() { unHighlightRelatedCompanies(id); }

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
		//console.log("-",ownerId);//
		for (var key in list) {
			if (!list[key]) continue;
			//console.log(key,"--",ownerId,list[key].belongs2);//,list[key].belongs2,"?==",owner.id);//
			if (parseInt(list[key].belongs2)===parseInt(ownerId)) {
				//console.log("yes!");
				insertCompany(key); //insertCompany(list[key], owner);
				this.populateRecur(key);
			}

		}

	}



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
			if (!list[key]) continue;
			if (parseInt(list[key].belongs2)===parseInt(ownerId)) {
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

	}

	this.setMainCompanyAdjunction= function() {
		document.getElementById("addCompany-0").onclick= function() { addCompany(0); }
	}

	var delCompany= function(id) {
		delete list[id];
		// також не забути видалити всі дочірні елементи масиву!
		$("#"+id).remove();
		dbDelCompany(id);
	}

	var highlightCompany= function(id) {
		$(".company").removeClass("highlited");
		$("#company-"+id).addClass("highlited");
	}

	var highlightRelatedCompanies= function(id) {
		var idSet= [id].concat(findNested(id));
		for (var key in idSet) {
			$("#company-"+idSet[key]).addClass("highlitedRemove");
		}
	}

	var unHighlightRelatedCompanies= function(id) {
		$(".company").removeClass("highlitedRemove");
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
			url: "/API/add-company",
			dataType: "json",
			data: company,
			success: function(res) {
				var id= res.id;
				list[id]= company;
				list[id].id= id;
				console.log("added to db, id=",id,"company=",list[id]);
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


				/*
				var tmp= res.answer;

				for (var key in tmp) {
					list[tmp[key].id]= tmp[key];
				}
				*/
				list= res.list;



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
			url: "/API/update-company?",
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


	var findNested= function(id) {
		var nested= [];
		for (var key in list) {
			if (!list[key]) continue;
			if (parseInt(list[key].belongs2)===parseInt(id)) {
				nested[nested.length]= key;
				//nested[nested.length]= nested.concat(findNested(key));//nested.push(findNested(key));
				var innerNested= findNested(key);
				if (innerNested.length) nested= nested.concat(innerNested);
			}
		}
		//console.log(id,":",nested);
		return nested;
	}

	this.printNestedChain= function(id) {
		var nested= findNested(id);
		console.log(nested);
	}

	var dbDelCompany= function(id) {

		var idSet= [id].concat(findNested(id));
		console.log(idSet);




		$.ajax({
			method: "delete",
			url: "/API/delete-company?id",
			dataType: "json",
			data: {idSet:idSet},
			success: function(res) {
				console.log("deleted in db");
			},
			error: function() {
				console.log("Error delete");//dm
			}
		});
	}



}
