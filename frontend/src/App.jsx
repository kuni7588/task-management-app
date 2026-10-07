import { useEffect, useState } from "react";
import "./App.css";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { fetchTasks, createTask, updateTask, deleteTask } from "./taskApi";
import { login, fetchCurrentUser, logout } from "./authApi";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  // ⑫：ログイン中のユーザーと、認証の通信状態。
  const [currentUser, setCurrentUser] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  // ⑫：画面を開いたときのログイン状態の確認中かどうか。
  const [authChecking, setAuthChecking] = useState(true);
  // ⑫：ログアウトの通信状態とエラーメッセージ。
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  // 表示するタスク画面を管理する（一覧・登録・編集）。
  const [previewScreen, setPreviewScreen] = useState("list");
  // 一覧で選択した編集対象のタスク。
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  // ⑪：APIから取得した一覧と、通信状態を管理する。
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");

  // ⑫：再読み込み時に、サーバーのログイン状態を確認する。
  // ログイン済みならユーザー情報を復元する。
  // 未ログインなら、ログイン画面を表示する。
  useEffect(() => {
    let active = true;

    async function restoreLogin() {
      try {
        const user = await fetchCurrentUser();

        if (active) {
          setCurrentUser(user);
        }
      } catch (error) {
        if (active) {
          setLoginError(
            error instanceof Error
              ? error.message
              : "ログイン状態を確認できませんでした。",
          );
        }
      } finally {
        if (active) {
          setAuthChecking(false);
        }
      }
    }

    restoreLogin();

    // この処理が不要になった場合は、通信結果を画面に反映しない。
    return () => {
      active = false;
    };
  }, []);

  // ログイン後に、そのユーザーのタスク一覧を取得する。
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let active = true;

    async function loadTasks() {
      setTasksLoading(true);
      setTasksError("");

      try {
        const fetchedTasks = await fetchTasks();

        if (active) {
          setTasks(fetchedTasks);
        }
      } catch (error) {
        if (active) {
          setTasksError(
            error instanceof Error
              ? error.message
              : "タスク一覧を取得できませんでした。",
          );
        }
      } finally {
        if (active) {
          setTasksLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      active = false;
    };
  }, [currentUser]);

  // 選んだタスクを編集画面に表示する。
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setPreviewScreen("edit");
  };

  // 選択したタスクを更新し、一覧にも反映する。
  const handleUpdateTask = async (taskData) => {
    if (!selectedTask) {
      throw new Error("編集対象のタスクを選んでください。");
    }

    const updatedTask = await updateTask(selectedTask.taskId, taskData);

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.taskId === updatedTask.taskId ? updatedTask : task,
      ),
    );

    setSelectedTask(updatedTask);
  };

  // 確認後に削除し、成功した場合だけ一覧から取り除く。
  const handleDeleteTask = async (task) => {
    if (deletingTaskId !== null) {
      return;
    }

    setDeleteError("");

    const confirmed = window.confirm(`「${task.title}」を削除しますか？`);

    if (!confirmed) {
      return;
    }

    setDeletingTaskId(task.taskId);

    try {
      await deleteTask(task.taskId);

      setTasks((currentTasks) =>
        currentTasks.filter(
          (currentTask) => currentTask.taskId !== task.taskId,
        ),
      );

      setSelectedTask((currentTask) =>
        currentTask?.taskId === task.taskId ? null : currentTask,
      );
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "タスクを削除できませんでした。",
      );
    } finally {
      setDeletingTaskId(null);
    }
  };

  // ログインユーザーのタスクを登録し、一覧に追加する。
  // userIdは送信せず、サーバー側で所有者を設定する。
  const handleCreateTask = async (taskData) => {
    const createdTask = await createTask(taskData);

    setTasks((currentTasks) => [...currentTasks, createdTask]);
  };

  // サーバーでログアウトできたら、画面のユーザー情報も消す。
  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setLogoutError("");

    try {
      await logout();

      setCurrentUser(null);
      setTasks([]);
      setTasksError("");
      setDeleteError("");
      setSelectedTask(null);
      setPreviewScreen("list");

      setUsername("");
      setPassword("");
      setShowPassword(false);
      setUsernameError("");
      setPasswordError("");
      setLoginError("");
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : "ログアウトできませんでした。",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loggingIn) {
      return;
    }

    let isValid = true;

    setUsernameError("");
    setPasswordError("");
    setLoginError("");

    if (!username.trim()) {
      setUsernameError("ユーザー名を入力してください。");
      isValid = false;
    }

    if (!password) {
      setPasswordError("パスワードを入力してください。");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    setLoggingIn(true);

    try {
      await login(username, password);

      const user = await fetchCurrentUser();

      if (!user) {
        throw new Error("ログイン状態を確認できませんでした。");
      }

      setTasks([]);
      setTasksLoading(true);
      setTasksError("");
      setDeleteError("");
      setSelectedTask(null);
      setPreviewScreen("list");
      setPassword("");
      setShowPassword(false);
      setCurrentUser(user);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "ログインできませんでした。",
      );
    } finally {
      setLoggingIn(false);
    }
  };

  // ログイン中の場合だけ、タスク画面を表示する。
  const showScreenPreview = currentUser !== null;

  // 確認が終わるまでは、ログインフォームを表示しない。
  if (authChecking) {
    return (
      <div className="login-page">
        <p role="status">ログイン状態を確認しています。</p>
      </div>
    );
  }

  if (showScreenPreview) {
    return (
      <div className="login-page screen-preview">
        <div className="preview-controls">
          <p>ログイン中：{currentUser.username}</p>

          <button
            type="button"
            className="password-toggle"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "ログアウト中…" : "ログアウト"}
          </button>

          {logoutError && (
            <p className="error-message" role="alert">
              {logoutError}
            </p>
          )}

          <label htmlFor="preview-screen">表示する画面</label>

          <select
            id="preview-screen"
            value={previewScreen}
            onChange={(event) => setPreviewScreen(event.target.value)}
          >
            <option value="list">タスク一覧</option>
            <option value="create">タスク登録</option>
            <option value="edit">タスク編集</option>
          </select>
        </div>

        {previewScreen === "list" &&
          (tasksLoading ? (
            <p role="status">タスクを読み込んでいます。</p>
          ) : tasksError ? (
            <p className="error-message" role="alert">
              {tasksError}
            </p>
          ) : (
            <>
              {deleteError && (
                <p className="error-message" role="alert">
                  {deleteError}
                </p>
              )}

              <TaskList
                tasks={tasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                deletingTaskId={deletingTaskId}
              />
            </>
          ))}

        {previewScreen === "create" && (
          <TaskForm key="create-preview" onSave={handleCreateTask} />
        )}

        {previewScreen === "edit" &&
          (selectedTask ? (
            <TaskForm
              key={`edit-${selectedTask.taskId}`}
              initialTask={selectedTask}
              onSave={handleUpdateTask}
            />
          ) : (
            <p>タスク一覧の「編集」ボタンからタスクを選んでください。</p>
          ))}
      </div>
    );
  }

  return (
    <div className="login-page">
      <main className="login-container">
        <h1>タスク管理アプリ</h1>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setUsernameError("");
              }}
              maxLength={50}
              required
              disabled={loggingIn}
            />

            {usernameError && <p className="error-message">{usernameError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>

            <div className="password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordError("");
                }}
                required
                disabled={loggingIn}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "非表示" : "表示"}
              </button>
            </div>

            {passwordError && <p className="error-message">{passwordError}</p>}
          </div>

          {loginError && (
            <p className="error-message" role="alert">
              {loginError}
            </p>
          )}

          <button type="submit" className="login-button" disabled={loggingIn}>
            {loggingIn ? "ログイン中…" : "ログイン"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default App;
