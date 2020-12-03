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

function update(){
  var url = "update"
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
  xhr.onreadystatechange=function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      console.log(xhr.responseText);
      var json = JSON.parse(xhr.responseText || "null");
      if(json!="null"){
        //Chat受信
        var chat = "";
        for(var statement of json.statementList){
          var text ="";
          var name = statement.user.name;
          if(name == ""){
            text = statement.message;
          }else{
            text = statement.user.name+":"+statement.message;
          }
          chat += text+"<br>";
        }
        document.getElementById("statement").innerHTML=chat; document.getElementById("statement").scrollIntoView(false);

        //Canvas受信


      }
    }
  }
  setTimeout(update, 10);
}
update();






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
  var url = "end"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}
