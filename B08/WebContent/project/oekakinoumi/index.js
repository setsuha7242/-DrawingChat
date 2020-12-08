document.getElementById("start").onclick=function(){
  var url = "start"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  console.log(document.getElementById("name").value);
  if(document.getElementById("name").value==""){
    document.getElementById("notice").innerHTML="1文字以上入力してください";
  }
  else{
    xhr.send("name="+document.getElementById("name").value);

    xhr.onreadystatechange=function(){
      if(xhr.readyState === 4 && xhr.status === 200){
        console.log(xhr.responseText);
        var json = JSON.parse(xhr.responseText);
        if(json.result == "true")
          location.href=json.message;
        else
          document.getElementById("notice").innerHTML=json.message+"は既に使用されています";
      }
    }
  }
};
