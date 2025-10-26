<?php

function loadConfig(): array
{
    static $config;
    if (!$config) {
        $config = require __DIR__ . '/../config.php';
    }

    return $config;
}

function getTalks(): array
{
    $config = loadConfig();
    return $config['talks'] ?? [];
}

function getEventInfo(): array
{
    $config = loadConfig();
    return $config['event'] ?? [];
}

function getSlideshowInterval(): int
{
    $config = loadConfig();
    return $config['slideshow']['intervalSeconds'] ?? 8;
}

function parseTimeToMinutes(string $time): int
{
    [$hour, $minute] = array_map('intval', explode(':', $time));
    return $hour * 60 + $minute;
}

function findNextTalk(array $talks, ?DateTimeImmutable $now = null): ?array
{
    $now = $now ?: new DateTimeImmutable('now');
    $currentMinutes = (int)$now->format('H') * 60 + (int)$now->format('i');

    $upcoming = null;
    foreach ($talks as $index => $talk) {
        $talkMinutes = parseTimeToMinutes($talk['time']);
        if ($talkMinutes >= $currentMinutes) {
            $talk['index'] = $index;
            $upcoming = $talk;
            break;
        }
    }

    return $upcoming;
}

function getStateFile(): string
{
    return __DIR__ . '/../storage/state.json';
}

function loadState(): array
{
    $file = getStateFile();
    if (!file_exists($file)) {
        return ['mode' => 'slideshow', 'activeTalk' => null];
    }

    $json = file_get_contents($file);
    $data = json_decode($json, true);
    if (!is_array($data)) {
        return ['mode' => 'slideshow', 'activeTalk' => null];
    }

    return array_merge(['mode' => 'slideshow', 'activeTalk' => null], $data);
}

function saveState(array $state): void
{
    $file = getStateFile();
    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0777, true);
    }

    file_put_contents($file, json_encode($state, JSON_PRETTY_PRINT));
}

