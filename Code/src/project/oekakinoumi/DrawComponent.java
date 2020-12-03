package project.oekakinoumi;
//12/04更新　仮完成

import java.util.ArrayList;
import java.util.List;
public class DrawComponent {
  private String toolType;
  private int size;
  private String color;
  private int layer;
  private List<int[]> pointList = new ArrayList<>();

  public void setToolType(String toolType){
    this.toolType= toolType;
  }

  public void setSize(int size){
    this.size= size;
  }

  public void setColor(String color){
    this.color= color;
  }

  public void setLayer(int layer){
    this.layer= layer;
  }

  public void addPointList(int x, int y){
    int[] point = {x,y};
    pointList.add(point);
  }


  public String getToolType(){
    return toolType;
  }

  public int getSize(){
    return size;
  }

  public String getColor(){
    return color;
  }

  public int getLayer(){
    return layer;
  }

  public List getPointList(){
    return pointList;
  }
}
