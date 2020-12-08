package project.oekakinoumi;
/*
* チャットの要素を表すクラス
*/
public class Statement {
	//メッセージの送信者
	private User user;
	//メッセージの内容
	private String message;

	/*
	* userのセッター
	*/
	public void setUser(User user) {
		this.user = user;
	}

	/*
	* messageのセッター
	*/
	public void setMessage(String message) {
		this.message = message;
	}

	/*
	* userのゲッター
	*/
	public User getUser() {
		return this.user;
	}

	/*
	* messageのゲッター
	*/
	public String getMessage() {
		return this.message;
	}

}
