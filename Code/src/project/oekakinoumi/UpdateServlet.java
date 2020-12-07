package project.oekakinoumi;
//11/28更新　仮完成
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Iterator;

import com.google.gson.Gson;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/project/oekakinoumi/update")
public class UpdateServlet extends HttpServlet {

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

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		Gson gson = new Gson();
		HttpSession session = request.getSession();
		User user = (User) session.getAttribute("user");
		if (user != null) {
			Integer ch = (Integer) session.getAttribute("canvasHeader");
			int canvasHeader = 0;
			if(ch != null)
				canvasHeader = ch.intValue();

			ServletContext context = this.getServletContext();
			Chat chat = (Chat)context.getAttribute("chat");
			Canvas canvas = (Canvas)context.getAttribute("canvas");
			StringBuilder builder = new StringBuilder();

			builder.append("{");
			builder.append("\"user\":");
			builder.append(gson.toJson(user));
			builder.append(",");

			builder.append("\"statementList\":");
			builder.append(gson.toJson(chat.getStatementList()));
			builder.append(",");

			builder.append("\"drawComponentList\":");
			int nextHeader = canvas.getListSize();
			builder.append(gson.toJson(canvas.getDrawComponentList(canvasHeader,nextHeader)));
			session.setAttribute("canvasHeader", new Integer(nextHeader));
			builder.append("}");


			String json = builder.toString();
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			PrintWriter writer = response.getWriter();
			writer.append(json);
			writer.flush();
		}
	}


}
