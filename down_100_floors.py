import random
import tkinter as tk


# Window settings
WIDTH = 420
HEIGHT = 640
FPS_MS = 16

# Player settings
PLAYER_W = 24
PLAYER_H = 30
MOVE_SPEED = 5
GRAVITY = 0.42
MAX_FALL_SPEED = 10
JUMP_SPEED = -9.5

# Platform settings
PLATFORM_H = 14
PLATFORM_MIN_W = 70
PLATFORM_MAX_W = 130
PLATFORM_GAP_Y = 85
SCROLL_SPEED_BASE = 1.8
SCROLL_SPEED_INC = 0.012
TOTAL_FLOORS = 100


class Platform:
    def __init__(self, x, y, w, kind="normal"):
        self.x = x
        self.y = y
        self.w = w
        self.h = PLATFORM_H
        self.kind = kind


class Game:
    def __init__(self, root):
        self.root = root
        self.root.title("Down 100 Floors - Tkinter")
        self.root.resizable(False, False)

        self.canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="#111827", highlightthickness=0)
        self.canvas.pack()

        self.keys = {"Left": False, "Right": False, "a": False, "d": False}
        self.running = True
        self.game_over = False
        self.win = False

        self.reset_game()

        self.root.bind("<KeyPress>", self.on_key_press)
        self.root.bind("<KeyRelease>", self.on_key_release)

        self.loop()

    def reset_game(self):
        self.platforms = []
        self.passed_floors = 0
        self.scroll_speed = SCROLL_SPEED_BASE

        player_x = WIDTH // 2 - PLAYER_W // 2
        player_y = HEIGHT - 120
        self.player_x = float(player_x)
        self.player_y = float(player_y)
        self.vy = 0.0

        base = Platform(WIDTH // 2 - 60, HEIGHT - 60, 120, "normal")
        self.platforms.append(base)

        y = HEIGHT - 60 - PLATFORM_GAP_Y
        while y > -PLATFORM_GAP_Y:
            self.platforms.append(self.generate_platform(y))
            y -= PLATFORM_GAP_Y

        self.game_over = False
        self.win = False

    def generate_platform(self, y):
        w = random.randint(PLATFORM_MIN_W, PLATFORM_MAX_W)
        x = random.randint(8, WIDTH - w - 8)

        r = random.random()
        if r < 0.12:
            kind = "fragile"
        elif r < 0.22:
            kind = "spike"
        else:
            kind = "normal"
        return Platform(x, y, w, kind)

    def on_key_press(self, event):
        if event.keysym in self.keys:
            self.keys[event.keysym] = True
        if event.keysym.lower() in self.keys:
            self.keys[event.keysym.lower()] = True

        if event.keysym == "r" and (self.game_over or self.win):
            self.running = True
            self.reset_game()

    def on_key_release(self, event):
        if event.keysym in self.keys:
            self.keys[event.keysym] = False
        if event.keysym.lower() in self.keys:
            self.keys[event.keysym.lower()] = False

    def move_player(self):
        move_x = 0
        if self.keys["Left"] or self.keys["a"]:
            move_x -= MOVE_SPEED
        if self.keys["Right"] or self.keys["d"]:
            move_x += MOVE_SPEED

        self.player_x += move_x

        # Wrap around screen edges
        if self.player_x < -PLAYER_W:
            self.player_x = WIDTH
        if self.player_x > WIDTH:
            self.player_x = -PLAYER_W

        self.vy += GRAVITY
        if self.vy > MAX_FALL_SPEED:
            self.vy = MAX_FALL_SPEED

        old_bottom = self.player_y + PLAYER_H
        self.player_y += self.vy
        new_bottom = self.player_y + PLAYER_H

        if self.vy > 0:
            for p in self.platforms:
                if (
                    old_bottom <= p.y <= new_bottom
                    and self.player_x + PLAYER_W > p.x
                    and self.player_x < p.x + p.w
                ):
                    if p.kind == "spike":
                        self.game_over = True
                        self.running = False
                        return

                    self.player_y = p.y - PLAYER_H
                    self.vy = JUMP_SPEED

                    if p.kind == "fragile":
                        self.platforms.remove(p)
                    break

    def scroll_world(self):
        self.scroll_speed = SCROLL_SPEED_BASE + self.passed_floors * SCROLL_SPEED_INC

        for p in self.platforms:
            p.y -= self.scroll_speed

        self.player_y -= self.scroll_speed

        if self.player_y + PLAYER_H < 0:
            self.game_over = True
            self.running = False
            return

        kept = []
        for p in self.platforms:
            if p.y + p.h >= 0:
                kept.append(p)
            else:
                self.passed_floors += 1
        self.platforms = kept

        highest_y = max((p.y for p in self.platforms), default=0)
        while len(self.platforms) < 10:
            highest_y += PLATFORM_GAP_Y
            self.platforms.append(self.generate_platform(highest_y))

        if self.passed_floors >= TOTAL_FLOORS:
            self.win = True
            self.running = False

        if self.player_y > HEIGHT:
            self.game_over = True
            self.running = False

    def draw_player(self):
        x1 = self.player_x
        y1 = self.player_y
        x2 = x1 + PLAYER_W
        y2 = y1 + PLAYER_H

        self.canvas.create_rectangle(x1, y1, x2, y2, fill="#34d399", outline="")
        self.canvas.create_rectangle(x1 + 4, y1 + 4, x2 - 4, y1 + 12, fill="#a7f3d0", outline="")

    def draw_platforms(self):
        for p in self.platforms:
            if p.kind == "normal":
                color = "#60a5fa"
            elif p.kind == "fragile":
                color = "#f59e0b"
            else:
                color = "#ef4444"

            self.canvas.create_rectangle(p.x, p.y, p.x + p.w, p.y + p.h, fill=color, outline="")

    def draw_ui(self):
        left = max(0, TOTAL_FLOORS - self.passed_floors)
        self.canvas.create_text(10, 10, anchor="nw", fill="#f9fafb", font=("Consolas", 14, "bold"),
                                text=f"Floors Left: {left}")
        self.canvas.create_text(10, 35, anchor="nw", fill="#d1d5db", font=("Consolas", 10),
                                text="Move: A/D or Left/Right")

        if self.win:
            self.canvas.create_text(WIDTH // 2, HEIGHT // 2 - 20, fill="#fef3c7", font=("Consolas", 22, "bold"),
                                    text="YOU WIN")
            self.canvas.create_text(WIDTH // 2, HEIGHT // 2 + 16, fill="#f3f4f6", font=("Consolas", 12),
                                    text="Press R to restart")

        if self.game_over:
            self.canvas.create_text(WIDTH // 2, HEIGHT // 2 - 20, fill="#fecaca", font=("Consolas", 22, "bold"),
                                    text="GAME OVER")
            self.canvas.create_text(WIDTH // 2, HEIGHT // 2 + 16, fill="#f3f4f6", font=("Consolas", 12),
                                    text="Press R to restart")

    def loop(self):
        self.canvas.delete("all")

        if self.running:
            self.move_player()
            if self.running:
                self.scroll_world()

        self.draw_platforms()
        self.draw_player()
        self.draw_ui()

        self.root.after(FPS_MS, self.loop)


def main():
    root = tk.Tk()
    Game(root)
    root.mainloop()


if __name__ == "__main__":
    main()
