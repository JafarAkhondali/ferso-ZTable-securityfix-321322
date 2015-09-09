/*!
 * Ztable v0.1
 * Developed by @ferso, 
 * Fernando Soto erickfernando@gmail.com
 * Evisualmx.com
 * http://ferso.mx/ZTable/

Copyright (c) 2015 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/



(function($){

	$.fn.Table = function(options) {

		/* 
		# Default Options 
		--------------------------------------------------- */
		var _defaults = {
			
			 // Table identifier		
			 id					: String($(this).attr('id')).replace('#',''),
			
			 // Set the table width 
			 width				: '100%',			 
			
			 // Set the url where data coming  http://localhost:1338/data
			 source 			: null,
			
			 // Parameters requiered in the request
			 params 			: {}, 
			 
			 // Request Method for data  _POST, _GET. Default is _GET
			 method 			: 'GET', 

			 // Allow abort previous ajax request. Default is false
			 allowAbort         : false, 
			
			 // Set ID key in the collection. Default is the First key in the collection
			 primary			: false,
			 
			 // Set load at start: Boolean : true | false
			 auto 				: true, 			 
			
			 // Set colums headers
			 headers			: {},

			 // Set table draw the headers
			 showHeaders		: true,
			
			 // Max rows in request
			 rows 				: 100,
			
			 // Page to start the table
			 page 				: 1,
			
			 // Max draw pages in the view
			 mpv				: 5,
			 
			 // Set visible navigation 
			 navigation			: false,
			 
			 // Set checkbox column 
			 checkbox 			: false,
			
			 // Set Draw Grid
			 drawgrid 			: false,
			 
			 // Set Draw Checkall input 
			 checkallInput		: false,
			
			 // Set Draw Search input 
			 searcher			: true,
			 
			 // Set Animation loading data 
			 animation			: false,
			
			 // Sortable columns table, in each column configuration can be overrided for custom controll
			 sortable			: false,
			
			 // Set placeholder text in the seach input
			 searchtext			:'Enter keyword to find, press enter',
			
			 // This callback is called before ajax request is started. Return  full table object
			 onBeforeRequest 	: function(){},

			 // This callback is called when ajax request is faild. Return XHR object
			 onRequestFail 	: function(){},
			
			 // This callback is called when request is completed and drawed table with the data. Return data object request and full table object
			 onCompleteRequest	: function(){},
			
			 // This callback is called before the data row is drawed, return row object
			 onBeforeCreateRow	: function(){},
			
			 // This callback is called when checkallInput is checked return all primary values selected
			 onCheckBoxMain		: function(){},

			 // This callback is called when a checkbox in row is checked
			 onCheckBox 		: function(){},

			 // This callback is called before create data cell
			 onBeforeCreateCell	: function(){},

			// This callback is called when link is clicked
			 onLink	: function(){},
			
		}		

		//the main container
		this._container = $(this);

		// Extend Options with Default
		this._options 	   = $.extend(_defaults, options);

		/* -----
		# Set initial Page Request
		-------------------------------------------------------------- */

		// the current page
		this._page          = this._options.page;
		
		// count rows in request
		this._rows          = this._options.rows;

		// headers columns
		this._headers       = this._options.headers;
		
		// Keyword request 
		this._keyword       = null;
		
		// sort field request
		this._sortfield     = null;
		
		// sort order request
		this._sortby        = null;

		// the data return
		this._data        	= {}; 

		// the columns config
		this._conf 			= {};

		// collection checked
		this._collection    = [];

		// draw table
		this.drawTable();

		// auto start
		if( this._options.auto ) this.load();
					
		//return full object;
		return this;
	},

	/* -----
	# @name test
	# this is a simple function for plugin installation testing
	-------------------------------------------------------------- */
	$.fn.test = function (){
		console.log('ok');
	},	

	/* -----
	# @name g
	# clean data in collection
	-------------------------------------------------------------- */
	$.fn.uniq = function(collection){
		collection.reduce(function(a,b){
		    if (a.indexOf(b) < 0 ) a.push(b);
		    return a;
			 },[]);
		return collection;
	},

	/* -----
	# @name getKeyWord
	# get the keyword
	-------------------------------------------------------------- */
	$.fn.unbindKeyRequest = function(k){		
		delete this._options.params[k];
	},

	/* -----
	# @name showLoader
	# This function show the loader spinner
	-------------------------------------------------------------- */
	$.fn.showLoader = function(){
		$('#'+this._options.id +' .main-loader').removeClass('glyphicon glyphicon-search').addClass('csspinner traditional');				
	},

	/* -----
	# @name hideLoader
	# This function hide the loader spinner
	-------------------------------------------------------------- */
	$.fn.hideLoader = function(){
		$('#'+this._options.id +' .main-loader').removeClass('csspinner traditional').addClass('glyphicon glyphicon-search');
	},

	/* -----
	# @name createRow()
	# Create a row table DOM
	# @return HTMLTableRowElement TableRow
	-------------------------------------------------------------- */
	$.fn.createRow = function( id ){
		var row = document.createElement('tr');
			row.id  = this._options.id + '-row-'+ id;
			this.mainTableBody.appendChild(row);
		return row;
	},

	/* -----
	# @name addToCollection()
	# @return void
	-------------------------------------------------------------- */
	$.fn.addToCollection = function(value,rw){
		this._collection.push(value);
		this._collection = this.uniq( this._collection );
		this._options.onCheckBox.call(this,value,this._collection,rw);
	},

	/* -----
	# @name removeToCollection()
	# @return void
	-------------------------------------------------------------- */
	$.fn.removeToCollection = function(value){
		var index = this._collection.indexOf(value);
		if (index > -1) {
		    this._collection.splice(index, 1);
		}
		this._options.onCheckBox.call(this,value,this._collection);
	},

	/* -----
	# @name twoDigits()
	# @return void
	-------------------------------------------------------------- */
	$.fn.twoDigits  = function (d) {
	    if(0 <= d && d < 10) return "0" + d.toString();
	    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	    return d.toString();
	}

	/* -----
	# @name toDateTime()
	# @return void
	-------------------------------------------------------------- */
	$.fn.toDateTime = function(str){
		var date = new Date(str);
		date.getUTCFullYear() + "-" + this.twoDigits(1 + date.getUTCMonth()) + "-" + this.twoDigits(date.getUTCDate()) + " " + this.twoDigits(date.getUTCHours()) + ":" + this.twoDigits(date.getUTCMinutes()) + ":" + this.twoDigits(date.getUTCSeconds());
	},

	/* -----
	# @name getAllCheckRows()
	# @return void
	-------------------------------------------------------------- */
	 $.fn.getAllCheckRows = function(){
		var boxes = new Array();
		$('#' + this.Container.attr('id') + ' .chkbox').each(function(i,chck){

			if( chck.checked ){
				boxes.push( chck.value );
			}
		});
		return boxes;
	 },

	/* -----
	# @name setPage
	# set the page request
	-------------------------------------------------------------- */
	$.fn.setPage = function( p ){
		 this._page = p;
		 this.load();
	},

	/* -----
	# @name createTable()
	# Create the table object
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawTable = function(){

		// general table calls
		this._container.addClass('ztable ');

		// set drawSearch
		this.drawSearch();
 
		//Main table
		this.mainTable 	       	   		= document.createElement('table');
		this.mainTable.className   		= 'table table-condensed '; //table-striped
		this.mainTable.width	   		= this._options.width;
		this.mainTable.border	   		= 0;
		this.mainTable.cellspacing 		= 0;
		this.mainTable.cellpadding 		= 0;
		this.mainTable.id 	       		= this._options.id+'-ztable';
		this._container.append(this.mainTable);

		// thead 
		this.mainTableHead 				= document.createElement('thead');
		this.mainTableHead.id 	       	= this._options.id+'-ztable-head';
		this.mainTable.appendChild(this.mainTableHead);


		// tbody 
		this.mainTableBody 				= document.createElement('tbody');
		this.mainTableBody.id 	       	= this._options.id+'-ztable-body';
		this.mainTable.appendChild(this.mainTableBody);

		// nav section
		if( this._options.navigation === false ) {
			this.navSection 	       = document.createElement('div');
			this.navSection.className  = ' text-center';
			this._container.append(this.navSection);
			this.navSection 		   = $(this.navSection);

		}else{
			this.navSection = $( this._options.navigation );
			this.navSection.addClass(' text-center');
		}

	 },

	/* -----
	# @name _search
	# This function do the search ajax request
	-------------------------------------------------------------- */
	  $.fn._search = function(){
		var that 		 = this;
		this._page 		 = 1;
		this._collection = [];
		if (window.keyTimeout_) {
				clearTimeout(window.keyTimeout_);
		}
		var callMethod = function(){
			that.load();
		}
		window.keyTimeout_ = setTimeout(callMethod, 1000);
	  },

	  /* -----
	  * createSearch()
	  * create the Search input in the table
	  * @return void
	  -------------------------------------------------------------- */
	  $.fn.drawSearch = function(s ){
	  	
	  	var that = this;

		if( this._options.searcher ){

			this.sic 	       	   		= document.createElement('section');
			this.sic.className     		= 'search-container input-group';
			this._container.append(this.sic);

			// ------------------------------------------------------------

			this.searchInput 	         = document.createElement('input');
			this.searchInput.type        = 'search';
			this.searchInput.placeholder = this._options.searchtext;
			this.searchInput.className   = ' form-control' ;
			this.sic.appendChild( this.searchInput );
			this.searchInput = $( this.searchInput );

			// input-group-addon
			var gspan 	       	   		= document.createElement('div');
			gspan.className     		= 'input-group-addon';
			this.sic.appendChild(gspan);

			// loader_icon_search
			var gspanicon 	       	   	= document.createElement('div');
			gspanicon.id                = 'loader_icon_search';
			gspanicon.className     	= 'glyphicon glyphicon-search main-loader';
			gspan.appendChild(gspanicon);

			// search input blur action
			this.searchInput.blur(function(e){
			 	e.preventDefault();
				if( that.searchInput.val() == ''  ) {
					that._keyword = null;
				}else{
					that._search();
				}
			});

			// search input key actions 
			this.searchInput.keyup(function(e){
					e.preventDefault();
			    if(  ( that.searchInput.val() != '' ) ){
					that._keyword = that.searchInput.val();
					that._search();
			    }else{
			    	that._keyword = null;
			    	that._search();
			    }
			});			
	 	}
	  },

	/* -----
	# @name createHeaders()
	# create the headers in the table
	#
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawHeaders = function(){

		$(this.mainTableHead).html('');

		var that     = this;		 	
		var iterator = 1;

		if( this._options.checkbox ) {

			var th 				= document.createElement('th');
				th.id	 		= that._options.id+'cell-header-check';
				th.innerHTML	= '';
				th.className	= 'center';
				th.style.width  = '10px';
				this.mainTableHead.appendChild(th);

			var check 			= document.createElement('input');
				check.type	 	= 'checkbox';
				check.id	 	= that._container.attr('id')+'_checkbox_main';
				check.onclick	= function(){
				var mainchecked = this;
				$('#' + that._container.attr('id') + ' .chkbox').each(function(i,chck){
					if( mainchecked.checked ){
					 	chck.checked = true;
					 	that.addToCollection(chck.value);
					}else{
						chck.checked = false;
						that.removeToCollection(chck.value);
					}								
				});
				that._options.onCheckBoxMain.call(this,that._collection);
			};	
			th.appendChild(check);
		}

		//the collection array 
		this.thcollection = new Array();

		//total key headers
		var total    	  = Object.keys(this._options.headers).length ;	

		// loopp headers
		$.each(this._options.headers,function(idx,itm){	

			// column config
			var width    = typeof(itm.width) != 'undefined' ? itm.width : '' ;
			var align    = typeof(itm.align) != 'undefined' ? itm.align : '' ;
			var lastcol  = iterator >= total ? 'lastcol' : '';
			var sort     = typeof( itm.sort ) == 'undefined' ? true : itm.sort;
			var sortable = that._sortby == 'desc' && idx == that._sortfield ? 'sort-up sort-field' : '';
			var sortable = that._sortby == 'asc' && idx == that._sortfield ? 'sort-field' : sortable;

			// th cell
			var th 				= document.createElement('th');
				th.id	 		= that._options.id+'cell-header-'+ idx;
				th.width		= width;
				th.innerHTML	= itm.name;
				th.className	= sortable +' '+align +' '+ lastcol;
				th.dataset.value   = idx;					
				that.mainTableHead.appendChild(th);

			//enable sort column
			that.sortColumn(sort,th);

			//add items to th collection
			that.thcollection.push( th );

			//loop iterator
			iterator++;
		});

	},

	/* -----
	# @name sortAction
	# set the page request
	-------------------------------------------------------------- */
	$.fn.sortAction = function(th){		
		// sort field
		this._sortfield  =  $(th).attr('data-value');
		
		// sort order
		this._sortby = $(th).hasClass('sort-up')  ? 'asc' : this._sortby = 'desc';
		
		// load data
		this.load();
	},

	/* -----
	# @name sortColumn()
	# create the headers in the table
	#
	# @return void
	-------------------------------------------------------------- */
	$.fn.sortColumn = function(sort,th){		
		var that = this;
		// sortable column
		if( that._options.sortable ){
			if( sort ) {
				$(th).addClass('sort');
				th.onclick = function(){
					that.sortAction(this);
				};
			}
		}
	}
	
	/* -----
	# @name drawBody()
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawBody  = function(){
		
		var i 		 = 0;	
		var that     = this;
		var count 	 = this._data.length;
		
		$(this.mainTableBody).html(' ');
		
		$.each(this._data, function(i,rowset){

			var nogrid  =  that._options.drawgrid  == false ? 'nogrid' : '' ;
			
			//This call onBeforeCreateRow Callback
			that._options.onBeforeCreateRow.call(this);

			// create html row
			var row 	 = that.createRow(i); 

			// cell iterator 
			var iterator = 1;
			var total    = Object.keys(that._options.headers).length ;				
			var lastcol  = ( i + 1 ) >= total ? 'last' : '';

			if( that._options.checkbox ) {
				//Create the Checkbox column
				that.createCheckBoxes(row, rowset, lastcol, nogrid);
			}

			// loop data table
			$.each(that._headers,function(it,col){

				// column type
				var type    = typeof(col.type)  == 'undefined' ? false : col.type;
				var label   = typeof(col.label) == 'undefined' ? false : col.label;
				var link    = typeof(col.link)  == 'undefined' ? false : col.link;

				// last col in each row
				var lastCol  = iterator >= total ? 'lastcol' : '';

				//This call onBeforeCreateRow Callback
				that._options.onBeforeCreateCell.call(this);

				// cell data table
				var cell 			= document.createElement('td');
					cell.id	    	= that._options.id+ '-cell-data' + it;
					cell.className	= col.align+ ' ' + lastCol+ ' ' + nogrid;	
					row.appendChild(cell);
			
				// format type cases
				switch( type ){
					case 'date': 
						cell.innerHTML = that.toDateTime( rowset[it] );
					break;	
					case 'money': 
						cell.innerHTML = rowset[it].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') ;
					break;						
					case 'float': 
						cell.innerHTML = rowset[it].toFixed(2);
					break;						
					default:					
						cell.innerHTML = ( rowset[it] );
					break;								
				}

				if( link ){
					if( label ){
						var link  					= document.createElement('span');
							link.className			= 'label label-' + label;
							link.innerHTML			= cell.innerHTML;
							link.href      			= 'javascript:;';
							link.dataset.toggle     = 'title';
							link.dataset.placement  = 'auto';
							link.title				= col.title;							
							link.onclick  			= function(){								
								that._options.onLink.call(that,rowset,this);							
							}		
						cell.innerHTML = '';					
						cell.appendChild(link);

					}else{
						var link  					= document.createElement('a');
							link.innerHTML			= cell.innerHTML;
							link.href      			= 'javascript:;';
							link.dataset.toggle     = 'tooltip';
							link.dataset.placement  = 'auto';
							link.title				= col.title;	
							link.onclick  		= function(){								
								that._options.onLink.call(that,rowset,this);							
							}				
						cell.innerHTML = '';				
						cell.appendChild(link);	
					}
				}else{

					// if title is in the config col 
					var ttl = typeof(col.title) == 'undefined' ?  '' : 'data-toggle="tooltip" data-placement="left" title='+col.title; 

					if( label ){
						// label cases
						switch( label ){
							case 'danger':
								var lbl = 'label-danger';
							break;
							case 'success':
								var lbl = 'label-success';
							break;
						}
						cell.innerHTML = ( '<span class="label '+lbl+'" >'+ cell.innerHTML.toUpperCase() +'</span>' );						
					}
				}
				
				if ( typeof( col.value ) != 'undefined' ){
					cell.innerHTML = col.value.call( that, rowset[col.db], rowset ) 
				}

				iterator++;
			});
		});
	},

	/* -----
	# @name createCheckBoxes()
	# @return void
	-------------------------------------------------------------- */
	$.fn.createCheckBoxes = function( row, rowset, lastcol, nogrid ) {

	 	var that    = this;
		var valueid = this._options.primary ? rowset[this._options.primary] : rowset.id;

		// td elements
		var cell 		 		= document.createElement('td');
		cell.id	     	 		= 'rtd-'+rowset.id;
		cell.className	 		= 'center' +' '+ lastcol + ' ' + nogrid;
		cell.style.width 		= '30px';
		row.appendChild(cell);

		// input elements
			var chkbox 				= document.createElement('input');
				chkbox.type         = 'checkbox';
				chkbox.className	= 'chkbox';
				chkbox.id 		    = this._options.id +'-checkbox-'+valueid;
				chkbox.value 		= valueid;				
				chkbox.checked 		= this._collection.indexOf(String(valueid)) > -1 ? true : false;
				chkbox.onclick      = function(e){
					e.preventDefault();
					if(this.checked){
						that.addToCollection(this.value,rowset);
					}else{
						that.removeToCollection(this.value);
					}
				}
		cell.appendChild(chkbox);
	 },

	/* -----
	# @name drawPages()
	# @return void
	-------------------------------------------------------------- */
	$.fn.drawPages = function(){

	 	// clear nav section
	 	this.navSection.html('');

	 	var nav 		= '';
	 	var that 		= this;
	 	var pages 		= this._pages;
		var curr 		= pages.current_page > 1 ? ( parseInt( pages.current_page ) ) : pages.current_page;				
		var pageview    = 10;
		var interval    = Math.floor ( (pageview/2) );
		var total 	    = pages.last_page;
		var current     = parseInt(curr);
		var aux 	    = ( Math.round(current) - pageview ) + interval;
		var initpage    = current < pageview ?  0 : ( aux ) ;
		var maxpages    = current == total  ? total : initpage + pageview ;
		var maxpages    = maxpages > total ? total : maxpages;
		var aux2 	    =  maxpages - initpage ;
		var ninitpage   = initpage - ( pageview - aux2 ) ;
		var initpage    = aux2 < pageview && ( total > pageview ) ? ninitpage : initpage ;

		 if( pages.last_page > 1 ) {
			  var prevpage = parseInt(curr) - 1;
			  if( parseInt(curr) != 1 && prevpage >= 0 ){
				  nav += '<li><a href="javascript:;" id="znavi_'+1+'" class="'+ classe +'">&laquo; &laquo; </a></li>';
			  }else{
				  nav += '<li><a href="javascript:;" id="znavi_'+1+'" class="banned">&laquo; &laquo; </a></li>';
			  }
			  if( parseInt(curr) != 1 && prevpage >= 0 ){
			  	 nav += '<li><a href="javascript:;" id="znavi_'+prevpage+'" class="'+ classe +'"><span class="glyphicon glyphicon-chevron-left"></span></a></li>';
			  }else{
				 nav += '<li><a href="javascript:;"  id="znavi_'+1+'" class="banned"><span class="glyphicon glyphicon-chevron-left"></span> </a></li>';
			  }

			 //---------------------------------------------------------------
			 for( var o = initpage; o < maxpages; o++ ){

				 var classe =  curr == ( o + 1 )  ? 'active' : '';
				 var nextpage = parseInt(curr) + 1;
				 var ix = o + 1;
				 nav += '<li class="'+ classe +'"><a href="javascript:;" id="znavi_'+ix+'" >'+ ix +'</a></li>';
			 };
			  //---------------------------------------------------------------

			 if( nextpage <= pages.last_page ){
			  	nav += '<li><a href="javascript:;" id="znavi_'+nextpage+'" > <span class="glyphicon glyphicon-chevron-right"></span></a></li>';
			 }else{
				  nav += '<li><a href="javascript:;" class="banned">&raquo;</a>';
			 }

			 if( nextpage <=  pages.last_page){
				  nav += '<li><a href="javascript:;" id="znavi_'+pages.last_page+'" class="'+ classe +'">&raquo; &raquo;</a></li>';
			 }else{
			  	  nav += '<li><a href="javascript:;" class="banned">&raquo; &raquo;</a></li>';
			 }
		 }
		 nav = '<ul class="pagination">'+ nav + '</ul>';

		 this.navSection.append( nav );

		 $('.pagination a').each(function( e , itm){
				if( typeof(itm.id) != 'undefined' && itm.id.length > 0 )
			 	$(this).click(function(){
			 		that.setPage( (this.id).split('_')[1] );
			 	});
		 });
	 	
	 },

	/* -----
	# @name load
	# This function do the ajax request
	-------------------------------------------------------------- */
	$.fn.load = function (){

		var that = this;
		
		this._options.params.page   = this._page;
		this._options.params.rows   = this._rows;
		
		// The Serch Keyword
		if(that._options.searcher )
			that._options.params.keyword  = that._keyword != null ?  that._keyword : that.unbindKeyRequest('keyword');

		// Sort keys --------------------------------------
		if( this._sortfield == null ){		
			that.unbindKeyRequest('sortfield');
			that.unbindKeyRequest('sortby');
		}else{
			this._options.params.sortfield = this._sortfield;
			this._options.params.sortby    = this._sortby;
		}

		// call onBeforeRequest callback 
		that._options.onBeforeRequest.call(that);

		// show loader spinner
		that.showLoader();

		// allow abort
		if(that._options.allowAbort){
			that._xhr.abort();
		}

		// this is the ajax request
		this._xhr = $.ajax({
		  method: String(that._options.method).toUpperCase(),
		  url:  that._options.source,
		  data: that._options.params
		})
		.fail(function(jqXHR, textStatus) {
		  console.error( "Table Error:" + jqXHR.getResponseHeader());		  
		  that._options.onRequestFail.call(that);
		})
		.done(function( source ) {	

		   that._xhr     = false;
		   that._data    = source.data;
		   that._pages   = typeof(source.pages)   == 'undefined' ? that._pages   : source.pages;
		   that._headers = typeof(source.headers) == 'undefined' ? that._headers : source.headers;
		   that.hideLoader();
		   that.render(data = null);

		});

	},

	$.fn.render = function(){
		
		var that = this;

		// //Create Table
		this.drawBody( data );

		// this drawHeaders
		this.drawHeaders();

		// //Create The pages navigation
		this.drawPages( );

		// onComplete Request
		this._options.onCompleteRequest.call(this);

	}


})(jQuery);