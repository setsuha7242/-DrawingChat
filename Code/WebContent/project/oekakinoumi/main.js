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
window.onunload = function(e){
  var url = "end"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}

//以下描画処理
//描画する線を通る点
var pointArray = new Array();
//canvasの取得
var canvasArray = new Array();
//各canvasのcontext
var mixedCanvas = document.getElementById('canvasmix');
var mixedCtx = mixedCanvas.getContext("2d");
var ownCanvas = document.getElementById('canvasown');
var ownCtx = ownCanvas.getContext("2d");
var ctxArray = new Array();
canvasArray.push(document.getElementById('canvas1'));
canvasArray.push(document.getElementById('canvas2'));
canvasArray.forEach(element => ctxArray.push(element.getContext("2d")));
//レイヤー番号(1 or 2)
var layer = 1;
//初期値（サイズ、色、アルファ値）の決定
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
//描いているかどうか
var isDraw = false;
//handでの前のマウスカーソルを格納する
var drugX =0;
var drugY=0;

// event.offsetX, event.offsetY はキャンバスの縁からのオフセットの (x,y) です。

// mousedown, mousemove, mouseup にイベントリスナーを追加
ownCanvas.addEventListener('mousemove', onMove, false);

ownCanvas.addEventListener('mousedown', onClick, false);

ownCanvas.addEventListener('mouseup', drawEnd, false);

ownCanvas.addEventListener('mouseout', drawEnd, false);

function onMove(e){
  if (e.buttons === 1 || e.witch === 1) {
    isDraw = true;
    if(toolType == "pen" || toolType == "eraser"){
      let x = e.offsetX;
      let y = e.offsetY;
      pointArray.push([x,y]);
      drawView(toolType);
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
function onClick(e){
  console.log(toolType);
  if(e.button === 0){
    if(toolType == "pen" || toolType == "eraser"){
      let x = e.offsetX;
      let y = e.offsetY;
      pointArray.push([x,y]);
      drawView(toolType);
      console.log(pointArray);
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

function drawEnd(e){
  if(pointArray.length != 0){
    if(toolType == "pen" || toolType == "eraser"){
      //Jsonデータの作成
      let sendData = {
        isEraser : (toolType == "eraser"),
        size : size,
        color : color,
        layer : layer,
        pointList : pointArray
      }
      let sendDataJson = JSON.stringify(sendData);
      //console.log(sendDataJson);

      //POST
      /*
      var url = "senddraw"
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.setRequestHeader( 'Content-Type', 'application/json');
      xhr.send(sendDataJson);
      */
      isDraw = false;
      draw(toolType == "eraser", size, color, layer, pointArray);
      pointArray = new Array();
        //clearCanvas(ownCanvas, ownCtx)
    }
    else if(toolType="hand"){
      drugX=0;
      drugY=0;
    }
  }
}



function drawView(){
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
//ここまで、描画処理

//hand処理
function drugCanvas(x1, y1 , x2, y2){
  var currentX = document.getElementById("canvases").style.left;
  var numX = Number(String(currentX).replace("px", ""));
  var currentY = document.getElementById("canvases").style.top;
  var numY = Number(String(currentY).replace("px", ""));
  document.getElementById("canvases").style.left = String(x2 - x1 + numX) +"px";
  document.getElementById("canvases").style.top = String(y2 -y1 + numY) + "px";
}

//colorPicker
var colorWell;
window.addEventListener("load", startup, false);
function startup() {
  colorWell = document.querySelector("#color");
  colorWell.value = color;
  colorWell.addEventListener("input", updateFirst, false);
  colorWell.select();
}
function updateFirst(event) {
  color = event.target.value;
}

//ペンサイズ変更
document.getElementById("size1").onclick=function(){
  size = SIZE_1;
}

document.getElementById("size2").onclick=function(){
  size = SIZE_2;
}

document.getElementById("size3").onclick=function(){
  size = SIZE_3;
}

document.getElementById("size4").onclick=function(){
  size = SIZE_4;
}

document.getElementById("size5").onclick=function(){
  size = SIZE_5;
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
  for(var i=0; i< layer; i++){
    var imagedata = ctxArray[layer -1 - i].getImageData(x, y, 1, 1);
    // RGBAの取得。
    r = imagedata.data[0];
    g = imagedata.data[1];
    b = imagedata.data[2];
    a = imagedata.data[3];
    if(r != 0 || g!= 0 || b != 0){
      break;
    }
  }
  color =  rgb2hex([r,g,b]);
  colorWell.value = color; //colorPickerに色を設定
}
//rgb to hex
function rgb2hex ( rgb ) {
	return "#" + rgb.map( function ( value ) {
		return ( "0" + value.toString( 16 ) ).slice( -2 ) ;
	} ).join( "" ) ;
}

document.getElementById("pen").onclick=function(){
  //ctxArray[1].globalCompositeOperation = "source-over";
  toolType= "pen";
}

document.getElementById("eraser").onclick=function(){
  //ctxArray[1].globalCompositeOperation = "destination-out";
  toolType = "eraser";
}

document.getElementById("spoit").onclick=function(){
  toolType = "spoit";
}

document.getElementById("hand").onclick=function(){
  toolType = "hand";
}

document.getElementById("layer1").onclick=function(){
  layer = 1;
  document.getElementById("layer2").style.visibility = "hidden";
}
document.getElementById("layer2").onclick=function(){
  layer = 2;
  document.getElementById("layer2").style.visibility = "visible";
}

document.getElementById("clear").onclick=function(){
  for(var i =0; i < canvasArray.length; i++){
    clearCanvas(canvasArray[i], ctxArray[i]);
  }
  var url = "resetcanvas"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}

//canvasの初期化
function clearCanvas(canvas, ctx){
  ctx.clearRect(0, 0, canvas.height, canvas.width);
}
//画像のダウンロード
document.getElementById("save").onclick=function(){
  concatCanvas();
  //console.log(mixedCanvas.toDataURL());
  var img = mixedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href = img;
  console.log(img);
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
    const ctx = ctxArray[id];
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
    image.src = canvasArray[id].toDataURL();
  });
}

//serverから受け取ったデータを描画する
function draw(isEraser, ssize, scolor, slayer, spointArray){
  console.log(spointArray);
  console.log(slayer);
  var canvas = canvasArray[slayer -1];
  var ctx = ctxArray[slayer -1];
  ctx.lineCap = 'round';
  ctx.lineWidth = ssize;
  if(!isEraser){
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
    ctx.moveTo(spointArray[0][0], spointArray[0][1]);
    ctx.lineTo(spointArray[0][0], spointArray[0][1]);
    ctx.stroke();
    ctx.closePath();
  }
  else {
    for(i=0; i< spointArray.length -1; i++){
      ctx.beginPath();
      ctx.moveTo(pointArray[i][0], pointArray[i][1]);
      ctx.lineTo(pointArray[i+1][0], pointArray[i+1][1]);
      ctx.stroke();
      ctx.closePath();
    }
  }
  if(!isDraw){
    clearCanvas(ownCanvas, ownCtx);
  }
}
