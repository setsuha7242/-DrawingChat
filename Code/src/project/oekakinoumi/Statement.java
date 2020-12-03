package project.oekakinoumi;
//11/27更新　仮完成
public class Statement {

	private User user;

	private String message;

	public void setUser(User user) {
		this.user = user;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public User getUser() {
		return this.user;
	}

	public String getMessage() {
		return this.message;
	}

}
