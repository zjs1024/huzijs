# huzi template and framework design
<pre>
*************************************************************************************
 Target: A light weight JS framework that implemented MVC, templates and JSON web services, well orgnized, easy to use and expend.
 Framework design:
   1. use "_" as the base object of the app(it is not underscore.js, I just think it is easy to type, you can name whatever you want). it will contains Model, Views, Controllers and other functions, all the following objects can be put in a seperate js file if it grows big.
      _.model : define all the data models and can be a init object when create new
      _.controllers: functions that handle the actions
      _.templates: templates dictionary contains all the templates
      _.services: ajax call to load the data from the server
      _.data: where the data is saved.

      //other models
      _.gvar : constants and global variables
      _.utils: library of base functions, for common functions, add the directly to "_", 
               like the underscore library: _.isBlank, 
      _.profile: can be used for profile and security
      ...  
   2. huzi template as a template engine.
      . make it as a easy to use and powerful template engine.
      . binding to javascript object
      . implement complicate logic: mixed with multi-level logical operations and loops  
      . acting as a jQuery plugin for client side and also a module for node.js for server side.
   3. how it works:
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
          }  
	};
	_.profile = {firstName: "Jason",lastName: "Zhang"}
	_.gvar ={
	      imgurl : "http://placehold.it/300x300",
	      imgurl0 : "http://placehold.it/120x120"
    }
	_.controllers = {
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
        init: function(callafter){
           //loading tempaltes fille, it is a html template file(minify for production) that
           //contains multiple templates. saved to _.templates
           $.get(_.utils.urlbase + "templates", function(temp){
           	  if(temp != null){
	           	var m = temp.match(/&lt;template\s+.*?id="([^"]*?)".*?>(.+?)&lt;\/template&gt;/gi);
	    
			    for (i in m) {
			        parts = (/&lt;template\s+.*?id="([^"]*?)".*?>(.+?)&lt;\/template&gt;/gi).exec(m[i]);
			        _.templates[parts[1]] = parts[2];
			    }
			  }
           })	
        }
	}
	_.model = {
		product: {
			productId:"",
			name:"",
			price: 0
		}
	}
	_.data = {
		products: null,
        product: null
	}
	_.services = {
		urlbase : location.href.substring(0, location.href.lastIndexOf('/') + 1),
		debugMode : true,
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
	}
	_.templates = { // loaded from templates.huzi
	      products_all:"&lt;h4>{{productCategory1}}&lt;/h4>{{repeat products}}{{productName}}:{{productPrice}}{{endrepeat}}",
	      product_details:"&lt;h4>{{productId}}&lt;/h4>{{productName}}:{{productPrice}}"                 
	} 
    
    //create our own underscore lib
    _.utils =  {
		urlbase: location.href.substring(0, location.href.lastIndexOf('/') + 1)			        
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
