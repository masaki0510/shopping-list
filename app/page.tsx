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

export default function Home() {
  const [name, setName] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");

  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "牛乳", count: 3, done: false, createdAt: new Date().toISOString() },
    { id: 2, name: "卵", count: 1, done: true, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  ]);

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

  const addItem = () => {
    if (!name.trim()) return;

    const names = name
      .split(/[、,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    const now = new Date().toISOString();

    setItems((prev) => {
      const map = new Map<string, Item>();
      for (const item of prev) map.set(item.name, item);

      for (const n of names) {
        const existing = map.get(n);
        if (existing) {
          map.set(n, {
            ...existing,
            count: existing.count + 1,
            done: false,
            createdAt: now,
          });
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

      return Array.from(map.values()).sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        return b.createdAt.localeCompare(a.createdAt);
      });
    });

    setName("");
  };

  const toggleDone = (id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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

            <Stack direction="row" spacing={1} alignItems="center">
              <Button onClick={addItem}>追加</Button>

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
                  key={item.id}
                  divider
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => removeItem(item.id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  }
                  sx={{ opacity: item.done ? 0.7 : 1 }}
                >
                  <ListItemIcon>
                    <Checkbox checked={item.done} onChange={() => toggleDone(item.id)} />
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
