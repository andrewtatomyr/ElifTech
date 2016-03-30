

(function() {

	setTimeout(function() {
		var companies= new Companies();
		setTimeout(function() {//tpl
			companies.dbGetCompanies(function() {
				companies.populateRecur();//
				companies.sumEarnings();
				$('[data-toggle="tooltip"]').tooltip();//tooltip
			});
			companies.setMainCompanyControls();
		}, 500);//tpl
	}, 500);



})();

function Companies() {

	var list= []; //list of companies
	this.printList= function() {
		console.log(list);
	}

	var tpl= ""; //company template
	$.get('company.tpl.html', function(res) {
		tpl= res;
	});

	this.companyChain= function(id) { //put chain of subsidiaries of specified company
		insertCompany(id,0);
		this.populateRecur(id);
	}

	var insertCompany= function(id) { //insert company at page
		//create and configure company scope and company element:
		var el= document.createElement('div');
		el.setAttribute("id", id);
		el.setAttribute("class", "company-scope");
		var elHTML= tpl.replace(/{{name}}/g, list[id].name);
		elHTML= elHTML.replace(/{{eE}}/g, list[id].eE);
		elHTML= elHTML.replace("{{belongs2}}", list[id].belongs2);
		elHTML= elHTML.replace(/{{id}}/g, id);
		el.innerHTML= elHTML;
		//add hanflers:
		document.getElementById(list[id].belongs2).appendChild(el);
		document.getElementById("name-"+id).onclick= function() { editName(id); }
		document.getElementById("editName-"+id).onblur= function() { renameCompany(id); }
		document.getElementById("eE-"+id).onclick= function() { changeEE(id); }
		document.getElementById("changeEE-"+id).onblur= function() { setNewEE(id); }
		document.getElementById("addCompany-"+id).onclick= function() { addCompany(id); }
		document.getElementById("delCompany-"+id).onclick= function() { delCompany(id); }
		document.getElementById("company-"+id).onclick= function() { highlightCompany(id); }
		document.getElementById("delCompany-"+id).onmouseover= function() { highlightRelatedCompanies(id); }
		document.getElementById("delCompany-"+id).onmouseout= function() { unHighlightRelatedCompanies(id); }
		document.getElementById("toggleTree-"+id).onclick= function() { toggleTree(id); }
		if (list[id].belongs2!=0) $(document.getElementById("toggleTree-"+list[id].belongs2).firstChild).addClass("glyphicon-minus"); //new subsidiary company, put "-"
	}

	this.populateRecur= function(ownerId) { //populate subsidiaries elements with recurrency
		ownerId= ownerId || 0;
		for (var key in list) {
			if (!list[key]) continue;
			if (parseInt(list[key].belongs2)===parseInt(ownerId)) {
				insertCompany(key);
				this.populateRecur(key);
			}
		}
	}

	this.sumEarnings= function() { //public method
		sumRecur();
	}

	var sumRecur= function(ownerId) { //summation of earnings for all subsidiaries of specified owner
		ownerId= ownerId || 0;
		var sumEE= parseFloat(list[ownerId].eE);
		var hasSubsidiaries= false;
		for (var key in list) {
			if (!list[key]) continue;
			if (parseInt(list[key].belongs2)===parseInt(ownerId)) {
				sumEE+= sumRecur(key);
				hasSubsidiaries= true;
			}
		}
		if (hasSubsidiaries) {
			var el= document.getElementById("sumEE-"+ownerId);
			if (el) el.innerHTML= "$"+sumEE;
		}
		return sumEE;
	}

	var editName= function(id) { //display input
		$("#name-"+id).addClass("hidden");
		$("#editName-"+id).removeClass("hidden");
		$("#editName-"+id).select();
	}

	var renameCompany= function(id) { //input handling
		var newName= $("#editName-"+id).val();
		if (newName) {
			list[id].name= newName;
			document.getElementById("name-"+id).innerText= newName;
			dbUpdateCompany(id);
		}
		$("#name-"+id).removeClass("hidden");
		$("#editName-"+id).addClass("hidden");
	}

	var changeEE= function(id) { //display input
		$("#eE-"+id).addClass("hidden");
		$("#changeEE-"+id).removeClass("hidden");
		$("#changeEE-"+id).select();
	}

	var setNewEE= function(id) { //input handling
		var newEE= $("#changeEE-"+id).val();
		if (newEE) {
			list[id].eE= parseFloat(newEE);
			document.getElementById("eE-"+id).innerText= newEE;
			sumRecur();
			dbUpdateCompany(id);
		}
		$("#eE-"+id).removeClass("hidden");
		$("#changeEE-"+id).addClass("hidden");
	}

	var addCompany= function(ownerId) { //handler
		var company= {
			name: "New Company",
			eE: 0,
			belongs2: ownerId
		};
		dbAddCompany(company, function(id) {
			insertCompany(id);
			editName(id);
			window.location= "#editName-"+id;
		});
	}

	this.setMainCompanyControls= function() { //define root handlers
		document.getElementById("addCompany-0").onclick= function() { addCompany(0); }
		document.getElementById("expandAll").onclick= function() { expandAll(); }
		document.getElementById("collapseAll").onclick= function() { collapseAll(); }
	}

	var delCompany= function(id) { //deleting from page
		delete list[id];
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

	var expandAll= function() { //show companies tree
		for (var key in list) {
			if (
				document.getElementById("toggleTree-"+key) &&
				$(document.getElementById("toggleTree-"+key).firstChild).hasClass("glyphicon-plus")
			) {
				$(document.getElementById("toggleTree-"+key).firstChild).removeClass("glyphicon-plus");
				$(document.getElementById("toggleTree-"+key).firstChild).addClass("glyphicon-minus");
			}
			$("#"+key).removeClass("hidden");
		}
	}

	var collapseAll= function() { //hide companies tree
		for (var key in list) {
			if (
				document.getElementById("toggleTree-"+key) &&
				$(document.getElementById("toggleTree-"+key).firstChild).hasClass("glyphicon-minus")
			) {
				$(document.getElementById("toggleTree-"+key).firstChild).removeClass("glyphicon-minus");
				$(document.getElementById("toggleTree-"+key).firstChild).addClass("glyphicon-plus");
			}
			/**/
			if ( list[key] && parseInt(list[key].belongs2) ) {
				console.log("&",key, ":",parseInt(list[key].belongs2));
				$("#"+key).addClass("hidden");
			}
			/**/
		}
	}

	var toggleTree= function(id) {
		if ( $(document.getElementById("toggleTree-"+id).firstChild).hasClass("glyphicon-minus") ) { //collapse
			$(document.getElementById("toggleTree-"+id).firstChild).removeClass("glyphicon-minus");
			$(document.getElementById("toggleTree-"+id).firstChild).addClass("glyphicon-plus");
			var idSet= findNested(id);
			for (var key in idSet) {
				if ( $(document.getElementById("toggleTree-"+idSet[key]).firstChild).hasClass("glyphicon-minus") ) {
					$(document.getElementById("toggleTree-"+idSet[key]).firstChild).removeClass("glyphicon-minus");
					$(document.getElementById("toggleTree-"+idSet[key]).firstChild).addClass("glyphicon-plus");
				}
				$("#"+idSet[key]).addClass("hidden");
			}
		} else { //expand
			$(document.getElementById("toggleTree-"+id).firstChild).removeClass("glyphicon-plus");
			$(document.getElementById("toggleTree-"+id).firstChild).addClass("glyphicon-minus");
			for (var key in list) {
				if ( list[key] && parseInt(list[key].belongs2)===parseInt(id) ) {
					$("#"+key).removeClass("hidden");
				}
			}
		}
	}

	var findNested= function(id) { //find subsidiaries as a one-dimension array
		var nested= [];
		for (var key in list) {
			if (!list[key]) continue;
			if (parseInt(list[key].belongs2)===parseInt(id)) {
				nested[nested.length]= key;
				var innerNested= findNested(key);
				if (innerNested.length) nested= nested.concat(innerNested);
			}
		}
		return nested;
	}

	this.printNestedChain= function(id) {
		var nested= findNested(id);
		console.log(nested);
	}

	//--------D-B---A-P-I------->

	var dbAddCompany= function(company, callback) {
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
			success: function(res) {
				list= res.list;
				if (list.length===0) { //insert root
					dbAddCompany({
						name: "root",
						eE: 0,
						belongs2: null
					});
				}
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
