/* ===================================================================================
 * Develop by   : Junsheng Zhang
 *                June 8, 2015
 * File Name    : huzi.js
 * description  : this jQuery plugin can be used to binding data to a
 *                html template string 
 * ==================================================================================== */
+function ($) {

  var Huzi = function (element, options) {
    this.$element  = $(element)
    this.options = $.extend({}, $.fn.huzi.defaults, options);
    if(options != null){
      this.data = options.data;
      this.bindingData = options.data;
      this.type = options.type;
      this.template = options.template;
      this.temp = options.template;
      this.appendable = options.appendable != null ? options.appendable : false;
      if(options.bindingComplete != null){
          this.bindingComplete = options.bindingComplete;
          this.$element.bind("bindingComplete.huzi", this.bindingComplete);
        }
      this.bind();
    }
  }
 
  Huzi.prototype = {
    rebind: function(data){
        if(data != null){
              this.data = data;
              this.bindingData = data;
              this.options.data = data;
              this.bind();
        }else { this.bind();}
    }, 
    bind : function(){
      if(this.data != null){
        while(this.template.indexOf("{{repeat") != -1 || this.template.indexOf("{{if") != -1){
            this.template = this.run(this.template,this.data);
        }
        this.template = this.replaceHuzi(this.template,this.data);
        if(this.appendable){
          this.$element.append(this.template);
        }else{
          this.$element.html(this.template);
        }
        this.$element.trigger({type:'bindingComplete.huzi', 
          relatedTarget: this.$element[0]
        });
      }
      this.template = this.temp;
      
    },
    bindingComplete: function(e){

    },
    clear: function(){
      this.$element.html("");
    },
    run : function(str,repeatdata){
        var repeatIdx = str.indexOf("{{repeat");
        var ifIdx = str.indexOf("{{if");
        if(repeatIdx != -1 || ifIdx != -1){
            if(repeatIdx != -1 && (repeatIdx < ifIdx || ifIdx == -1)){
                var that =this;
                var currIdx, nextIdx, endInx, substr,prestr,afterstr; 
                
                str = this.findRepeatBlock(str);
                var mstr = str.match(/{{repeat\s*(.*?)\s*}}/);
                var dataarr;
                
                var results =[];
                if(mstr[0] ==="{{repeat}}" && Array.isArray(this.data)) dataarr = repeatdata;
                else{
                   if(mstr[1].indexOf("|") != -1){
                      var rarr = mstr[1].split("|");
                      dataarr = repeatdata[rarr[0]] != null ? repeatdata[rarr[0]] : [];
                      for(var i=1; i<rarr.length; i++){
                        if(rarr[i].trim().startsWith("var ")){
                          eval(rarr[i].trim().substring(4));
                        }
                      }
                   }else{
                      dataarr = repeatdata[mstr[1]] != null ? repeatdata[mstr[1]] : [];
                   }
                }

                currIdx = str.indexOf(mstr[0]);
                prestr = str.substring(0,currIdx);
                substr = str.substring(currIdx + mstr[0].length, str.indexOf("{{endrepeat}}"));
                afterstr = str.substring(str.indexOf("{{endrepeat}}") + 13);

                for(var i=0;i< dataarr.length; i++){
                      this.bindingData = dataarr[i];
                      retstr = this.run(this.replaceBackRepeatSubBlock(substr), dataarr[i]);
                      results.push(retstr);
                }
                str = prestr + results.join("") + afterstr;
                while(str.indexOf("{{repeat") != -1 || str.indexOf("{{if") != -1){
                  str = this.run(str, repeatdata);
                }
                str = this.replaceHuzi(str,repeatdata);
                return str;
            }else if(ifIdx != -1 && (ifIdx < repeatIdx || repeatIdx == -1)){             
              return this.run(this.replaceIfBlock(repeatdata, str), repeatdata);
            }
        }else{
            str =this.replaceHuzi(str, repeatdata);
            return str;
        }
        
    },

    replaceIf :  function(str, mstr){
       var retstr ="";
       var conditions =[];
       var parts =[];
       var prestr = str.substring(0, str.indexOf(mstr[0]));
       str = str.substring(str.indexOf(mstr[0]) + mstr[0].length);
       var elsifstr = str.match(/{{elsif\s\s*(.*?)\s*}}/);
       var substr =str;

       conditions.push(mstr[1]);
     while(elsifstr != null && substr.indexOf("{{elsif") < substr.indexOf("{{endif}}")){
          parts.push(substr.substring(0,substr.indexOf(elsifstr[0])));
          conditions.push(elsifstr[1]);
          substr = substr.substring(substr.indexOf(elsifstr[0])+ elsifstr[0].length);
          elsifstr = substr.match(/{{elsif\s\s*(.*?)\s*}}/);
     }
     var elseIdx = substr.indexOf("{{else}}");
       if( elseIdx != -1 && elseIdx < substr.indexOf("{{endif}}")){
         conditions.push("true");
         parts.push(substr.substring(0, elseIdx));
         substr = substr.substring(elseIdx + 8);
       }
       parts.push(substr.substring(0, substr.indexOf("{{endif}}")));
       var that = this;
       for(var i=0; i< conditions.length; i++){
          var constr=conditions[i]; 
          
          if(function(constr){
              return eval(constr);
          }.call(this.bindingData,constr)){
             retstr = parts[i];
             break;
          }
        }
       return prestr + retstr.trim()+ str.substring(str.indexOf("{{endif}}")+9);
    },
    
    replaceIfBlock : function(data, hstr){
        var str = hstr;
        var mstr = str.match(/{{if\s\s*(.*?)\s*}}/);
        this.bindingData = data;
        if(mstr != null){
          str = this.findIfBlock(str);
          str = this.replaceIf(str,mstr);
          str = this.replaceBackSubBlock(str);     
        }
        return str;
    },

    findIfBlock : function(str){
      var ifstack =[];
      var matchstack =[];
      var currIdx, nextIdx, endIxx, substr,tempstr; 

      var mstr = str.match(/{{if\s\s*(.*?)\s*}}/);
      substr = str;
      if(mstr != null){        
              currIdx = substr.indexOf(mstr[0]);
              ifstack.push(currIdx);
              matchstack.push(mstr[0]);
              substr = substr.substring(currIdx + mstr[0].length);
              mstr = substr.match(/{{if\s\s*(.*?)\s*}}/);
              
              nextIdx = mstr != null ? substr.indexOf(mstr[0]) : -1;
              endIdx = substr.indexOf("{{endif}}");
              
              while(nextIdx != -1 && (nextIdx < endIdx)){
                  ifstack.push(ifstack[ifstack.length-1] + matchstack[matchstack.length-1].length + nextIdx);
                  matchstack.push(mstr[0]);
                  substr = substr.substring(nextIdx + mstr[0].length);
                  mstr = substr.match(/{{if\s\s*(.*?)\s*}}/);
                  nextIdx = mstr != null ? substr.indexOf(mstr[0]) : -1;
                  endIdx = substr.indexOf("{{endif}}");
              }
              substr = str;
              currIdx = ifstack.pop();
              tempstr = matchstack.pop();
              endIdx = currIdx + tempstr.length + endIdx;
              if(ifstack.length > 0){
                 substr = substr.substring(0, currIdx) + this.replaceSubBlock(substr.substring(currIdx, endIdx+9)) +  substr.substring(endIdx + 9);
                 //console.log(substr);
                 return this.findIfBlock(substr);
              }else{
                 return substr
              }
              
      }
      return substr;
    },

     findRepeatBlock : function(str){
      var repeatstack =[];
      var matchstack =[];
      var currIdx, nextIdx, endIxx, substr,tempstr; 

      var mstr = str.match(/{{repeat\s*(.*?)\s*}}/);
      substr = str;
      if(mstr != null){        
              currIdx = substr.indexOf(mstr[0]);
              repeatstack.push(currIdx);
              matchstack.push(mstr[0]);
              substr = substr.substring(currIdx + mstr[0].length);
              mstr = substr.match(/{{repeat\s*(.*?)\s*}}/);
              
              nextIdx = mstr != null ? substr.indexOf(mstr[0]) : -1;
              endIdx = substr.indexOf("{{endrepeat}}");
              
              while(nextIdx != -1 && (nextIdx < endIdx)){
                  repeatstack.push(repeatstack[repeatstack.length-1] + matchstack[matchstack.length-1].length + nextIdx);
                  matchstack.push(mstr[0]);
                  substr = substr.substring(nextIdx + mstr[0].length);
                  mstr = substr.match(/{{repeat\s*(.*?)\s*}}/);
                  nextIdx = mstr != null ? substr.indexOf(mstr[0]) : -1;
                  endIdx = substr.indexOf("{{endrepeat}}");
              }
              substr = str;
              currIdx = repeatstack.pop();
              tempstr = matchstack.pop();
              endIdx = currIdx + tempstr.length + endIdx;
              if(repeatstack.length > 0){
                 substr = substr.substring(0, currIdx) + this.replaceRepeatSubBlock(substr.substring(currIdx, endIdx+13)) +  substr.substring(endIdx + 13);
                 //console.log(substr);
                 return this.findRepeatBlock(substr);
              }else{
                 return substr
              }
              
      }
      return substr;
    },
    replaceSubBlock : function (str){
      str = str.replace(/\{\{if/g, "{{uf").replace(/\{\{elsif/g, "{{elsuf").replace(/\{\{else/g, "{{ulse").replace(/\{\{endif/g,"{{enduf");
      return str;
    },
    replaceBackSubBlock : function (str){
      str = str.replace(/\{\{uf/g, "{{if").replace(/\{\{elsuf/g, "{{elsif").replace(/\{\{ulse/g, "{{else").replace(/\{\{enduf/g,"{{endif");
      return str;
    },
    replaceRepeatSubBlock : function (str){
      str = str.replace(/\{\{repeat/g, "{{fur").replace(/\{\{endrepeat/g, "{{endfur");
      return str;
    },
    replaceBackRepeatSubBlock : function (str){
      str = str.replace(/\{\{fur/g, "{{repeat").replace(/\{\{endfur/g, "{{endrepeat");
      return str;
    },
    replaceHuzi : function(template, dic){
      var that = this;
      var str = String(template);
      //  str = this.ifCondition(str);
       // var m=str.match(/{{\s*[\w\.]+\s*}}/g);
        var m=str.match(/{{\s*(.*?)\s*}}/g);
        if(m != null && m.length > 0){
         // var n=m.map(function(x) { return x.match(/[\w\.]+/)[0]; });
            var n=m.map(function(x) { return x.match(/[\w\.\[\]]+/)[0]; });

              for(var i=0; i< m.length; i++){
                if(m[i].indexOf("{{expret ") == 0){
                    var ret = eval(m[i].substring(9,m[i].length-2));
                    str = str.replace(m[i],ret);
                }else if(m[i].indexOf("{{exp ") == 0){
                    eval(m[i].substring(6,m[i].length-2));
                    str = str.replace(m[i],"");
                }else if(m[i].indexOf("{{fun ") == 0){
                    var fn= m[i].substring(6,m[i].length-2).split(" ");
                    for(var j=1; j<fn.length;j++){
                      if(fn[j][0] === "'" || fn[j][0] === '"'){

                      }else if(fn[j].indexOf(".") != -1){  //attribute of child object
                            
                            if(fn[j].indexOf("that.")==0){
                              //fn[j]=eval(fn[j]);
                            }else{
                               var o= fn[j].substring(0, fn[j].indexOf("."));
                               var a = fn[j].substring(fn[j].indexOf(".")+1);
                               fn[j] = "dic['"+o+"'']."+ a;
                            }
                      }else{
                        if(dic[fn[j]] != null){    
                                fn[j] = "dic['"+fn[j]+"']";
                            }
                      }
                    }
                    var ret = eval(fn[0] + "(" + fn.slice(1).join(",") + ")"); 
                    str = str.replace(m[i],ret);
                }else{
                    if(n[i].indexOf(".") != -1){  //attribute of child object
                      if(n[i].indexOf("that.")==0){
                        str=str.replace(m[i],eval(n[i]));
                      }else{
                            var o= n[i].substring(0, n[i].indexOf("."));
                              var a = n[i].substring(n[i].indexOf(".")+1);
                              str=str.replace(m[i],eval("dic[o]."+ a));
                      }
                    }else if(n[i].indexOf("[") != -1){  // it is an array
                        var o=n[i].substring(0,n[i].indexOf("["));
                        var inx = n[i].substring(n[i].indexOf("[")+1, n[i].indexOf("]"));
                        if(inx === '-'){  // '-' is the array value
                          str = str.replace(m[i],dic);  
                        }else{
                          str = str.replace(m[i],dic[o][inx]);
                        }
                    }else{    
                        if(dic[n[i]] != null){    
                            str=str.replace(m[i],dic[n[i]]);
                        }
                    }
                  }
                }
        }
        return str;
      },
      getFormData: function(){  
           this.validate();
           if(this.isValid){
             var inputArr = this.$element.find(":input").not(':input[type=button], :input[type=submit], :input[type=reset]');
              for(var i=0; i<inputArr.length;i++){
               var item,attr;
               var $input = $(inputArr[i]);
               var parentObj = $input.data("parent");
               var fun = $input.data("getfun");
               var itemid = inputArr[i].id;
               if(!$.isBlank(parentObj)){
                 item = this.data[parentObj];
               }else{
                 item = this.data;
               }
             attr = itemid;
             var val= $input.val();  
               if(!$.isBlank(itemid)){
                   if(!$.isBlank(fun)){
                      val = eval(fun+"('"+val+"')"); 
                   } 
                   if(inputArr[i].type == 'checkbox'){
                     inputArr[i].checked ? item[attr] = true : item[attr] = false;
                   }else if(inputArr[i].type == 'radio'){
                       if(inputArr[i].checked) item[attr] = val;                         
                   }else{  
                     
                       item[attr] = val;
                                     
                   } 
                  }
                 
             }
           }
         },
       setFormData: function(){
          var inputArr = this.$element.find(":input");
           for(var i=0; i<inputArr.length;i++){
           var item, attr;
           var $input = $(inputArr[i]);
           var parentObj = $input.data("parent");
           var fun = $input.data("setfun");
             var itemid = inputArr[i].id;
             
             if(!$.isBlank(parentObj)){
               item=this.data[parentObj];
             }else{
               item = this.data;
             }
             attr= itemid;
             var val= item[attr];
             
             if(val != null){ 
               if(!$.isBlank(fun)){
                   val = eval(fun+"('"+val+"')"); 
               }
               if(inputArr[i].type == 'checkbox'){
                 if(val == "1" || val == "Y" || val == true){
                   inputArr[i].checked =true;
                 }else{
                   inputArr[i].checked = false;  
                 }
               }else if(inputArr[i].type == 'radio'){
                   if($input.val() == val) inputArr[i].checked = true;
                   else inputArr[i].checked = false;
               }else{
                 $input.val(val);
               }
               
             }
           }
       },  
       // <input id="slno" data-om-type="email" required>
       validate: function(){
         that = this;
         that.isValid = true;
         that.$element.find(":input:visible[required]").each(function(){
           if(that.isblank($(this).val())){
             $(this).closest(".form-group").addClass("has-error");
             that.isValid = false;
           }else{$(this).closest(".form-group").removeClass("has-error");}
         });
         that.$element.find(":input:visible[data-om-type]").each(function(){
           if(!that.isblank($(this).val()) &&  $(this).data("om-type")!=null ){            
             if($(this).data("om-type") == "email"){
               that.hightlightError($(this), !that.isValidEmail($(this).val()));
             }else if($(this).data("om-type") == "zip"){
               that.hightlightError($(this), !that.isValidZip($(this).val()));               
             }else if($(this).data("om-type") == "range"){
                 var min = parseInt($(this).attr("min"));
                 var max = parseInt($(this).attr("max"));
                 var num = parseInt($(this).val());
                 that.hightlightError($(this), (isNaN(num) || !(num >= min && num <= max)));
             }else if($(this).data("om-type") == "date"){
                 that.hightlightError($(this), !that.isValidDate($(this).val()));
             }
           }
         })
       },
       hightlightError: function($ele, hasError){
           if(hasError){
               $ele.closest(".form-group").addClass("has-error");
               this.isValid = false;
               if($ele.data("om-error")!= null){
                   $ele.after("<span class='text-danger'>*"+ $ele.data("om-error") + "</span>");
               }
           }else{
               $ele.closest(".form-group").removeClass("has-error");
               $ele.siblings(".text-danger").remove();
           }
       },
       isblank : function(obj){
            return(!obj || $.trim(obj) === "");
       },
       isValidEmail : function(email) {
           var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
           return emailReg.test( email );
         },
       isValidZip  : function(zip) {
         var zipReg = /^\d{5}(-\d{4})?$/;
         return zipReg.test(zip);
       },
       isValidDate : function(str) {    
            var parms = str.split(/[\.\-\/]/);
            var yyyy = parseInt(parms[2],10);
            var dd   = parseInt(parms[1],10);
            var mm   = parseInt(parms[0],10);
            var date = new Date(yyyy,mm-1,dd,0,0,0,0);
            return mm === (date.getMonth()+1) && dd === date.getDate() && yyyy === date.getFullYear();
      }

  }

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('huzi')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('huzi', (data = new Huzi(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.huzi

  $.fn.huzi = Plugin
  $.fn.huzi.Constructor = Huzi
  $.fn.huzi.defaults = {
        data: [],
        template:""
      };

  $.fn.huzi.noConflict = function () {
    $.fn.huzi = old
    return this
  }

}(jQuery);
