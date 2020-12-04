/*
* sendボタンが押された際に、チャットボックスに入力した文字列をサーバーに送る
*/
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

/*
* サーバーからチャットのログとキャンバスに描かれた線のログを取得し、
* 自分の画面に反映させる
*/
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
  }
  setTimeout(update, 10);
}
update();


/*
* main.htmlが読み込まれた際、index.htmlでユーザー名を入力して
* main.htmlに遷移していなかった場合、index.htmlに遷移させる
*/
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

/*
* main.htmlから離れた際にユーザーの退出をサーバーに知らせる
*/
window.onunload = function(e){
  var url = "end"
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
  xhr.send();
}


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
canvasArray.push(document.getElementById('canvas1'));
canvasArray.push(document.getElementById('canvas2'));
canvasArray.forEach(element => ctxArray.push(element.getContext("2d")));
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


//マウスが動いている際にonMove関数を実行する
ownCanvas.addEventListener('mousemove', onMove, false);
/*
* 左クリックがされていて、マウスが動いている場合、
* tooltyeがペンか消しゴムならpointArrayにcanvasの縁からのマウスの座標を
* 追加して、drawView関数を実行する。
* tooltypeが手である場合、画面の縁からのマウスの座標をとってdrugCanvas関数を
* 実行する
*/
function onMove(e){
  if (e.buttons === 1 || e.witch === 1) {
    if(toolType == "pen" || toolType == "eraser"){
      let x = e.offsetX;
      let y = e.offsetY;
      pointArray.push([x,y]);
      drawView();
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

//マウスがクリックされた際にonClick関数を実行する
ownCanvas.addEventListener('mousedown', onClick, false);
/*
* マウスの左ボタンが押されてない場合、
* tooltyeがペンか消しゴムならpointArrayにcanvasの縁からのマウスの座標を
* 追加して、drawView関数を実行する。
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
      drawView();
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

//マウスのボタンから指が離れた際にdrawEnd関数を実行する
ownCanvas.addEventListener('mouseup', drawEnd, false);

//マウスがcanvasから離れた際にdrawEnd関数を実行する
ownCanvas.addEventListener('mouseout', drawEnd, false);

/*
* サーバーに、描画する線に必要なデータを送る。
*/
function drawEnd(e){
  if(pointArray.length != 0){
    if(toolType == "pen" || toolType == "eraser"){
      //POST
      var url = "senddraw"
      var sendData = "?toolType="+String(toolType)+"&size="+String(size)+"&color="+String(color).replace("#","")+"&layer="+String(layer)+"&pointList="+String(pointArray);
      console.log(sendData);
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url + sendData);
      xhr.setRequestHeader('content-type','application/x-www-form-urlencoded;charset=UTF-8');
      xhr.send(sendData);

      isDraw = false;
      pointArray = new Array();
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
document.getElementById("save").onclick= async function(){
  mixedCtx.fillStyle = "#ffffff";
  mixedCtx.fillRect(0, 0, mixedCanvas.width, mixedCanvas.height);
  await concatCanvas();
  //console.log(mixedCanvas.toDataURL());
  var img = mixedCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  const a = document.createElement('a');
  a.href = img;
  a.download = "oekakinoumi-" + new Date().getTime() +".png";
  a.style.display ="none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  //window.location.href = img;
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

//serverから受け取ったデータを描画する
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
