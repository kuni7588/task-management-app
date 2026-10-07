// 現在のブラウザのセッション用CSRFトークンを取得する。
export async function fetchCsrfToken() {
  const response = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    throw new Error("通信の準備に失敗しました。");
  }

  return response.json();
}

// Spring Securityのログイン処理へ、フォーム形式で送信する。
export async function login(username, password) {
  const csrf = await fetchCsrfToken();

  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      [csrf.headerName]: csrf.token,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("ユーザー名またはパスワードが正しくありません。");
    }

    if (response.status === 403) {
      throw new Error(
        "通信の確認に失敗しました。画面を再読み込みしてください。",
      );
    }

    throw new Error(`ログインできませんでした（HTTP ${response.status}）。`);
  }

  // 成功時は204で本文が空のため、JSONは読み取らない。
}

// ログイン中のユーザー情報を取得する。
// 未ログインの場合はnullを返す。
export async function fetchCurrentUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "same-origin",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `ユーザー情報を取得できませんでした（HTTP ${response.status}）。`,
    );
  }

  return response.json();
}

// ⑫：ログアウトして、サーバー側のログイン状態を終了する。
// CSRFトークンを取得してから、ログアウトリクエストを送る。
export async function logout() {
  const csrf = await fetchCsrfToken();

  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      [csrf.headerName]: csrf.token,
    },
  });

  if (!response.ok) {
    throw new Error(`ログアウトできませんでした（HTTP ${response.status}）。`);
  }

  // 成功時は204で本文が空のため、JSONは読み取らない。
}
