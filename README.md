Getting Started Guide

Installation & Setup

Tron is like any other JS library. Just include it in your page like you do with any other js files.

	<!-- Load Jquery --> 

	<script src="/scripts/Jquery-x-x-.min.js" type="text/javascript" > </script>
	

	<!-- Load tron.js-->

	<script src="/scripts/tron.js" type="text/javascript"></script>
Initialise App

Once You have included required libraries, init app with following code

	<script type="text/javascript" > 

		Tron.init(1, 2, 3, 4, 5);

	</script>
Arguments to init function

placeholder Tag : inside which all views will be rendered
Path to app folder: this folder contains all views and viewmodels "(read more in next step)
Default Home page
Enable view caching : bool value
ID of ajax loader to show progress (optional)
App folder structure

	/AppRoot 
		|-Views	
		|	|-index.html
		|	|-about.html
		|
		|-ViewModels
 		|	|-index.js
		|	|-about.js
		|-route.js

View File (.html)

It is simple html file without head, body and html tags.

ViewModel (.js)

ViewModel should be a javacript object/class with an entry point
ViewModel will have control over choice of rendering view. 
To render view, developer need to call Tron render function. 

Sample (when viewmodel is being used in view)

	var index = new function(){ 
			
		this.init = function(){
			Tron.render();
		}
	};
	index.init();	


Sample (when there is no reference of viewmodel in view)
	//simply call render function
	Tron.render();
Routing

Routing configurations are defined in a js file located at app root called route.js as JSON format as follows:

	[
		{
			"url":"users/profile/:id", 
			"path":"userprofiles" 
		},
		{
			"url":"verify/user/:email/:token",
			"path":"auth/verify"
		}
	]
url is the actual url that user will see in URL bar. URL parameters are prefixed by colon (:). These parameters can be accessed in ViewModel using following code:

	var param=Tron.URL["parameter Name"];
path is the name of related View file located in views folder.

Templating

Simple Templating

Let us understand this with an example:

View (.html) File
	<div data-model="index">
	<h1>{{heading}}</h1>
	<p>{{body}}</p>
	</div>
Simply put variable in html code which is being populated by viewmodel in double curly braces


ViewModel (.js) File
	var index = new function(){
		this.heading="this is heading";
		this.body= "this is content. laoding from viewmodel";
		
	};
	Tron.render(); //call render function

Output 
this is heading


this is content. laoding from viewmodel


Iterative Templating

This is similar to simple templating. Developer need to specify name of data source in "data-repeater" attribute. For Example:

View (.html) File
	<ul  data-model="index" data-repeater="cities">
		<li> {{city}}</li>
	</ul>
ViewModel (.js) File
	var index = new function(){
		this.cities = [
			{"city": "New York" },
			{"city": "London" },
			{"city": "Tokyo" },
			{"city": "Bangalore" }
				
		];
		
	};
	Tron.render(); //call render function

Output 
	

		
New York

		
London

		
Tokyo

		
Bangalore

	

Note: incase of Arrays where there is no key, only indexes are used to identify elements. Use {{data}} as placeholder.

Recursive Templating

When data source JSON is tree like in tree like structure. e.g.

	var index = new function(){
	 	this.data= [
	 		{
	 			"name"  : "John",
	 			"marks" : [
 								"100", 
 								"90",
 								"80"

	 					  ]
 	 		},
 	 		{
	 			"name"  : "Doe",
	 			"marks" : [
 								"90",
 								"80",
 								"50"

	 					  ]	
 	 		}
	 	];

	}
In above example, marks is a iteratable array inside another iteratable array data.

Such JSONs can be templated as follows in HTML

View (.html) File
	<ul  data-model="index" data-repeater="data">
		<li> {{name}}
			<ul  data-model="index" data-repeater="data.marks">
				<li> {{data}}	  </li>	
			</ul>

		</li>
	</ul>
Output
John
100
90
80
Doe
90
80
50