package project.oekakinoumi;

import java.util.ArrayList;
import java.util.List;
/*
* ユーザーを管理するクラス
*/
public class UserManager {
  //ユーザーのリスト
  private List<User> userList = new ArrayList<User>();

  /*
  * 引数のnameと一致するnameを持つUserを返す
  * ないならnullを返す
  */
  public User getUserByName(String name) {
		for(User user: userList) {
			if(user.getName().equals(name)) {
				return user;
			}
		}
		return null;
	}

  /*
  * リストにUserを追加する
  */
  public void addUser(User user) {
		userList.add(user);
	}

  /*
  * Userをリストから削除する
  */
  public void removeUser(User user){
    userList.remove(userList.indexOf(user));
  }

}
