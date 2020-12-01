//テキスト送信
document.getElementById("send").onclick=function(){
  var url = "sendchat"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  var text = document.getElementById("textbox").value;
  console.log(text);
  if(text!=""){
    xhr.send("message="+text);
    document.getElementById("textbox").value="";
  }
};




//起動時
window.onload = function(){
  console.log("debug");
  var url = "checksession"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
  xhr.onreadystatechange=function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      console.log(xhr.responseText);
      var json = JSON.parse(xhr.responseText);
      if(json.result == "false")
        location.href=json.message;
    }
  }
}

//サイトから離れる時
window.onbeforeunload = function(e){
  e.returnValue = "ページを離れようとしています。よろしいですか？";
  var url = "end"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}
