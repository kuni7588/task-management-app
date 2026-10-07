package com.example.taskmanagementbackend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// テストでは、開発用のファイルDBではなくメモリ上のH2を使用する。
// テーブルはEntityから自動作成し、テスト終了時に削除する。
// schema.sqlによる初期化は実行しない。
@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:task_management_test",
		"spring.jpa.hibernate.ddl-auto=create-drop",
		"spring.sql.init.mode=never"
})
class TaskManagementBackendApplicationTests {

	@Test
	void contextLoads() {
		// Spring Bootの構成全体が正常に読み込まれることを確認する。
	}
}