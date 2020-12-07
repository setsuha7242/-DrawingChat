package project.oekakinoumi;
//11/28更新　仮完成
import java.io.IOException;
import java.io.BufferedReader;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.google.gson.Gson;

@WebServlet("/project/oekakinoumi/senddraw")
public class SendDrawServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;

	@Override
	public void init() throws ServletException {
    ServletContext context = this.getServletContext();
		Chat chat = (Chat) context.getAttribute("chat");
		Canvas canvas = (Canvas) context.getAttribute("canvas");
		UserManager userManager = (UserManager) context.getAttribute("usermanager");
		if (chat == null) {
			chat = new Chat();
			context.setAttribute("chat", chat);
		}
		if (canvas == null){
			canvas = new Canvas();
			context.setAttribute("canvas", canvas);
		}
		if (userManager == null){
			userManager = new UserManager();
			context.setAttribute("usermanager", userManager);
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

		request.setCharacterEncoding("UTF-8");
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute("user");
		if (user != null) {

			ServletContext context = this.getServletContext();
			Canvas canvas = (Canvas) context.getAttribute("canvas");
			DrawComponent dc = new DrawComponent();
			dc.setToolType(request.getParameter("toolType"));
			dc.setSize(Integer.parseInt(request.getParameter("size")));
			dc.setColor(request.getParameter("color"));
			dc.setLayer(Integer.parseInt(request.getParameter("layer")));
			String[] pointArray= request.getParameter("pointList").split(",");
			for(int i = 0; i<pointArray.length; i+=2){
				dc.addPointList(Integer.parseInt(pointArray[i]),Integer.parseInt(pointArray[i+1]));
			}
			//dc.setDrawData(message);
			canvas.addDrawComponent(dc);
		}

	}

}
