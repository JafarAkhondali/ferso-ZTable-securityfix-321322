# ZTable Jquery Plugin For Bootstrap

```js

 $('#theTable').Table({
  			source   :'http://localhost:1337/products/table',
  			method   :'GET',
  			type     :'table',
  			rows     :10,
  			sortable :true,
  			checkbox :true,
  			headers  :{
		      "sku"			:{name:'SKU',width:'100px', link:true, label :'danger', title:"Click to view details", hide:true},
		      "description" :{name:'Descripción',width:'300px', link:true, title:"Click to view details"},
		      "price"		:{name:'Precio',width:'100px',type:'money', align:'right'},
		      "qty"			:{name:'Cantidad',align:'center',width:'100px', value:function(i,o){
		      		return o.qty+' '+o.unity;
		      }}, 	
		      "category"    :{name:'Categoría',width:'100px', align:'left', label:'success'}, 
		      "keywords"	:{name:'Eliminar',width:'100px', align:'center', sort:false, value:function(i,o) {
		      		return '<span class="glyphicon glyphicon-remove text-danger ztable-cursor" data-value="'+o.sku+'" data-toggle="tooltip" data-placement="left" title="Click to delete this item"></span>';
		      }}
		    }, 
		    onLink: function(e){
		    	console.log(e);
		    },
		    onCheckBox: function(check){
		    	console.log('is checked',check);
		    },
		    onCheckBoxMain : function(checked){
		    	console.log(checked)
		    },
		    onCompleteRequest:function(){
		    	$('#theTable .glyphicon-remove').click(function(){		    		
		    		if( confirm('are you sure to delete item: '+  $(this).attr('data-value') )  ) {

		    		}
		    	});
		    	 $('#theTable  [data-toggle="tooltip"]').tooltip()
		    }
  		})
```


Result
![Alt text](https://s3.amazonaws.com/f.cl.ly/items/3n310j1C253o1d303I3F/Screen%20Shot%202015-09-09%20at%2012.48.23%20PM.png "Optional title")

![Alt text](https://s3.amazonaws.com/f.cl.ly/items/111g2O0M0s1p412L383r/Screen%20Shot%202015-09-09%20at%2012.51.09%20PM.png "Optional title")





