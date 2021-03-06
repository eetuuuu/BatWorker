var exec = require( 'child_process' ).exec;
var fs=require('fs');
var Q=require('q');

var jobs={};
var global=window;

jobs.clearDirTmp={
	id:1,
	type:'clearDir',
	desc:'',
	name:'删除目录',
	dirs:[],
	viewFilters:{
		desc:'描述',
		dirs:'目录列表'
	},

	exec:function(vo){
		global.log('删除目录',vo.dirs);		
		console.dir(vo);
		var getOne=function(path){
			 console.log('start clearDir');
			 console.log('rm -r '+path);
			var call=function(resolve, reject, notify) {
				exec( 'rm -r ' + path, function ( err, stdout, stderr ){
				  if(err){
				  	reject(err);
				  }else{
				  	resolve("成功删除目录");
				  }
				});
			};
			return Q.Promise(call);
		}
		return Q.any(vo.dirs.map(getOne));
	}
}

jobs.copyFileTmp={
	id:2,
	type:'copyFile',
	desc:'',
	copyFrom:'',
	copyTo:'',
	name:'复制文件',
	viewFilters:{
		desc:'描述',
		copyFrom:'源文件',
		copyTo:'目标文件'
	},
	exec:function(vo){
		return Q.Promise(function(resolve, reject, notify) {
			global.log('复制文件',vo.copyFrom,vo.copyTo);	
			var cpFile = require('cp-file');
 			console.dir(vo);
 			//return;
			cpFile(vo.copyFrom, vo.copyTo, function (err) {
			    if(err){
				  	reject(err);
				  }else{
				  	resolve("成功删除目录");
				 }
			});
    	});
	}
}

jobs.copyDirTmp={
	id:3,
	type:'copyDir',
	desc:'',
	copyFrom:'',
	copyTo:'',
	name:'复制目录',
	viewFilters:{
		desc:'描述',
		copyFrom:'源目录',
		copyTo:'目标目录'
	},
	exec:function(vo){
		return Q.Promise(function(resolve, reject, notify) {
			var copyDir = require('copy-dir');
			global.log('复制目录',vo.copyFrom,vo.copyTo);	
			console.dir(vo);
			var str='xcopy "'+vo.copyFrom+'" "'+vo.copyTo+'" /D /E /I /F /Y';
			exec( str, function ( err, stdout, stderr ){
				  if(err){
				  	reject(err);
				  }else{
				  	resolve("成功复制目录")
				  }
				});
					
			return;
			copyDir(vo.copyFrom, vo.copyTo,null,function(err){
				if(err){
					console.log('dengyp copyDir error'+err);
					reject(err);
				}else{
					resolve("成功复制目录")
				}
			});
    	});
	}
}

jobs.combinXmlTmp={
	id:4,
	type:'combinXml',
	desc:'',
	saveAs:'',
	xmls:[],
	nodes:[],
	name:'合并xml',
	viewFilters:{		
		desc:'描述',
		saveAs:'另存为',
		xmls:'文件列表 第一个为主文件',
		nodes:'节点列表 如application.test'
	},
	exec:function(vo,vars){
		if(vo.xmls.length<2){
			return null;
		}
		var dealData=function(data){
			data=window.globalReplace(data,vars);
			//console.dir(data);
			var parser=new DOMParser();
			return parser.parseFromString(data,"text/xml");
		}
		var q=Q.Promise(function(resolve, reject, notify) {
			global.log('合并xml',vo.xmls[0]);
			fs.readFile(vo.xmls[0],'utf8',function(err,data){
				if(err){
					reject(err);
				}else{
					//默认进行替换的
					//data=window.globalReplace(data,vars);
					resolve(dealData(data));
				}
			});
    	});

    	var runText=function(url){
    		return q.then(function(result){
				//console.log('dengyp replaceVarTmp '+result);
				global.log('合并xml',url);
				//console.dir(result);
				var data=fs.readFileSync(url,'utf8');
				var xml=dealData(data);
				//console.dir(xml);
				for(var i=0;i<vo.nodes.length;i++){
					var arr=vo.nodes[i].split(".");
					console.log('dengyp runNext',vo.nodes[i]);
					console.dir(arr);
					var node=result.documentElement;
					var list=xml.getElementsByTagName(arr[0]);
					for(var j=1;j<arr.length;j++){
						//console.log('fuck here',arr[j]);
						node=node.getElementsByTagName(arr[j-1])[0];
						//console.log('fuck why');
						list=list[0].getElementsByTagName(arr[j]);
						console.log('fuck here end',arr[j]);
					}
					
					console.dir(node);
					console.dir(list);
					for(var j=0;j<list.length;j++){
						node.appendChild(list[j].cloneNode(true));
					}
				}

				return result;
			});
    	};

    	for(var i=1;i<vo.xmls.length;i++){
    		q=q.then(runText(vo.xmls[i]));
    	}
    	return q.then(function(result){

    		var str=(new XMLSerializer()).serializeToString(result);
    		//console.log('combinXml result');
    		//console.dir(result);
			fs.writeFileSync(vo.saveAs,str,"utf8");
			return str;
    	});
	}
}


jobs.readFileTmp={
	id:5,
	type:'readFile',
	desc:'',	
	name:'读取文件',
	fileName:'',
	sons:[],
	format:'utf-8',
	viewFilters:{
		desc:'描述',
		fileName:'文件名',
		format:'格式',
		sons:'子项'
	},

	exec:function(vo,vars){
		var q=Q.Promise(function(resolve, reject, notify) {
			global.log('读取文件',vo.fileName);
			fs.readFile(vo.fileName,vo.format,function(err,data){
				if(err){
					reject(err);
				}else{
					//默认进行替换的
					data=window.globalReplace(data,vars);
					resolve(data);
				}
			});

    	});
		vo.sons.forEach(function(vo){
			q=q.then(window.cfgs.getJobExe(vo,vars,q));
		});
		return q;
	}

}

jobs.replaceVarTmp={
	id:6,
	type:'replaceVar',	
	parent:5,
	name:'查找替换',
	find:'',
	replace:'',
	viewFilters:{
		desc:'描述',
		find:'查找',
		replace:'替换'
	},
	exec:function(vo,vars,q){
		return q.then(function(result){
			//console.log('dengyp replaceVarTmp '+result);
			console.log('start replaceVarTmp');

			result=result.replace(new RegExp(vo.find,'g'),vo.replace);
			return result;
		});
	}
}

jobs.saveFileTmp={
	id:7,
	type:'saveFile',	
	parent:5,
	name:'存储文件',
	desc:'',
	url:'',
	viewFilters:{
		desc:'描述',
		url:'存储位置'
	},
	exec:function(vo,vars,q){
		return q.then(function(result){
			global.log('读取文件',vo.url);
			fs.writeFileSync(vo.url,result,"utf8");
			return result;
		});
	}

}

jobs.runCmdTmp={
	id:8,
	type:'runCmd',
	name:'运行命令',
	desc:'',
	cmdStr:'',
	breakError:'true',
	viewFilters:{
		desc:'描述',
		cmdStr:'命令',
		breakError:'出错中断'
	},
	exec:function(vo,vars,q){
		var call=function(resolve, reject, notify) {
				//return;
			global.log('运行命令',vo.cmdStr);
				exec( vo.cmdStr, function ( err, stdout, stderr ){
					console.log('end runCmdTmp',err);
				  if(err){
				  	if(vo.breakError=='true'){
						reject(err);
				  	}else{
						resolve("运行命令失败");
				 		global.log('运行命令失败',vo.cmdStr);
				  	}
				  	
				  }else{
				  	resolve("成功运行命令");
				 	global.log('成功运行命令',vo.cmdStr);
				  }
				});
			};

		return Q.Promise(call);
	}
}

jobs.delFileTmp={
	id:9,
	type:'delFile',
	name:'删除文件',
	desc:'',
	files:[],
	viewFilters:{
		desc:'描述',
		files:'文件列表'
	},
	exec:function(vo){
		global.log('删除文件',vo.files);		
		
		var getOne=function(path){
			console.log('start delFile');
			console.log('del '+path);
			var call=function(resolve, reject, notify) {
				exec( 'del ' + path, function ( err, stdout, stderr ){
				  if(err){
				  	reject(err);
				  }else{
				  	resolve("成功删除文件 "+path);
				  }
				});
			};
			return Q.Promise(call);
		}
		return Q.any(vo.files.map(getOne));
	}
}


export default jobs;