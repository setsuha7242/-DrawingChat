## 起動方法
コンパイル

`javac -d WebContent/WEB-INF/classes/ -cp "lib/*" src/project/oekakinoumi/*.java`

Javaの実行

`java -cp "lib/*:bin" server.AppServer 8080 /Code WebContent
`

Warファイルの実行
`java -cp "lib/*:bin" server.WarServer 8080 /Code webapp/B08.war
`

URL

`http://localhost:8080/Code/project/oekakinoumi/index.html`
