package project.oekakinoumi;
//11/27更新　仮完成
import java.util.ArrayList;
import java.util.List;

public class Chat {

	private List<Statement> statementList = new ArrayList<Statement>();

	public List<Statement> getStatementList() {
		return statementList;
	}

	public void addStatement(Statement statement) {
		statementList.add(statement);
		System.out.println(statement.getUser().getName()+":"+statement.getMessage());
	}

}
