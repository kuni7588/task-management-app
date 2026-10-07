import { useState } from "react";

// ⑭・⑮：タスク登録と編集で共通の入力画面。
// 保存時はAppから渡されたonSaveを呼び出す。
// 編集時はinitialTaskの内容を入力欄に表示する。
// 登録成功後は入力欄を初期状態に戻す。
function TaskForm({ initialTask = null, onSave }) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [status, setStatus] = useState(initialTask?.status ?? "未完了");
  const [description, setDescription] = useState(
    initialTask?.description ?? "",
  );
  const [titleError, setTitleError] = useState("");
  // ⑪：保存中・失敗・成功の表示を管理する。
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setTitleError("");
    setSaveError("");
    setSaveMessage("");

    if (!title.trim()) {
      setTitleError("タスク名を入力してください。");
      return;
    }

    // API接続前の画面では、入力チェックだけを行う。
    if (!onSave) {
      return;
    }

    setSaving(true);

    try {
      await onSave({ title, status, description });

      // 登録に成功した場合だけ、次のタスクを入力できる状態に戻す。
      // 編集時や保存に失敗した場合は、入力内容を残す。
      if (!initialTask) {
        setTitle("");
        setStatus("未完了");
        setDescription("");
      }

      setSaveMessage(
        initialTask ? "タスクを更新しました。" : "タスクを登録しました。",
      );
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "タスクを保存できませんでした。",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="task-container">
      <h1>{initialTask ? "タスク編集" : "タスク登録"}</h1>

      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="task-title">タスク名（必須）</label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setTitleError("");
              setSaveError("");
              setSaveMessage("");
            }}
            maxLength={100}
            required
            disabled={saving}
          />
          {titleError && <p className="error-message">{titleError}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="task-status">状態（必須）</label>
          <select
            id="task-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSaveError("");
              setSaveMessage("");
            }}
            required
            disabled={saving}
          >
            <option value="未完了">未完了</option>
            <option value="完了">完了</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-description">説明（任意）</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSaveError("");
              setSaveMessage("");
            }}
            maxLength={1000}
            rows={5}
            disabled={saving}
          />
        </div>
        {saveError && (
          <p className="error-message" role="alert">
            {saveError}
          </p>
        )}

        {saveMessage && <p role="status">{saveMessage}</p>}

        <button type="submit" className="login-button" disabled={saving}>
          {saving
            ? "保存中…"
            : !onSave
              ? "入力を確認"
              : initialTask
                ? "更新"
                : "登録"}
        </button>
      </form>
    </main>
  );
}

export default TaskForm;
