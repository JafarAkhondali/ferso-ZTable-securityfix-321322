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

var http  = require('http');
var fs    = require('fs');
var url   = require("url");
var path  = require("path");

// Server Port 
var port  = 8000;

// Document Root
var file  = 'index.html';

/*----
# Server
# This a simple server to test ZTable
------------------------------------------------------------ */
http.createServer(function (req, res) {
    if (path.normalize(decodeURI(req.url)) !== decodeURI(req.url)) {
        res.statusCode = 403;
        res.end();
        return;
    }
	 try{
	 var uri  = url.parse(req.url).pathname
	    ,src  = path.join(process.cwd(), uri)
	     src  = fs.statSync(src).isDirectory() ? src+'/'+file : '/'+src ;	  
	 
	    console.log('/'+src);
	    	 
	 	fs.readFile(src,'binary',function(err,data){ 
			res.writeHead(200);
		    res.write(data,'binary'); 
		    res.end();
		});
	 }catch(e){
	 	console.error(e);
	 	res.end();
	 }	
}).listen(port);

//------------------------------------------------------------
console.log('=========================================================');
console.log('Server running at http://localhost:' + port);
console.log('=========================================================');