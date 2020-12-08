package project.oekakinoumi;

import java.util.ArrayList;
import java.util.List;
/*
* キャンパスを表すクラス
*/
public class Canvas {
  //Clearが実行されたindexを保持する
  private int clearPoint = 0;
  //キャンパスの履歴を保持するリスト
  private List<DrawComponent> drawComponentList = new ArrayList<DrawComponent>();
  /*
  * キャンパスの差分のゲッター
  * headerからendpointまでのリストを返す
  */
	public List<DrawComponent> getDrawComponentList(int header, int endpoint) {
		return drawComponentList.subList(Math.max(header,clearPoint), endpoint);
	}

  /*
  * リストのサイズのゲッター
  */
  public int getListSize(){
    return drawComponentList.size();
  }

  /*
  * リストに引数のDrawComponentを加える
  */
	public void addDrawComponent(DrawComponent drawComponent) {
		drawComponentList.add(drawComponent);
	}

  /*
  * キャンパスがクリアされた時の動作
  * clearPointにリストのサイズを入れる
  */
  public void removeCanvas(){
    DrawComponent dc = new DrawComponent();
    dc.setToolType("clear");
    clearPoint = drawComponentList.size();
    addDrawComponent(dc);

  }
}
