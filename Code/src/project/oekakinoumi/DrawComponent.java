package project.oekakinoumi;

import java.util.ArrayList;
import java.util.List;

//キャンパス描画の要素を表すクラス
public class DrawComponent {
  //ツールの種類
  private String toolType;
  //筆のサイズ
  private int size;
  //色
  private String color;
  //レイヤー番号
  private int layer;
  //描画する軌跡のリスト
  private List<int[]> pointList = new ArrayList<>();

  /*
  * toolTypeのセッター
  */
  public void setToolType(String toolType){
    this.toolType= toolType;
  }

  /*
  * sizeのセッター
  */
  public void setSize(int size){
    this.size= size;
  }

  /*
  * colorのセッター
  */
  public void setColor(String color){
    this.color= color;
  }

  /*
  * layerのセッター
  */
  public void setLayer(int layer){
    this.layer= layer;
  }

  /*
  * pointListに引数x,yの配列を加える
  */
  public void addPointList(int x, int y){
    int[] point = {x,y};
    pointList.add(point);
  }

  /*
  * toolTypeのゲッター
  */
  public String getToolType(){
    return toolType;
  }

  /*
  * sizeのゲッター
  */
  public int getSize(){
    return size;
  }

  /*
  * colorのゲッター
  */
  public String getColor(){
    return color;
  }

  /*
  * layerのゲッター
  */
  public int getLayer(){
    return layer;
  }

  /*
  * pointListのゲッター
  */
  public List getPointList(){
    return pointList;
  }
}
