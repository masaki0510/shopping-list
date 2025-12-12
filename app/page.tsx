// app/page.tsx
"use client";

import { useMemo, useState } from "react";

type Item = {
  id: number;
  name: string;
  quantity?: number | null;
  memo?: string | null;
  done: boolean;
  createdAt: string; // 表示用
};

export default function Home() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string>("1");
  const [memo, setMemo] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  // “作った感”用：最初はダミーデータ
  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      name: "牛乳",
      quantity: 1,
      memo: "低脂肪",
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "卵",
      quantity: 10,
      memo: null,
      done: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ]);

  const filtered = useMemo(() => {
    if (filter === "todo") return items.filter((i) => !i.done);
    if (filter === "done") return items.filter((i) => i.done);
    return items;
  }, [items, filter]);

  const stats = useMemo(() => {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    return { total, done, todo: total - done };
  }, [items]);

  const addItem = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const q = quantity.trim() === "" ? null : Number(quantity);
    const next: Item = {
      id: Date.now(),
      name: trimmed,
      quantity: Number.isFinite(q) && q != null && q > 0 ? q : null,
      memo: memo.trim() ? memo.trim() : null,
      done: false,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [next, ...prev]);
    setName("");
    setQuantity("1");
    setMemo("");
  };

  const toggleDone = (id: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>買い物リスト</h1>
      <p style={{ marginTop: 0, opacity: 0.7 }}>
        Todo: {stats.todo} / Done: {stats.done} / Total: {stats.total}
      </p>

      <section
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 16,
          marginTop: 16,
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="商品名（例：牛乳）"
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="数量（任意）"
              inputMode="numeric"
              style={inputStyle}
            />
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ（任意）"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={addItem} style={buttonStyle}>
              追加
            </button>

            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
                全部
              </FilterButton>
              <FilterButton active={filter === "todo"} onClick={() => setFilter("todo")}>
                未完了
              </FilterButton>
              <FilterButton active={filter === "done"} onClick={() => setFilter("done")}>
                完了
              </FilterButton>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 18 }}>
        {filtered.length === 0 ? (
          <p style={{ opacity: 0.7 }}>まだアイテムがありません。</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {filtered.map((item) => (
              <li
                key={item.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12,
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "28px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                  opacity: item.done ? 0.65 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleDone(item.id)}
                  aria-label="done"
                />

                <div>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 16,
                        textDecoration: item.done ? "line-through" : "none",
                        fontWeight: 600,
                      }}
                    >
                      {item.name}
                    </span>
                    {item.quantity != null && (
                      <span style={{ opacity: 0.8, fontSize: 13 }}>× {item.quantity}</span>
                    )}
                  </div>

                  {item.memo && <div style={{ opacity: 0.8, marginTop: 4 }}>{item.memo}</div>}

                  <div style={{ opacity: 0.6, fontSize: 12, marginTop: 6 }}>
                    {new Date(item.createdAt).toLocaleString("ja-JP")}
                  </div>
                </div>

                <button onClick={() => removeItem(item.id)} style={ghostButtonStyle}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...chipStyle,
        borderColor: active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.16)",
        opacity: active ? 1 : 0.75,
      }}
    >
      {children}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.06)",
  color: "inherit",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.12)",
  color: "inherit",
  cursor: "pointer",
  fontWeight: 700,
};

const ghostButtonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

const chipStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.16)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontSize: 13,
};
