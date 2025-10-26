<?php
require __DIR__ . '/lib/helpers.php';

$talks = getTalks();
$state = loadState();
$message = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? null;

    if ($action === 'slideshow') {
        $state = ['mode' => 'slideshow', 'activeTalk' => null];
        saveState($state);
        $message = 'Przywrócono pokaz slajdów.';
    }

    if ($action === 'announcement') {
        $talkIndex = isset($_POST['talk_index']) ? (int)$_POST['talk_index'] : null;
        if ($talkIndex !== null && isset($talks[$talkIndex])) {
            $state = ['mode' => 'announcement', 'activeTalk' => $talkIndex];
            saveState($state);
            $message = 'Wyświetlam zapowiedź prelegenta: ' . $talks[$talkIndex]['speaker'];
        } else {
            $message = 'Niepoprawny wybór prelegenta.';
        }
    }
}

?><!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Panel sterowania pokazem</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 2rem;
            background: #0f172a;
            color: #f8fafc;
        }
        h1 {
            margin-top: 0;
        }
        .message {
            padding: 1rem 1.5rem;
            border-radius: 12px;
            background: rgba(56, 189, 248, 0.15);
            margin-bottom: 2rem;
        }
        .grid {
            display: grid;
            gap: 1.5rem;
        }
        .card {
            background: rgba(15, 23, 42, 0.85);
            padding: 1.5rem;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
        }
        .card h2 {
            margin-top: 0;
        }
        .talks {
            display: grid;
            gap: 1rem;
        }
        .talk {
            display: grid;
            grid-template-columns: 1fr auto;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 12px;
            background: rgba(148, 163, 184, 0.1);
        }
        button {
            padding: 0.7rem 1.4rem;
            border: none;
            border-radius: 999px;
            background: #38bdf8;
            color: #0b1120;
            font-weight: 600;
            cursor: pointer;
        }
        button:hover {
            background: #22d3ee;
        }
        .status {
            margin-top: 0.5rem;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <h1>Panel sterowania pokazem</h1>
    <?php if ($message): ?>
        <div class="message"><?= htmlspecialchars($message) ?></div>
    <?php endif; ?>

    <div class="grid">
        <div class="card">
            <h2>Stan pokazu</h2>
            <p class="status">Tryb: <strong><?= htmlspecialchars($state['mode']) ?></strong></p>
            <?php if ($state['mode'] === 'announcement' && $state['activeTalk'] !== null && isset($talks[$state['activeTalk']])): ?>
                <p class="status">Zapowiedź: <strong><?= htmlspecialchars($talks[$state['activeTalk']]['speaker']) ?></strong></p>
            <?php endif; ?>
            <form method="post">
                <input type="hidden" name="action" value="slideshow">
                <button type="submit">Wróć do pokazu slajdów</button>
            </form>
        </div>

        <div class="card">
            <h2>Zapowiedz prelegenta</h2>
            <div class="talks">
                <?php foreach ($talks as $index => $talk): ?>
                    <form method="post" class="talk">
                        <div>
                            <div><strong><?= htmlspecialchars($talk['speaker']) ?></strong></div>
                            <div><?= htmlspecialchars($talk['title']) ?></div>
                            <div>Godzina: <?= htmlspecialchars($talk['time']) ?></div>
                        </div>
                        <div>
                            <input type="hidden" name="action" value="announcement">
                            <input type="hidden" name="talk_index" value="<?= $index ?>">
                            <button type="submit">Zapowiedz</button>
                        </div>
                    </form>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</body>
</html>
