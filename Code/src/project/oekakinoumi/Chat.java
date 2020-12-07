package project.oekakinoumi;

import java.util.ArrayList;
import java.util.List;

//チャットを表すクラス
public class Chat {
  //チャットの履歴を保持するリスト
	private List<Statement> statementList = new ArrayList<Statement>();
	/*
	* リストのゲッター
	*/
	public List<Statement> getStatementList() {
		return statementList;
	}

	/*
  * リストに引数のStatementを加える
  */
	public void addStatement(Statement statement) {
		statementList.add(statement);
		System.out.println(statement.getUser().getName()+":"+statement.getMessage());
	}

}
