//描画する線を通る点の配列
var pointArray = new Array();
//layer1とlayer2のcanvasの配列
var canvasArray = new Array();
//layer1とlayer2を合成して一つのcanvasにする為のcanvas
var mixedCanvas = document.getElementById('canvasmix');
var mixedCtx = mixedCanvas.getContext("2d");
//自分の描いた線を一時的に表示させる為のcanvas
var ownCanvas = document.getElementById('canvasown');
var ownCtx = ownCanvas.getContext("2d");
//layer1とlayer2のcanvasのcontextをもつ配列
var ctxArray = new Array();
//レイヤー番号(1 or 2)
var layer = 1;
//ペンサイズ(5種類)の定義
const SIZE_1 =2;
const SIZE_2 =4;
const SIZE_3 =6;
const SIZE_4 =8;
const SIZE_5 =10;
//ツールのタイプ
var toolType = "pen";
//ペンのサイズ
var size = SIZE_1;
//ペンのカラー
var color = "#555555";
//ペンの透明度
var alpha = 1.0;
//自分が描いているかどうか
var isDraw = false;
//handでの前のマウスカーソルを格納する
var drugX =0;
var drugY=0;
//カラーピッカーのイベントをもつ
var colorWell;

window.addEventListener("load", function(){
  checkSession();
  canvasArray.push(document.getElementById('canvas1'));
  canvasArray.push(document.getElementById('canvas2'));
  canvasArray.forEach(element => ctxArray.push(element.getContext("2d")));
  colorWell = document.querySelector("#color");
  colorWell.value = color;
  colorWell.addEventListener("input", changeColor, false);
  colorWell.select();
  document.getElementById("send").addEventListener("click",sendChatRequest ,false);
  ownCanvas.addEventListener('mousedown', onClick, false);
  ownCanvas.addEventListener('mousemove', onMove, false);
  ownCanvas.addEventListener('mouseup', drawEnd, false);
  ownCanvas.addEventListener('mouseout', drawEnd, false);
  document.querySelectorAll(".size").forEach(target => target.addEventListener('click', changeSize, false));
  document.querySelectorAll(".toolbutton").forEach(target => target.addEventListener('click', changeTool, false));
  document.querySelectorAll(".layerbutton").forEach(target => target.addEventListener('click', changeLayer, false));
  document.getElementById("clear").addEventListener("click", clearAllCanvas,false);
  document.getElementById("save").addEventListener("click",saveImg,false);
  window.addEventListener("unload", end, false);
  sendUpdateRequest();
}, false);

/*
* main.htmlから離れた際にユーザーの退出をサーバーに知らせる
*/
function end(){
  var url = "end"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}

/*
* sendボタンが押された際に、チャットボックスに入力した文字列をサーバーに送る
*/
function sendChatRequest(){
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
}

/*
* サーバーにデータを送るようにリクエストする
*/
function sendUpdateRequest(){
  var url = "update"
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4 && xhr.status === 200){
      console.log(xhr.responseText);
      reciveUpdateRequest(xhr);
    }
  }
  setTimeout(sendUpdateRequest, 10);
}

/*
* サーバーから受け取ったデータを自分の画面に反映させる
*/
function reciveUpdateRequest(xhr){
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
    document.getElementById("statement").innerHTML=chat;
    document.getElementById("statement").scrollIntoView(false);

    //Canvas受信
    for(var drawComponent of json.drawComponentList){
      var toolType = String(drawComponent.toolType);
      if(toolType == "clear"){
        for(var i =0; i < canvasArray.length; i++){
          clearCanvas(canvasArray[i], ctxArray[i]);
        }
      }
      else {
        var sSize = parseInt(drawComponent.size);
        var sColor = "#" + String(drawComponent.color);
        var sLayer = parseInt(drawComponent.layer);
        var sPointArray = drawComponent.pointList;

        draw(toolType, sSize, sColor, sLayer, sPointArray);
      }
    }
  }
}
/*
* main.htmlが読み込まれた際、index.htmlでユーザー名を入力して
* main.htmlに遷移していなかった場合、index.htmlに遷移させる
*/
function checkSession(){
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

/*
* マウスの左ボタンが押されてない場合、
* tooltyeがペンか消しゴムならpointArrayにcanvasの縁からのマウスの座標を
* 追加して、drawOwnCanvas関数を実行する。
* tooltypeが手である場合、画面の縁からのマウスの座標をとって、drugXとdrugYに
* 値を入れる
*/
function onClick(e){
  isDraw = true;
  if(e.button === 0){
    if(toolType == "pen" || toolType == "eraser"){
      let x = e.offsetX;
      let y = e.offsetY;
      pointArray.push([x,y]);
      drawOwnCanvas();
    }
    else if(toolType == "spoit"){
      colorDropper(e.offsetX, e.offsetY);
    }
    else if(toolType == "hand"){
      drugX = e.screenX;
      drugY = e.screenY;
    }
  }
}

/*
* 左クリックがされていて、マウスが動いている場合、
* tooltyeがペンか消しゴムならpointArrayにcanvasの縁からのマウスの座標を
* 追加して、drawOwnCanvas関数を実行する。
* tooltypeが手である場合、画面の縁からのマウスの座標をとってdrugCanvas関数を
* 実行する
*/
function onMove(e){
  if (e.buttons === 1 || e.witch === 1) {
    if(toolType == "pen" || toolType == "eraser"){
      let x = e.offsetX;
      let y = e.offsetY;
      pointArray.push([x,y]);
      drawOwnCanvas();
    }
    else if(toolType == "hand"){
      let x = e.screenX;
      let y = e.screenY;
      drugCanvas(drugX, drugY, x, y);
      drugX = x;
      drugY = y;
    }
  }
}

/*
* サーバーに、描画する線に必要なデータを送り、pointArrayの初期化を行う
*/
function drawEnd(e){
  if(pointArray.length != 0){
    if(toolType == "pen" || toolType == "eraser"){
      //POST
      sendDrawRequest();
      isDraw = false;
      pointArray = new Array();
    }
    else if(toolType="hand"){
      drugX=0;
      drugY=0;
    }
  }
}
/*
* サーバーに線のデータを送る関数
*/
function sendDrawRequest(){
  var url = "senddraw"
  var sendData = "?toolType="+String(toolType)+"&size="+String(size)+"&color="+String(color).replace("#","")+"&layer="+String(layer)+"&pointList="+String(pointArray);
  console.log(sendData);
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url + sendData);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send(sendData);
}


/*
* 自分の描いている線を一時的にownCanvasに描画する
*/
function drawOwnCanvas(){
  ownCtx.beginPath();
  ownCtx.lineCap = 'round';
  ownCtx.lineWidth = size;
  if(toolType == "pen"){
    ownCtx.globalAlpha = alpha;
    ownCtx.strokeStyle = color;
  }
  else {
    ownCtx.globalAlpha = 0.6;
    ownCtx.strokeStyle = "#c0c0c0";
  }
  if(pointArray.length == 1){
    ownCtx.moveTo(pointArray[0][0], pointArray[0][1]);
    ownCtx.lineTo(pointArray[0][0], pointArray[0][1]);
  }
  else {
    ownCtx.moveTo(pointArray[pointArray.length -2][0], pointArray[pointArray.length -2][1]);
    ownCtx.lineTo(pointArray[pointArray.length -1][0], pointArray[pointArray.length -1][1]);
  }
  ownCtx.stroke();
  ownCtx.closePath();
}

/*
* hand処理
* キャンバスの位置を変更する
* x1: 前のマウスの位置のx座標
* y1: 前のマウスの位置のy座標
* x2: 今のマウスの位置のx座標
* y2: 今のマウスの位置のy座標
*/
function drugCanvas(x1, y1 , x2, y2){
  var currentX = document.getElementById("canvases").style.left;
  var numX = Number(String(currentX).replace("px", ""));
  var currentY = document.getElementById("canvases").style.top;
  var numY = Number(String(currentY).replace("px", ""));
  document.getElementById("canvases").style.left = String(x2 - x1 + numX) +"px";
  document.getElementById("canvases").style.top = String(y2 -y1 + numY) + "px";
}

/*
* colorPickerによって色の変更があった際にcolorに変更された色を設定する
*/
function changeColor(event) {
  color = event.target.value;
}

/*
* ペンのサイズを変更する
*/
function changeSize(e){
  console.log(e.target.value);
  switch(parseInt(e.target.value)){
    case 1:
      size = SIZE_1;
      break;
    case 2:
      size = SIZE_2;
      break;
    case 3:
      size = SIZE_3;
      break;
    case 4:
      size = SIZE_4;
      break;
    default:
    size = SIZE_5;
  }
}

/*スポイト機能
* x: x座標
* y: y座標
*/
function colorDropper(x, y){
  // 指定座標から幅1,高さ1のImageDataオブジェクトの取得。
  var r;
  var g;
  var b;
  var a;
  for(var i=0; i< ctxArray.length; i++){
    var imagedata = ctxArray[ctxArray.length -1 - i].getImageData(x, y, 1, 1);
    // RGBAの取得。
    r = imagedata.data[0];
    g = imagedata.data[1];
    b = imagedata.data[2];
    a = imagedata.data[3];
    if(r != 0 || g!= 0 || b != 0){
      break;
    }
  }
  color =  rgbTohex([r,g,b]);
  colorWell.value = color; //colorPickerに色を設定
}
//rgb to hex
function rgbTohex ( rgb ) {
	return "#" + rgb.map( function ( value ) {
		return ( "0" + value.toString( 16 ) ).slice( -2 ) ;
	} ).join( "" ) ;
}

/*
* 使用ツールを変更する
*/
function changeTool(e){
  console.log(e.target.value);
  toolType = String(e.target.value);
}

/*
*描き込むレイヤーを変更する
* e: event
*/
function changeLayer(e){
  console.log(e.target.value);
  layer = parseInt(e.target.value);
}

/*
* キャンバスに描画された線を全て消す
*/
function clearAllCanvas(){
  for(var i =0; i < canvasArray.length; i++){
    clearCanvas(canvasArray[i], ctxArray[i]);
  }
  var url = "resetcanvas"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}

//canvas上の線を削除
function clearCanvas(canvas, ctx){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/*
* キャンバスを画像としてエクスポートする
*/
async function saveImg(){
  mixedCtx.fillStyle = "#ffffff";
  mixedCtx.fillRect(0, 0, mixedCanvas.width, mixedCanvas.height);
  await concatCanvas();
  var img = mixedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  const a = document.createElement('a');
  a.href = img;
  a.download = "oekakinoumi-" + new Date().getTime() +".png";
  a.style.display ="none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  clearCanvas(mixedCanvas, mixedCtx);
}
//Canvas合成
async function concatCanvas(){
  for(let i=0; i<canvasArray.length; i++){
    const image = await getImagefromCanvas(i);
    mixedCtx.drawImage(image, 0, 0, canvasArray[i].width, canvasArray[i].height);
  }
}
// Canvasを画像として取得
function getImagefromCanvas(id){
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>{
      resolve(image);
    }
    image.onerror = (e) => reject(e);
    image.src = canvasArray[id].toDataURL();
  });
}

/*
* キャンバスから受け取った線のデータを反映させる
*/
function draw(toolType, ssize, scolor, slayer, spointArray){
  var canvas = canvasArray[slayer -1];
  var ctx = ctxArray[slayer -1];
  ctx.lineCap = 'round';
  ctx.lineWidth = ssize;
  if(toolType == "pen"){
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = scolor;
    ctx.globalCompositeOperation = "source-over";
  }
  else {
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "#c0c0c0";
    ctx.globalCompositeOperation = "destination-out";
  }
  if(spointArray.length == 1){
    ctx.beginPath();
    ctx.moveTo(parseInt(spointArray[0][0]), parseInt(spointArray[0][1]));
    ctx.lineTo(parseInt(spointArray[0][0]), parseInt(spointArray[0][1]));
    ctx.stroke();
    ctx.closePath();
  }
  else {
    for(i=0; i< spointArray.length -1; i++){
      ctx.beginPath();
      ctx.moveTo(parseInt(spointArray[i][0]), parseInt(spointArray[i][1]));
      ctx.lineTo(parseInt(spointArray[i+1][0]), parseInt(spointArray[i+1][1]));
      ctx.stroke();
      ctx.closePath();
    }
  }
  if(!isDraw){
    clearCanvas(ownCanvas, ownCtx);
  }
}
