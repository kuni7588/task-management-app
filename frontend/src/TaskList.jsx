// ⑬：Appから受け取ったタスク一覧を表示する。
// API通信とログイン状態の管理はApp側で行う。
// タスクが0件の場合は、未登録のメッセージを表示する。
// 編集・削除ボタンは、Appから渡された処理を呼び出す。
function TaskList({ tasks = [], onEdit, onDelete, deletingTaskId = null }) {
  return (
    <main className="task-container">
      <h1>タスク一覧</h1>

      {tasks.length === 0 ? (
        <p>タスクはまだ登録されていません。</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.taskId} className="task-card">
              <h2>{task.title}</h2>
              <p>状態：{task.status}</p>
              {task.description && <p>{task.description}</p>}
              {onEdit && (
                <button
                  type="button"
                  className="task-edit-button"
                  disabled={deletingTaskId !== null}
                  onClick={() => onEdit(task)}
                >
                  編集
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="task-delete-button"
                  disabled={deletingTaskId !== null}
                  onClick={() => onDelete(task)}
                >
                  {deletingTaskId === task.taskId ? "削除中…" : "削除"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default TaskList;
