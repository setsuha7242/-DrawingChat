package project.oekakinoumi;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/project/oekakinoumi/start")
public class StartServlet extends HttpServlet {

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
		String name = request.getParameter("name");
		ServletContext context = this.getServletContext();
		UserManager userManager = (UserManager) context.getAttribute("usermanager");
		User user = userManager.getUserByName(name);
		Chat chat = (Chat) context.getAttribute("chat");
		response.setContentType("application/json");
		//ユーザーを保持しているなら
		if (user == null) {
			user = new User();
			user.setName(name);
			userManager.addUser(user);
			session.setAttribute("user", user);
			response.getWriter().print("{\"result\":\"true\",\"message\":\"main.html\"}");
			Statement statement = new Statement();

			User sys = new User();
			sys.setName("");
			statement.setUser(sys);
			statement.setMessage(user.getName()+"さんが入室しました");
			chat.addStatement(statement);

		}else{
    	response.getWriter().print("{\"result\":\"false\",\"message\":\""+name+"\"}");
		}
		response.getWriter().flush();

	}

}
