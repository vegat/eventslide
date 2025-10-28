<?php
require __DIR__ . '/lib/helpers.php';

$event = getEventInfo();
$talks = getTalks();
$nextTalk = findNextTalk($talks);
$slideshowInterval = getSlideshowInterval();
$state = loadState();
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($event['title'] ?? 'Wydarzenie') ?></title>
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body data-slideshow-interval="<?= (int)$slideshowInterval ?>" data-mode="<?= htmlspecialchars($state['mode']) ?>" data-active-talk="<?= htmlspecialchars(json_encode($state['activeTalk'])) ?>">
    <canvas id="background-canvas"></canvas>
    <div class="slideshow" id="slideshow">
        <div class="slides">
            <section class="slide slide--logo">
                <div class="slide__content">
                    <img src="<?= htmlspecialchars($event['logo']) ?>" alt="Logo wydarzenia" class="slide__logo">
                </div>
            </section>
            <section class="slide slide--details">
                <div class="slide__content">
                    <h1 class="event-title"><?= htmlspecialchars($event['title']) ?></h1>
                    <p class="event-meta"><?= htmlspecialchars($event['location']) ?></p>
                    <p class="event-meta"><?= htmlspecialchars($event['time']) ?></p>
                    <p class="event-meta event-meta--organizer">Organizator: <?= htmlspecialchars($event['organizer']) ?></p>
                </div>
            </section>
            <section class="slide slide--agenda" data-talks='<?= json_encode($talks, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>'>
                <div class="slide__content">
                    <h2>Agenda</h2>
                    <ul class="agenda-list">
                        <?php foreach ($talks as $index => $talk): ?>
                            <?php
                                $isNext = $nextTalk && $nextTalk['index'] === $index;
                            ?>
                            <li class="agenda-item <?= $isNext ? 'agenda-item--next' : '' ?>" data-talk-index="<?= $index ?>">
                                <span class="agenda-item__time"><?= htmlspecialchars($talk['time']) ?></span>
                                <div class="agenda-item__info">
                                    <span class="agenda-item__title"><?= htmlspecialchars($talk['title']) ?></span>
                                    <span class="agenda-item__speaker"><?= htmlspecialchars($talk['speaker']) ?></span>
                                    <span class="agenda-item__role"><?= htmlspecialchars($talk['speakerRole'] ?? '') ?></span>
                                </div>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </section>
            <section class="slide slide--hashtag">
                <div class="slide__content">
                    <h2>Udostępniaj z nami</h2>
                    <p class="hashtag"><?= htmlspecialchars($event['hashtag']) ?></p>
                </div>
            </section>
            <section class="slide slide--app">
                <div class="slide__content">
                    <h2>Oceń prelegentów</h2>
                    <p>Pobierz aplikację i podziel się opinią.</p>
                    <p class="app-link"><?= htmlspecialchars($event['appLink']) ?></p>
                    <p class="app-qr">(tu może być kod QR)</p>
                </div>
            </section>
        </div>
    </div>

    <div class="branding-overlay">
        <img src="<?= htmlspecialchars($event['organizerLogo']) ?>" alt="Logo organizatora" class="branding-overlay__logo branding-overlay__logo--top">
      <!--  <img src="<?= htmlspecialchars($event['techCrewLogo']) ?>" alt="Logo ekipy technicznej" class="branding-overlay__logo branding-overlay__logo--bottom">-->
    </div>

    <div class="announcement" id="announcement" hidden>
        <div class="announcement__inner">
            <div class="announcement__header">Nadchodzący prelegent</div>
            <div class="announcement__content">
                <div class="announcement__photo-wrap">
                    <img src="" alt="Zdjęcie prelegenta" class="announcement__photo">
                </div>
                <div class="announcement__details">
                    <div class="announcement__speaker">
                        <div class="announcement__speaker-name"></div>
                        <div class="announcement__speaker-role"></div>
                    </div>
                    <div class="announcement__title"><span class="announcement__title-text"></span></div>
                    <div class="announcement__time"></div>
                </div>
            </div>
        </div>
        <div class="announcement__final" hidden></div>
    </div>

    <script>
        window.__eventConfig = <?= json_encode([
            'talks' => $talks,
            'nextTalkIndex' => $nextTalk['index'] ?? null,
            'intervalSeconds' => $slideshowInterval,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
    </script>
    <script src="assets/js/background.js"></script>
    <script src="assets/js/slideshow.js"></script>
</body>
</html>
