<?php
/*
=====================================================
  Abashy Filemanager - by Abashy.com, Alexander Esin
-----------------------------------------------------
 http://abashy.com/
-----------------------------------------------------
 Copyright (c) 2015 Alexander Esin
=====================================================
Данный код защищен авторскими правами
 .....................................
  editor 
=====================================================
*/

header('content-Type: text/html; charset=utf-8');

error_reporting(E_ALL);

include_once ('config.php');

define ('ROOT', $config['rootdirectory'] );

$title = 'Error';

if (isset($_GET['editfile'])){
	
	define ('EDITFILE', $_GET['editfile'] );
	
	//$title = end((explode('/', rtrim(EDITFILE, '/'))));

	$tmp = explode('/', rtrim(EDITFILE, '/'));
	$title = end($tmp);
	
} else {
	
	die('Not found: edited file for CodeMirror');	
	
}

?>
<!DOCTYPE html>
<html lang="en" style="max-width:98%">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<title><?php echo $title ?></title>	
    <meta name="description" content="Abashy editor with syntax highlighting on CodeMirror" /> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
	<link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <link rel="icon" href="favicon.ico" type="image/x-icon">	
    <link rel="stylesheet" href="style.css">	
    <link rel="stylesheet" href="font-awesome.min.css">
	<link rel="stylesheet" href="codemirror/lib/codemirror.css">
    <link rel="stylesheet" href="codemirror/addon/dialog/dialog.css">
	<link rel="stylesheet" href="codemirror/theme/cobalt.css">
	<link rel="stylesheet" href="codemirror/theme/dracula.css">
	<link rel="stylesheet" href="codemirror/theme/eclipse.css">
	<link rel="stylesheet" href="codemirror/theme/monokai.css">

</head>
<body>

<div id="page-preloader"><span id="spinner">Loading ...</span></div>
<div class="ab-container">
<div class="ab-row">
<div class="ab-col12">
<p style="color:white;margin:10px 0 0 -15px;"><?php echo '/' . str_replace(ROOT, '', EDITFILE);	?></p>
</div>
</div>
</div>
<div class="ab-container ab-filemanager" id="ab-main">

<div class="ab-row margin-top10" id="ab-editfile">

<div class="ab-row">			   
			   <div class="ab-col12">	
			   
                <form id="frm-editfile" name="frm-editfile">
<textarea name="areacode" id="areacode" style="display:none"></textarea>
<input type="hidden" name="inputfilename" id="inputfilename" value="<?php echo EDITFILE ?>" />				
              <div id="ab-editor">
			  
			  </div> 

			  
               </form>	
	 	     </div>
</div>
<?php
	
	$code = htmlspecialchars(file_get_contents(EDITFILE));
	
	echo '<ab id="code" style="display:none">'.$code.'</ab>';
	
?>	    

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.3/jquery.min.js"></script>
	<script>
	if (typeof jQuery == 'undefined') {
	  document.write(unescape("%3Cscript src='jquery.js' type='text/javascript'%3E%3C/script%3E"));
	}</script>
	
	<script src="codemirror/lib/codemirror.min.js"></script>
	<script src='codemirror/addon/edit/matchbrackets.js'></script>
	<script src='codemirror/mode/xml/xml.js'></script>
	<script src='codemirror/addon/fold/xml-fold.js'></script>
	<script src='codemirror/addon/edit/matchtags.js'></script>
	<script src="codemirror/addon/scroll/annotatescrollbar.js"></script>
    <script src="codemirror/addon/search/matchesonscrollbar.js"></script>
	<script src='codemirror/addon/search/searchcursor.js'></script>
	<script src='codemirror/addon/search/match-highlighter.js'></script>
    <script src='codemirror/addon/search/search.js'></script>
	<script src='codemirror/mode/javascript/javascript.js'></script>
	<script src='codemirror/mode/css/css.js'></script>					
	<script src='codemirror/mode/htmlmixed/htmlmixed.js'></script>
	<script src='codemirror/mode/clike/clike.js'></script>
	<script src='codemirror/mode/php/php.js'></script>
 	<script src="codemirror/addon/display/panel.js"></script>
    <script src="codemirror/addon/dialog/dialog.js"></script>
	<script src='cookie.js'></script>
<script>
function getFileExtension(n){return n.substring(n.lastIndexOf(".")+1,n.length)||n}function makePanel(){var t=document.createElement("div"),n,i,u,f,r;t.id="ab-panel";t.className="paneltop";n=t.appendChild(document.createElement("button"));n.setAttribute("title","undo");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-undo" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.undo();editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","redo");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-repeat" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.redo();editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=t.appendChild(document.createElement("button"));n.setAttribute("title","bold");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-bold" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<strong>"+editor.getSelection()+"<\/strong>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","italic");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-italic" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<em>"+editor.getSelection()+"<\/em>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","underline");n.setAttribute("type","button");n.innerHTML='<i class="fa fa-underline" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<u>"+editor.getSelection()+"<\/u>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","strikethrough");n.setAttribute("type","button");n.innerHTML='<i class="fa fa-strikethrough" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<s>"+editor.getSelection()+"<\/s>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=t.appendChild(document.createElement("button"));n.setAttribute("title","header");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-header" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<h1>"+editor.getSelection()+"<\/h1>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","paragraph");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-paragraph" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<p>"+editor.getSelection()+"<\/p>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","span");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-scribd" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<span>"+editor.getSelection()+"<\/span>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=t.appendChild(document.createElement("button"));n.setAttribute("title","align left");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-align-left" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection(' style="text-align:left" '+editor.getSelection());editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","align justify");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-align-justify" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection(' style="text-align:justify" '+editor.getSelection());editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","align center");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-align-center" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection(' style="text-align:center" '+editor.getSelection());editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","align right");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-align-right" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection(' style="text-align:right" '+editor.getSelection());editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=t.appendChild(document.createElement("button"));n.setAttribute("title","list ul");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-list-ul" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<ul><li>"+editor.getSelection()+"<\/li><\/ul>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","list ol");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-list-ol" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<ol><li>"+editor.getSelection()+"<\/li><\/ol>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=t.appendChild(document.createElement("button"));n.setAttribute("title","link");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-link" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection('<a href="javascript:void(0)" title="" alt="">'+editor.getSelection()+"<\/a>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","image");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-picture-o" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection('<img src="" alt="" width="" height="" />'+editor.getSelection());editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=t.appendChild(document.createElement("button"));n.setAttribute("title","div id");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-object-ungroup" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection('<div id="" class="">'+editor.getSelection()+"<\/div>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("title","table");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-table" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){editor.replaceSelection("<table><tr><td>"+editor.getSelection()+"<\/td><\/tr><\/table>");editor.focus()});n=t.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";i=t.appendChild(document.createElement("div"));i.setAttribute("class","rext-right");i.id="rightcontainer";i.innerHTML='<select onchange="selectTheme()" id="select"><option selected>default<\/option><option>cobalt<\/option><option>dracula<\/option><option>eclipse<\/option><option>monokai<\/option><\/select>';n=i.appendChild(document.createElement("button"));n.id="ab-btn-save-theme";n.setAttribute("title","set theme default");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-hand-o-left" aria-hidden="true"><\/i>';CodeMirror.on(n,"click",function(){var n=document.getElementById("select"),i=n.options[n.selectedIndex].textContent,t;Cookies.set("theme",i);editor.focus();t="theme saved";$("body").append('<div id="alerts" class="green">'+t+"<\/div>");$("#alerts").fadeIn(2e3).fadeOut(2e3,function(){$("#alerts").remove()})});n=i.appendChild(document.createElement("button"));n.setAttribute("class","btn-hr");n.setAttribute("type","button");n.setAttribute("tabindex","-1");n.innerHTML="&nbsp;";n=i.appendChild(document.createElement("button"));n.id="ab-btn-save-editfile";n.setAttribute("title","save file");n.setAttribute("type","submit");n.setAttribute("tabindex","-1");n.innerHTML='<i class="fa fa-floppy-o" aria-hidden="true"><\/i>';CodeMirror.on(n,"mousedown",function(){$("#areacode").val("").val(editor.getValue());$(this).removeClass("red");$("title").text($("title").text().replace("!!! ",""));editor.focus()});if(editor.addPanel(t,{position:"top",stable:!0}),u=Cookies.get("theme"),u){for(editor.setOption("theme",u),f=document.getElementById("select"),r=0;r<f.options.length;r++)if(f.options[r].text===u){f.selectedIndex=r;break}}else editor.setOption("theme","default")}function selectTheme(){var n=input.options[input.selectedIndex].textContent;editor.setOption("theme",n);editor.focus()}var editor,editedfile=$("#inputfilename").val(),ext=getFileExtension(editedfile),curmode="application/x-httpd-php",input,hh,$preloader,$spinner;switch(ext){case"css":curmode="text/css";break;case"js":curmode="text/javascript"}editor=CodeMirror($("#ab-editor").get(0),{value:$("#code").html(),lineWrapping:!0,lineNumbers:!0,matchBrackets:!0,matchTags:{bothTags:!0},mode:curmode,highlightSelectionMatches:{annotateScrollbar:!0},indentUnit:0,indentWithTabs:!0});editor.setValue($("#code").text());editor.on("change",function(){$("#ab-btn-save-editfile").hasClass("red")||($("#ab-btn-save-editfile").addClass("red"),$("title").text("!!! "+$("title").text()))});makePanel();input=document.getElementById("select");hh=$(window).height()-90;$("div.CodeMirror").css("height",hh);$("body").css("overflow","hidden");$("#frm-editfile").submit(function(n){return n.preventDefault(),$("body").append('<div id="alerts" class="btn green">Working..<\/div>'),$("#alerts").fadeIn(1e3),editor.focus(),$.ajax({type:"POST",url:"savefile.php",data:$(this).serialize(),success:function(n){$("#alerts").hide().remove();$("body").append('<div id="alerts" class="green">'+n+"<\/div>");$("#alerts").fadeIn(2e3).fadeOut(2e3,function(){$("#alerts").remove()})}}),$("#alerts").hide().remove(),!1});$(window).bind("beforeunload",function(){if($("#ab-btn-save-editfile").hasClass("red"))return"You have some unsaved changes"});$preloader=document.getElementById("page-preloader");$spinner=document.getElementById("spinner");$spinner.className+=" hidden";$preloader.className+=" hidden"
	</script>
	</div>
</div>

</body>
</html>