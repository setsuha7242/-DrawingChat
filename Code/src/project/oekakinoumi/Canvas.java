package project.oekakinoumi;
//11/27更新　仮完成
import java.util.ArrayList;
import java.util.List;

public class Canvas {

  private int clearPoint = 0;

  private List<DrawComponent> drawComponentList = new ArrayList<DrawComponent>();

	public List<DrawComponent> getDrawComponentList(int header, int endpoint) {
		return drawComponentList.subList(Math.max(header,clearPoint), endpoint);
	}

  public int getListSize(){
    return drawComponentList.size();
  }

	public void addDrawComponent(DrawComponent drawComponent) {
		drawComponentList.add(drawComponent);
	}

  public void removeCanvas(){
    DrawComponent dc = new DrawComponent();
    dc.setDrawData("remove");
    addDrawComponent(dc);
    clearPoint = drawComponentList.size();
  }
}
