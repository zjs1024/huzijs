# huzi template and framework design
<pre>
*************************************************************************************
 Target: develop a web application framework using js and other popluar web technology 
 Tags : html5, css3, MVC, templates engine, data-binding, single page application, REST
 Framework design:
   1. MVC 
      Module : REST to get JSON object and bind it to a JS object
      View   : html5 templates to create views
      Controller: js functions to handle actions.

   2. use "_" as the base object of the app(it is not underscore.js, I used name it page, I just think "_" would be easier to type). "_" object likes the root scope in angularjs, it is a js object to manage the app. It contains Model, Views, Controllers and other functions.
      _.model : define all the data models and can be a init object when create new
      _.controllers: functions that handle the actions
      _.templates: templates dictionary contains all the templates
      _.services: ajax call to load the data from the server
      _.data: where the data is saved.

      //other models
      _.con : constants
      _.utils: library of base functions, for common functions, add the directly to "_", 
               like the underscore library: _.isBlank, 
      _.profile: can be used for profile and security
      ...  
   3. I created a jQuery plugin template engine called huzi.js, huzi is easy to use:
      . just like Mustache.js, it uses {{ }} to binding the data.
      . use string or html file as templates, binding js object to the templates
      . implement complicate logic: mixed with multi-level logical operations and loops  
      . acting as a jQuery plugin for client side and also can be a module for node.js for server side.
      . see https://github.com/zjs1024/huzijs for details
   4. how it works:
      . loading the templates
      . handle actions by using ajax calls to load data and binding the data to the templates
********************************************************************************************
</pre>
# Following are framework structure:
<p>More details check sample code: <a href="products.html">products.html</a></p>
<pre>
&lt;!-- html templates contrainers -->
&lt;div id="productsContainer"&gt;&lt;/div&gt;
&lt;div id="productDetailsContainer">&lt;/div&gt;

&lt;script&gt;

	var _ = {	
		  isBlank : function(obj){
        		return(!obj || $.trim(obj) === "" || $.trim(obj) === "undefined");
    	  },
          clone: function(obj) {
            var newobj = {};
            Object.getOwnPropertyNames(obj)
                .forEach(function(element, index, array) {
                    newobj[element] = obj[element];
                });
            return newobj;
          }, 

          /* profile and login info */	
	      profile : {firstName: "Jason",lastName: "Zhang"},
	      
	      /* html5 localstorage, can be used to store templates, profile and other data in the client side */
	      store : window.localStorage,

		  /* global valriable and constants */
		  gvar : {
			      imgurl : "http://placehold.it/300x300",
			      imgurl0 : "http://placehold.it/120x120"
		  },
	      controllers : {
			    productList : function(){
			       _.services.factory("getAllProducts",null, function(results){
			       	     _.data.products = results;
			       	     var $huzi = $("#productsContainer").data("huzi");
			       	     if(_.isBlank($huzi)){
				       	     $("#productsContainer").huzi({
				       	     	data:products,
						        template: _.templates["products_.ll"],
						        bindingComplete: function(e){
						          //do something after binding complete.	
						          console.log(this);
						        }
				       	     })
				       	 }else{
				       	 	$huzi.rebind(_.data.products);
				       	 }
			       })
			    },
			    productDetails : function(pid){
			       _.services.factory("getProductById",{productId:pid}, function(results){
			       	     _.data.product = results;
			       	     var $huzi = $("#productDetailsContainer").data("huzi");
			       	     if(_.isBlank($huzi)){
			       	     	$("#productDetailsContainer").huzi({
				       	     	data:product,
						        template: _.templates["product_.etails"],
						        bindingComplete: function(e){
						          //do something after binding complete.	
						          console.log(this);
						        }
			       	        })
			       	     }else{
			       	     	$huzi.rebind(_.data.product);
			       	     } 
			       	     
			       })
			    },
			    /* loading templates from server or localstorage to _.templates dictionary  */
			    getTemplates : function(callback){
			                   if(_.store.templates == null){
			    					$.get(_.utils.urlbase + "templates", function(temp){
						           	  if(temp != null){
							           	var m = temp.match(/&lt;template\s+.*?id="([^"]*?)".*?>(.+?)&lt;\/template&gt;/gi);
							    
									    for (i in m) {
									        parts = (/&lt;template\s+.*?id="([^"]*?)".*?>(.+?)&lt;\/template&gt;/gi).exec(m[i]);
									        _.templates[parts[1]] = parts[2];
									    }
									    _.store[templates] = JSON.stringify(_.templates);
									    callback();
									  }
									});
			                   }else{
			                      _.templates = JSON.parse(_.store[templates]);
			                      callback();
			                   }
			    },
		        init: function(callback){
		           // doing init in here
		           _.getTemplates(callback);
		        }
			},
		/* model define	the object structures, can be used when create a new object */
		models : {
			product: {
				productId:"",
				name:"",
				price: 0
			}
		},

		/* to store tempary or resuable data */
		data : {
			products: null,
	        product: null
		},

		/* to call web services, get data from the server */ 
		services : {
			urlbase : location.href.substring(0, location.href.lastIndexOf('/') + 1),

			/* using mock data */
			debugMode : true,

			/* ajax web services calls  */
			factory : function(serviceName, params, callback){
					var raw = JSON.stringify(params);

					return jQuery.ajax({
						url:  _.util.urlbase + this.serviceMap[serviceName].fileName,
						type: this.serviceMap[serviceName].type,
						data: raw,
						contentType:"application/json",
						dataType: "json",
						processData:false,
						success: callback,
						cache:false,
						error : function(e, x, settings, exception) {
							if(this.debugMode && e.status >= 400){
									alert(serviceName + "("+ this.serviceMap[serviceName].fileName + ") error: " 
										 + e.responseJSON.error);
							}
							return false;
							event.preventDefault();
						}
					});
				},

			serviceMap : {
				"getAllProducts": {fileName:"products.pgm", type:"get"},
				"getProductbyId": {fileName:"product.pgm", type:"get"}, //param:{"productId":"12345"}
		    	"updateProduct": {fileName:"product.pgm", type:"post"}, //param:{"productId":"12345", ...}
		    }
		},

		/* Dictionary of all templates. Templates can be stored in html file in the server or js string, and it also can be stored in html5 localstorage, loading as a template dictionary when doing the page init */ 
		templates : { 
		      products_all:"&lt;h4>{{productCategory1}}&lt;/h4>{{repeat products}}{{productName}}:{{productPrice}}{{endrepeat}}",
		      product_details:"&lt;h4>{{productId}}&lt;/h4>{{productName}}:{{productPrice}}"                 
		}, 
	    
	    /* create utility library */
	    utils :  {
			urlbase: location.href.substring(0, location.href.lastIndexOf('/') + 1)			        
		} 
    }

	$(function() {
		// load templates and create product list after that
        _.controller.init(_.controller.productList());
	})
&lt;/script&gt;

// templates.huzi contains all templates
&lt;template id="products_all"&gt;
      &lt;h4&gt;&lt;h4&gt;{{productCategory1}}&lt;/h4&gt;{{repeat products}}{{productName}}:{{productPrice}}{{endrepeat}}
&lt;/template&gt;
&lt;template id="product_details"&gt;
      &lt;h4&gt;{{productId}}&lt;/h4&gt;{{productName}}:{{productPrice}}
&lt;/template&gt;
</pre>
