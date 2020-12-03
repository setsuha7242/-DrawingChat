package project.oekakinoumi;
//11/27更新　仮完成
import java.util.ArrayList;
import java.util.List;

public class UserManager {

  private List<User> userList = new ArrayList<User>();

  public User getUserByName(String name) {
		for(User user: userList) {
			if(user.getName().equals(name)) {
				return user;
			}
		}
		return null;
	}

  public void addUser(User user) {
		userList.add(user);
	}

  public void removeUser(User user){
    userList.remove(userList.indexOf(user));
  }

}
