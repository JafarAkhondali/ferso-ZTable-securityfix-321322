# ZTable Jquery Plugin For Bootstrap

Use ZTable for Show data from database in the browser

![Alt text](https://s3.amazonaws.com/f.cl.ly/items/111g2O0M0s1p412L383r/Screen%20Shot%202015-09-09%20at%2012.51.09%20PM.png "Optional title")

## Usage

```html
	<!--Import Table -->
		<script type="text/javascript" src="/lib/ztable/ztable.min.js"></script>
		<link rel="stylesheet" href="/lib/ztable/ztable.min.css">

```

```js

// Callg the plugin 
 $('#theTable').Table({
  			source   :'http://localhost:1337/products/table',
  			method   :'GET',
  			type     :'table',
  			rows     :10,
  			sortable :true,
  			checkbox :true,
  			headers  :{
		      "sku"			:{name:'SKU',width:'100px', link:true, label :'danger', title:"Click to view details"},
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
------------------------

![Alt text](https://s3.amazonaws.com/f.cl.ly/items/3n310j1C253o1d303I3F/Screen%20Shot%202015-09-09%20at%2012.48.23%20PM.png "Optional title")


## Json Structure

```js
{
  "data": [
    {
      "sku": "24092561400398601",
      "description": "Automotivo Esmalte rojos y marrones 1/4",
      "cost": 0,
      "price": 79,
      "qty": 250,
      "unity": "ML",
      "category": "automotivas",
      "keywords": "automotivas,esmaltes",
      "createdAt": "2015-01-24 03:46:12",
      "updatedAt": "2015-01-24 03:46:12",
      "id": 305
    },
    {
      "sku": "24092561400398559",
      "description": "Alambre",
      "cost": 0,
      "price": 25,
      "qty": 1,
      "unity": "ML",
      "category": "complementos",
      "keywords": "",
      "createdAt": "2015-01-24 03:46:12",
      "updatedAt": "2015-01-24 03:46:12",
      "id": 304
    }
  ],
  "pages": {
    "current_page": "1",
    "last_page": 31,
    "rows": "10",
    "count": 303
  }
}

```

## API Description

| Parameter       | Description      |
| -------------   | ---------------------| 
| source          | Url source json from server         |
| params          | Parameters for the source url ex.  {from:2015-06-01, to: 2015-06-31}  |
| method          | Request Method for data  _POST, _GET. Default is GET |
