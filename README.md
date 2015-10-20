# huzi.js 
# Summary
<p>huzi.js is a jQuery plugin used for js templating development . </p>
<ul>
   <li>support template as string or html files, make the project more orangizable.</li>
   <li>support JSON data binding </li>
   <li>support contrinal logic and loops; also support muliti-level embedded loops and logic</li>
   <li>support object oriented object naming conventions binding</li>
   <li>support two ways data binding between form and JSON data</li>
   <li>support form data validation during form binding</li>
   <li>support node.js express template engine</li>
</ul>
# JSON data and template
<ul>
   <li><h4>Huzi using JSON as binding data</h4>
       <div class="highlight highlight-js"><pre> var products = [
              {
                  "id": "bb_070915_001", 
                  "images": [ {url:"img/img1.jpg", title:"p1"},
                              {url:"img/img2.jpg", title:"p2"},
                              {url:"img/img3.jpg", title:"p3"}],
                  "name": "Canvas check hobo bag", 
                  "price": "795",
                  "desc": "Medium canvas check hobo bag",
                  "date": "07/09/2015"
              }, ...]
       </pre></div>
  </li>
  <li><h4>Huzi template can be a string or html file loaded using AJAX </h4>
      <div class="highlight highlight-js"><pre>
                // using string template
                var temp = ["&lt;div&gt;",   
                            "{{if this.a &lt; 0}}",
                               "&lt;span&gt; a &gt 0 &lt;/span&gt;",
                            "{{else}}",
                               "&lt;span&gt; a &lt;= 0 &lt;/span&gt;",
                            "{{endif}}",
                            "&lt;/div&gt;"].join("");
                //or html in a file and load using AJAX
                   &lt;div&gt;
                      {{if this.a > 0}}
                      &lt;span&gt; a &gt; 0 &lt;/span&gt;
                      {{else}}
                      &lt;span&gt; a &lt;= 0 &lt;/span&gt;
                      {{endif}}
                   &lt;/div&gt;
                $.get("template/shared/demo1.html", function(temp){
                   ...   
                }
        </pre>
      </div>
  </li>
</ul>
# Usage
<ul>
   <li><h4>Init a jQuery plugin</h4>
      <div class="highlight highlight-js">
          <pre>
                 $("#container").huzi({
                       data: products,
                       template: temp 
                     });
                 }) 
          </pre>
      </div>
  </li>
  <li><h4>To call a Huzi function or data</h4>
      <div class="highlight highlight-js">
          <pre>
              $("#container").data("huzi").data = newdata;
              $("#container").data("huzi").rebind(newdata);
          </pre>
      </div>
  </li>
  <li><h4><code>{{repeat  array}}</code> to do the loops, <code>{{repeat}}</code> for default array.</h4>
      <div class="highlight highlight-js">
          <pre>
              {{repeat images}}
                 &lt;img src="{{url}}" alt="{[title}}"/&gt;
              {{endrepeat}}
          </pre>
      </div>
  </li>
    <li><h4><code>{{if }} ... {{elsif  }} ... {{else}} ... {{endif}}</code> to do the condictional logic</h4>
      <p><code>this</code> in the logic pointing to the current scope, <code>that</code> point to current jQuery element, like: <code>{{that.data}}</code> equals <code> $("#element").data("huzi").data</code> </p>
      <div class="highlight highlight-js">
          <pre>
              {{if <b style="color:red">this</b>.price > 100}}
                 &lt;span class="mark" &gt; {{price}} &lt;/span&gt;
              {{else}}
                 &lt;span &gt; {{price}} &lt;/span&gt;
              {{endif}}
          </pre>
      </div>
  </li>
    <li><h4>Conditaion logic and loops can combine together and embed each other</h4>
      <div class="highlight highlight-js">
          <pre>
             var products_temp = [
              '&lt;table class="table"&gt;',
                '&lt;tr&gt;&lt;th style="width:400px;"&gt;';
                '&lt;th&gt;&lt;th&gt;Name&lt;th&gt;',
                '&lt;th&gt;Description&lt;th&gt;&lt;th&gt;Price&lt;th&gt;&lt;/tr&gt;',
                '{{repeat}}',
                  '&lt;tr&gt;&lt;td&gt;',
                  '{{repeat images}}',
                     '&lt;img src="{{url}}" class="img-thumbnail" alt="{{title}}"/&gt;',
                  '{{endrepeat}}&lt;/td&gt;',
                  '&lt;td&gt;{{name}}&lt;/td&gt;&lt;td&gt;{{desc}}&lt;/td&gt;&lt;td ',
                   'class="{{if parseInt(this.price) > 600}}mark{{endif}}"&lt;/td&gt;',
                '&lt;/tr&gt;',
                '{{endrepeat}}',
              '&lt;/table&gt;'].join("");
            $("#products_div").huzi({
                 data:products,
                 template: products_temp,
                 bindingComplete: function(e){
                  console.log(this);
                 }
             });
          </pre>
      </div>
  </li>
    <li><h4><code>{{fun funname parm1 parm2 ...}}</code> can be used to call a external function</h4>
      <div class="highlight highlight-js">
          <pre>
              &lt;script&gt;
                  var formatMoney = function(str){
                         ...
                         return "$" + str;
                  }
              &lt;/script&gt;
              
              //in template
              ...
               price : {{fun formatMay price}}
          </pre>
      </div>
  </li>
</ul>
# Form Data binding and validation
  <p>Implemented two way data binding between javascript object and form elements, form validation and functions to toggle between read only and edit mode. Function <code>getFormData and setFormData</code> can be used menually binding data between form elements and JSON object. <code>readonlyForm and enableForm</code> can be used to toggle between read only and edit mode.</p>
  
# Demo
  <p> A small search engine created with huzi.js: <code>product-list.html</code></p>
# As a Node.js template engine
<ul><li>Install in node: <code>npm install huzi</code></li>
    <li>To use as a template engine</h4>
      <div class="highlight highlight-js">
          <pre> 
          var huzi = require("huzi");
          app.set('views', __dirname+'\\views');
          app.set('view engine', 'huzi');
          app.get('/', function(req, res) {
             //hello.huzi in views
             res.render('hello',products);
          });
         </pre>
</div></li></ul>
# Reference
<div>
   <p> To call a variable or function in Huzi plugin is the same as in Bootstrap plugin, like:
       <mark>$("#somediv").data("huzi").rebind(data)</mark></p> 
   <dl>
     <dt>appendable</dt>
     <dd>when doing rebinding, you can define appendable in options to true, thus the value will be appended to the 
         jQuery element, instead of replace it. The default value is false.</dd>
   </dl>
   <dl>
     <dt>bind</dt>
     <dd>you can call the bind function to force binding with current data and template.</dd>
   </dl>
   <dl>
     <dt>data</dt>
     <dd>data is the data object saved in JSON format.</dd>
   </dl>
   <dl>
     <dt>rebind(data)</dt>
     <dd>you can call the rebind function to force a data binding with new data.</dd>
   </dl>
   <dl>
     <dt>template</dt>
     <dd>template varible used to save the template string.</dd>
   </dl>
</div>
