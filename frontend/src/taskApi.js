import { fetchCsrfToken } from "./authApi";

// ログインユーザーのタスク一覧を取得する。
// 所有者はサーバー側で判定するため、userIdは送信しない。
export async function fetchTasks() {
  const response = await fetch("/api/tasks", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error(
      `タスク一覧を取得できませんでした（HTTP ${response.status}）。`,
    );
  }

  const tasks = await response.json();

  if (!Array.isArray(tasks)) {
    throw new Error("タスク一覧の応答形式が正しくありません。");
  }

  return tasks;
}

// タスクを登録する。
// 成功した場合は、登録されたタスクを返す。
// タスクを登録する。
// CSRFトークンを取得してから、登録リクエストを送信する。
// 成功した場合は、登録されたタスクを返す。
export async function createTask(task) {
  const csrf = await fetchCsrfToken();

  const response = await fetch("/api/tasks", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        "入力内容を確認してください。タスクを登録できませんでした。",
      );
    }

    if (response.status === 401) {
      throw new Error("ログインが必要です。再度ログインしてください。");
    }

    if (response.status === 403) {
      throw new Error(
        "タスクの登録が許可されませんでした。画面を再読み込みして、ログイン状態を確認してください。",
      );
    }

    throw new Error(
      `タスクを登録できませんでした（HTTP ${response.status}）。`,
    );
  }

  return response.json();
}

// 指定したタスクを更新する。
// 所有者のuserIdは送信せず、既存の値を保持する。
export async function updateTask(taskId, taskData) {
  // 更新リクエストを送る前に、現在のCSRFトークンを取得する。
  const csrf = await fetchCsrfToken();

  const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({
      title: taskData.title,
      status: taskData.status,
      description: taskData.description,
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error(
        "入力内容を確認してください。タスクを更新できませんでした。",
      );
    }

    if (response.status === 404) {
      throw new Error("更新対象のタスクが見つかりません。");
    }

    throw new Error(
      `タスクを更新できませんでした（HTTP ${response.status}）。`,
    );
  }

  return response.json();
}

// 指定したタスクを削除する。
// 削除リクエストを送る前に、現在のCSRFトークンを取得する。
// 成功時は204で本文が空のため、JSONは読み取らない。
export async function deleteTask(taskId) {
  const csrf = await fetchCsrfToken();

  const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      [csrf.headerName]: csrf.token,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("ログインが必要です。再度ログインしてください。");
    }

    if (response.status === 403) {
      throw new Error(
        "タスクの削除が許可されませんでした。画面を再読み込みして、ログイン状態を確認してください。",
      );
    }

    if (response.status === 404) {
      throw new Error("削除対象のタスクが見つかりません。");
    }

    throw new Error(
      `タスクを削除できませんでした（HTTP ${response.status}）。`,
    );
  }
}
