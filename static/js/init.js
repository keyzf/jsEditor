function getUrl(param){
	 var reg = new RegExp("(^|&)"+ param +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}

$(function(){
	var $editor = $('#JEditor').JEditor(),
		$dragBox = $("#JDragBox"),

		diy= getUrl('diy'),
		_diy='',
		_diyDir='',
		_action,
		tplId = getUrl('tplId'),
		aId= getUrl('aId'),  //act id
		lId= getUrl('lId'),  //loupan id
		tId= getUrl('tId'),
		actionBase = siteConfig.url.base+siteConfig.url.poster;  //template id;

	if(diy==='true'){
		_diy='&diy='+diy;
		_diyDir='diy/';
	}
	if(tplId){
		if(aId && lId && tId){ //利用模版 编辑具体内容
			_action = actionBase+'?lId='+lId+'&aId='+aId+'&tId='+tId+_diy;
		}else{ //只编辑模版
			_action = actionBase+'?tplId='+tplId+_diy;
		}
	}else{
		_action = actionBase+'?lId='+lId+'&aId='+aId+'&tId='+tId+_diy;
	}

	(function getId(){
		if(!diy || diy==='false'){ //非自定义编辑，即普通可视化编辑，不需要表单／红包，无需后端接口交互
			$('.diy-attr').addClass('hide');
		}

		var edit= getUrl('edit');
		if(!tplId && (!aId || !lId || !tId)){
			return;
		}else{
			$('#createPage').prop('action',_action);
			//编辑历史文件
			if(edit){
				var iframeSrc = _diyDir+lId+'/'+aId+'/'+tId+'.html';
				if(tplId){
					iframeSrc = 'tpl/'+tplId+'/index.html';
				}
				$('#JDragBox').before('<iframe src="poster/'+iframeSrc+'" style="display:none" name="poster" id="poster"></iframe>');
				$('#poster').load(function(){
					var _iframe = window.frames["poster"],
						_config = _iframe.editConfig;
					$dragBox.css({
						'left' : _config.left,
						'top' : _config.top,
						'width' : _config.width,
						'height' : _config.height,
						'backgroundImage': 'url('+_config.url+')'
					});

					if(_config.packetSetting){
						window.packetSetting=_config.packetSetting;
					}
					$(".textarea").html($("#poster").contents().find("#create_wrap").html()); //获取生成内容
					$(window.parent.document).find('.insertImageBox').hide();
					$(window.parent.document).find('.mask').hide();
					$.drag(false);
				})
			}else{
				_drag();
			}
		}
	}());

	function _drag(){  //拖拽相关
		var url=getUrl('imgUrl'),
			picUserd = parseInt(getUrl('picUserd')),
			insertPicId = getUrl('insertPicId');
		if($dragBox.css('backgroundImage')==='none' && !url && !getUrl('edit')){
			$.post(_action+'&newBlank=true',{pageContent:''},function(){ //生成空白页面，防止404
			    console.log('create a new blank page success');
		  	});
			// alert('请先上传背景图');
			// $('.insertImage').trigger('click');
			// $dragBox.find(".toolTip").trigger("click");
		}else{
			var imgUrl = siteConfig.url.editor+'node/upload/'+url;
			if(picUserd===1){
				$(window.parent.document).find('#JDragBox').css('backgroundImage','url('+imgUrl+')');
				//自动保存背景
				$(window.parent.document).find('.textarea').addClass('editorEnble');
				bgCtrl('save', $(window.parent.document));
				// $(window.parent.document).find("#JEditor .btn-redo").removeClass('hide'); 
				// $(window.parent.document).find('#JScaleBox').addClass('hide');

			}else{
				console.log('as small pic');
				var triggerDom_str = insertPicId.substr(0,insertPicId.indexOf('__')+2),
					triggerDom_num = parseInt(insertPicId.substr(insertPicId.indexOf('__')+2))+1,
					triggerDom=triggerDom_str+triggerDom_num;
				$(window.parent.document).find('#'+insertPicId).val(imgUrl);
				$(window.parent.document).find('#'+triggerDom).trigger('click');
			}
			$(window.parent.document).find('.insertImageBox').hide();
			$(window.parent.document).find('.mask').hide();	
		}
		$.drag(false);
	};

	// $dragBox.on("click",'.toolTip',function(e){
	// 	$.drag(false);
	// });

	$("#JEditor").on("click",'.btn-redo',function(){
		var $this = $(this),
			next = $this.data("next");
		if(next === 'edit'){
			$.drag(true);
			if($("#JDragBox").css("backgroundImage")==="none"){
				$('.insertImage').trigger('click');
			}
			// $this.data("next","save").find(".content").html("保存背景");
			bgCtrl('edit');
		}else{
			$.drag(false);
			// $this.data("next","edit").find(".content").html("编辑背景");
			bgCtrl('save');
		}
		
	});

	$('#returnPrevPage').on('click',function(){
		var url ="";
		if(lId){
			url = _diy ? "/member/tuiguang/hunhe/getHunheListByBuildId" : "/member/tuiguang/haibao/getHaiBaoListByBuildId";
		}else if(tplId){
			url = "/yjsAdminService/temp/manage/getByUserTemplateInfoList?manageDeskType=2"
		}
		window.location.href = url;
		
	});

	function createPage(){
		var cPConfig={
			// url:　$dragBox.css('backgroundImage').replace('url(\"','').replace('\")',''),
			url:　$dragBox.css('backgroundImage').replace('url(','').replace(')','').replace(/\'/g,'').replace(/\"/g,''),  //debug 360 browser
			top: $dragBox.css('top'),
			left: $dragBox.css('left'),
			width: $dragBox.css('width'),  //待计算转化
			height: $dragBox.css('height')
		},
			_img={
				top:parseFloat(cPConfig.top) -200 + 'px',
			},
			_html= '<!DOCTYPE html><html><head><meta charset="utf-8">' +
				'<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>' +
				'<title>海报内容</title></head>' +
				'<style>html{overflow-x:hidden;max-width: 100%;height: 100%;}body{margin: 0;padding: 0;max-width: 100%;overflow-x:hidden;height: 100%;position: relative;}body img{max-width:100%;max-height:100%}.drag-bg{position:absolute;z-index:-1;left:0;top:'+_img.top+';width:'+cPConfig.width+';height:'+cPConfig.height+';background-image:url('+cPConfig.url+');background-position:center top;max-width:100%;}.qrcode{position: absolute;left:6%;bottom: 6%;width: 88%;height: 150px}.qrcode-img{width: 50%;position: absolute;left: 0;top: 0}.qrcode-text{position: absolute;left: 60%;top: 40px;font-size: 1rem;text-align: center;}'+
				$('#exportCss').text()+'</style>' +
				'<body><div class="drag-bg"></div>' +
			   	// $('#enabledTextArea').html() +   //id can be repeat,to do fixed,the follow test class
			   	'<div id="create_wrap">'+$(".textarea").html()+'</div>';
			_js = '<script>var isMobile=(function(){return (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i));}());if(!isMobile){var e=document.getElementsByTagName("body")[0];e.className="preview";};var editConfig={url:"'+cPConfig.url+'",top:"'+cPConfig.top+'",left:"'+cPConfig.left+'",width:"'+cPConfig.width+'",height:"'+cPConfig.height+'",pInfo:{lId:'+lId+',aId:'+aId+',tId:'+tId+'},packetSetting:'+JSON.stringify(window.packetSetting)+'};'+ 
				  'function getUrl(param){var reg = new RegExp("(^|&)"+ param +"=([^&]*)(&|$)"),r = window.location.search.substr(1).match(reg);if(r!=null)return  unescape(r[2]); return null;}function insertScript(src,callback){var oHead = document.getElementsByTagName("HEAD").item(0),oScript= document.createElement("script");oScript.type = "text/javascript";oScript.src=src;oHead.appendChild( oScript);if(callback){oScript.onload=function(){callback()}}}if(getUrl("qrcode")){insertScript("http://www.yjsvip.com/member/publicStatic/h5ds/scripts/library/jquery-2.0.0.min.js",function(){var _b=$("body").height(),_bg=$(".drag-bg").height();if(_b<_bg){$("body").height(_bg)}insertScript("http://www.yjsvip.com/member/js/jquery.qrcode.min.js",function(){$("body").append(\'<div class="qrcode"><div id="qrcode-img" class="qrcode-img"></div><div class="qrcode-text"><p>长按识别二维码</p><p>查看楼盘详情</p></div></div>\');_url=getUrl("qrcodeText")||"http://www.yjsvip.com/";$("#qrcode-img").qrcode({width:150,height:150,text:_url});})});}</script>';
		
		var ajaxUrl = $('#postActUrl').val(); //有表单数据
		if(ajaxUrl){
			_js +='<script src="'+siteConfig.url.editor+'/static/js/jquery-1.10.2.min.js"></script>' +
				  '<script>$(function(){$("#submitSave").on("click",function(){var cls="btn-important";if($(this).hasClass(cls)){$(this).removeClass(cls);var _len=$("#newActForm input").length-1,_info="";for(var i=0;i<_len;i++){_info+=$($("#newActForm input")[i]).prop("name")+":\'"+escape(escape($($("#newActForm input")[i]).val()))+"\',"}_info=_info.substr(0,_info.length-1);$.getJSON($("#postActUrl").val()+"?pInfo={lId:"+editConfig.pInfo.lId+",aId:"+editConfig.pInfo.aId+",tId:"+editConfig.pInfo.tId+"}&fInfo={"+_info+"}&callback=?",function(data){if(data.status===1){alert("提交成功")}})}else{alert("你已提交,无需重复提交")}})})</script>';
			$.getJSON($('#newActUrl').val()+'?pInfo={"lId":'+lId+',"aId":'+aId+',"tId":'+tId+'}&fInfo='+$('#newActValue').val()+'&callback=?',
				function(data){
					console.log(data);
				}
			);
		}

		if(packetSetting && packetSetting.totalMoney>0 && $(".locationGrabBonus").length>0){ //红包数据
			_js +='<script src="'+siteConfig.url.editor+'/static/js/jquery-1.10.2.min.js"></script>' +
				  '<script>$(function(){if(location.href.indexOf("grabBonus.html")>0){function getUrl(param){var reg=new RegExp("(^|&)"+param+"=([^&]*)(&|$)");var r=window.location.search.substr(1).match(reg);if(r!=null)return unescape(r[2]);return null}var fontScale = $(".locationGrabBonus").width()/$(window).width();$(".locationGrabBonus .data-get").css({Transform:"scale("+fontScale+")",TransformOriginX:"right",TransformOriginY:"top"}).html(getUrl("hongbao"));$(".locationGrabBonus .data-share").css({Transform:"scale("+fontScale+")",TransformOriginX:"right",TransformOriginY:"top"}).html(getUrl("leftHongbaoPoint"))}else{$(".grabBonus").on("click",function(){var iframeD=$("#testIframe",parent.document),hongbaoId=iframeD.data("hongbaoid"),hongbaoKey=iframeD.data("hongbaokey");function _openHongbao(id,key){var _id=id||hongbaoId,_key=key||hongbaoKey;$.getJSON(editConfig.packetSetting.openUrl+"?token="+iframeD.data("token")+"&hongbaoId="+_id+"&hongbaoKey="+_key+"&callback=?",function(data){if(data.hongBao.hasPlayed===true){alert("红包已领过")}else if(data.hongBao.hasHonghao===false){alert("红包已领完")}else{window.parent.postMessage("{hongbaoId:"+_id+",hongbaoKey:\'"+_key+"\'}","*");window.location.href="grabBonus.html?hongbao="+data.hongBao.hongbao/100+"&leftHongbaoPoint="+data.hongBao.leftHongbaoPoint/100}})}if(hongbaoId&&hongbaoKey){_openHongbao()}else{$.getJSON(editConfig.packetSetting.getUrl+"?token="+iframeD.data("token")+"&activeId="+editConfig.pInfo.aId+"&callback=?",function(data){if(data.status==="success"){_openHongbao(data.hongbaoInfo.hongbaoId,data.hongbaoInfo.hongbaoKey)}else if(data.code=="2102"){alert("红包已领过")}else if(data.code=="2101"){alert("红包已领完")}})}})}})</script>';
			$.getJSON($('#newActPacket').val()+'?pInfo={"lId":'+lId+',"aId":'+aId+',"tId":'+tId+'}&fInfo={"tId": '+packetSetting.tplId+', "totalMoney":'+packetSetting.totalMoney+', "totalPoint":'+packetSetting.totalPoint+',"totalOnly":'+packetSetting.totalOnly+'}&callback=?',
				function(data){
					console.log(data);
				}
			);
		}
		_html += _js+'</body></html>';
		$('#pageContent').val(encodeURIComponent(_html));

		//更新link
		if(tplId){
			//上传到oss
			$.ajax({
				url:host+"loushus/saveHaibao",
				data:{tplId:tplId, html:_html},
				type:"post",
				dataType:"jsonp",
				success:function(data){
					console.log(data);
				}
			});
		}
	}

	//生成页面
	$('#createPageNow').on('click',function(){
		createPage();
	});
	//保存页面
	$('#savePageNow').on('click',function(){
		createPage();
		$.ajax({
            url: $("#createPage").attr("action"),
            type: 'POST',
            data: {'pageContent':$('#pageContent').val()},
            success: function(data){
            	if(data){
            		alert("保存成功");
            	}
            }
		});
	});
});