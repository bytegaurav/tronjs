//This file is entry point for index.html view. 
//It should have a JS object/class with name as view's Name. 
//Perform all logic related to view in this file. 
//Developer needs to call Tron's render method explictly in order to render view. 


var index = new function(){
	//we will use this property in our view 
	this.title ="I came from ViewModel";
	this.initialise = function(){
		//templatise and render view
		Tron.render();
	}

}
//initialising view model
index.initialise();