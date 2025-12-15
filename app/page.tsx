"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type Item = {
  id: number;
  name: string;
  count: number;
  done: boolean;
  createdAt: string;
};

const RECIPES: Record<string, string[]> = {
  カレー: ["玉ねぎ", "人参", "じゃがいも", "牛肉", "カレールー"],
  親子丼: ["鶏もも", "卵", "玉ねぎ", "めんつゆ"],
  味噌汁: ["味噌", "だし", "豆腐", "ねぎ"],
  ハンバーグ: ["合いびき肉", "玉ねぎ", "卵", "パン粉", "牛乳"],
  生姜焼き: ["豚肉", "玉ねぎ", "生姜", "醤油", "みりん"],
  すき焼き: ["牛肉", "白菜", "長ねぎ", "しらたき", "豆腐", "割下"],
};

export default function Home() {
  // 手入力（買い物メモ）
  const [name, setName] = useState("");

  // 料理入力 & 選択済み料理
  const [mealInput, setMealInput] = useState("");
  const [selectedMeals, setSelectedMeals] = useState<Record<string, number>>({});
  const [unknownMeals, setUnknownMeals] = useState<string[]>([]);

  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  // 手入力の買い物（ここだけ state として保持）
  const [manualItems, setManualItems] = useState<Item[]>([
    { id: 1, name: "牛乳", count: 1, done: false, createdAt: new Date().toISOString() },
  ]);

  // 料理から材料を “毎回再計算” して Item 化（これが×で消える仕組みの肝）
  const mealItems = useMemo((): Item[] => {
    const counts = new Map<string, number>();

    for (const [meal, times] of Object.entries(selectedMeals)) {
      const ings = RECIPES[meal] ?? [];
      for (const ing of ings) {
        counts.set(ing, (counts.get(ing) ?? 0) + times);
      }
    }

    const now = new Date().toISOString();
    return Array.from(counts.entries()).map(([name, count], idx) => ({
      id: 10_000_000 + idx,
      name,
      count,
      done: false,
      createdAt: now,
    }));
  }, [selectedMeals]);

  // manual + meal を統合して表示（nameでマージ）
  const items = useMemo((): Item[] => {
    const map = new Map<string, Item>();

    const put = (x: Item) => {
      const existing = map.get(x.name);
      if (!existing) {
        map.set(x.name, { ...x });
        return;
      }
      map.set(x.name, {
        ...existing,
        count: existing.count + x.count,
        // done は “どっちか未完了なら未完了”にするのが無難（気になるなら後で調整）
        done: existing.done && x.done,
      });
    };

    for (const x of mealItems) put(x);
    for (const x of manualItems) put(x);

    return Array.from(map.values()).sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [mealItems, manualItems]);

  const filtered = useMemo(() => {
    if (filter === "todo") return items.filter((i) => !i.done);
    if (filter === "done") return items.filter((i) => i.done);
    return items;
  }, [items, filter]);

  const stats = useMemo(() => {
    const total = items.reduce((sum, i) => sum + i.count, 0);
    const done = items.filter((i) => i.done).reduce((sum, i) => sum + i.count, 0);
    return { total, done, todo: total - done };
  }, [items]);

  // 手入力アイテムを追加（manualItemsにマージ）
  const addManualItems = () => {
    if (!name.trim()) return;

    const names = name
      .split(/[、,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    const now = new Date().toISOString();

    setManualItems((prev) => {
      const map = new Map<string, Item>();
      for (const item of prev) map.set(item.name, item);

      for (const n of names) {
        const ex = map.get(n);
        if (ex) {
          map.set(n, { ...ex, count: ex.count + 1, done: false, createdAt: now });
        } else {
          map.set(n, {
            id: Date.now() + Math.floor(Math.random() * 1000000),
            name: n,
            count: 1,
            done: false,
            createdAt: now,
          });
        }
      }

      return Array.from(map.values());
    });

    setName("");
  };

  // 料理を追加（selectedMealsへ）
  const addMeals = () => {
    if (!mealInput.trim()) return;

    const mealNames = mealInput
      .split(/[、,]/)
      .map((s) => s.trim())
      .filter(Boolean);

      if (mealNames.length === 0) return;

      const unknown: string[] = [];

      setSelectedMeals((prev) => {
        const next = { ...prev };
        for (const m of mealNames) {
          if (!RECIPES[m]) {
            unknown.push(m);
            continue;
          }
          next[m] = (next[m] ?? 0) + 1; // ← 回数を増やす
        }
        return next;
      });

      setUnknownMeals(unknown);
      setMealInput("");
    };
  const decrementMeal = (meal: string) => {
  setSelectedMeals((prev) => {
    const next = { ...prev };
    if (!next[meal]) return prev;

    if (next[meal] <= 1) {
      delete next[meal];
    } else {
      next[meal] -= 1;
    }
    return next;
  });
};

  // チェック/削除：まずは manualItems だけを対象にする（meal由来は “料理側” で消す思想）
  const toggleDone = (nameKey: string) => {
    setManualItems((prev) =>
      prev.map((x) => (x.name === nameKey ? { ...x, done: !x.done } : x))
    );
  };

  const removeItem = (nameKey: string) => {
    setManualItems((prev) => prev.filter((x) => x.name !== nameKey));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            買い物リスト
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            <Chip label={`Todo: ${stats.todo}`} />
            <Chip label={`Done: ${stats.done}`} />
            <Chip label={`Total: ${stats.total}`} />
          </Stack>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <TextField
              label="買い物メモ（、区切りで複数入力）"
              placeholder="例：牛乳、卵、トイレットペーパー"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <Button onClick={addManualItems}>追加</Button>

            <Box sx={{ height: 8 }} />

            <TextField
              label="作る料理（、区切りで追加）"
              placeholder="例：カレー、すき焼き、ハンバーグ"
              value={mealInput}
              onChange={(e) => setMealInput(e.target.value)}
              fullWidth
            />
            <Button onClick={addMeals}>料理を追加</Button>

            {unknownMeals.length > 0 && (
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                未登録の料理：{unknownMeals.join("、")}
              </Typography>
            )}

            {Object.entries(selectedMeals).length > 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {Object.entries(selectedMeals).map(([meal, count]) => (
                  <Chip
                    key={meal}
                    label={`${meal} ×${count}`}
                    onDelete={() => decrementMeal(meal)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
)}

            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ flex: 1 }} />
              <ToggleButtonGroup
                size="small"
                exclusive
                value={filter}
                onChange={(_, v) => v && setFilter(v)}
              >
                <ToggleButton value="all">全部</ToggleButton>
                <ToggleButton value="todo">未完了</ToggleButton>
                <ToggleButton value="done">完了</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 1 }}>
          {filtered.length === 0 ? (
            <Typography sx={{ p: 2, opacity: 0.7 }}>まだアイテムがありません。</Typography>
          ) : (
            <List disablePadding>
              {filtered.map((item) => (
                <ListItem
                  key={item.name}
                  divider
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeItem(item.name)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  }
                  sx={{ opacity: item.done ? 0.7 : 1 }}
                >
                  <ListItemIcon>
                    <Checkbox checked={item.done} onChange={() => toggleDone(item.name)} />
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            textDecoration: item.done ? "line-through" : "none",
                          }}
                        >
                          {item.name}
                        </Typography>

                        {item.count > 1 && <Typography sx={{ opacity: 0.7 }}>× {item.count}</Typography>}
                      </Stack>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        {new Date(item.createdAt).toLocaleString("ja-JP")}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
