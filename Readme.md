# Event Slide Showcase

Statyczna witryna PHP dla wydarzeń, która wyświetla animowany pokaz slajdów w trakcie przerw oraz pozwala na zdalne uruchomienie zapowiedzi kolejnego prelegenta.

## Struktura

- `config.php` – konfiguracja wydarzenia (teksty, logo, link do aplikacji, harmonogram).
- `lib/helpers.php` – funkcje pomocnicze do pracy z konfiguracją i stanem aplikacji.
- `storage/state.json` – aktualny stan pokazu (`slideshow` lub `announcement`).
- `index.php` – główna strona z animowanymi slajdami i tłem canvas.
- `admin.php` – panel sterowania do przełączania trybu pokazu oraz wybierania prelegenta.
- `state.php` – endpoint zwracający stan w formacie JSON na potrzeby odświeżania klienta.
- `assets/css/styles.css` – warstwa wizualna slajdów i animacji.
- `assets/js/background.js` – animacja tła canvas z łatwą zmianą kolorów przez zmienne CSS.
- `assets/js/slideshow.js` – logika pokazu slajdów i obsługa zapowiedzi.

## Konfiguracja

1. Zmodyfikuj dane wydarzenia w pliku `config.php` (logo, miejsce, hashtag, link do aplikacji itp.).
2. Zaktualizuj listę `talks` w `config.php`, aby odzwierciedlała właściwą agendę. Każdy wpis może zawierać link do zdjęcia prelegenta.
3. Dopasuj kolory do identyfikacji wizualnej wydarzenia poprzez zmienne CSS na początku `assets/css/styles.css` (`--bg-primary`, `--bg-accent`, `--accent`, itp.).
4. Częstotliwość przełączania slajdów ustawisz w `config.php` (`slideshow.intervalSeconds`).

## Obsługa na żywo

- Odwiedź `/index.php`, aby wyświetlić pokaz slajdów. Slajdy przesuwają się automatycznie, a w agendzie wyróżniona jest najbliższa sesja względem czasu lokalnego przeglądarki.
- Odwiedź `/admin.php`, aby kontrolować pokaz.
  - Kliknij **Zapowiedz** przy wybranym prelegencie, aby rozpocząć animację zapowiedzi. Po kilkunastu sekundach ekran przechodzi w zieloną planszę gotową do kluczowania.
  - Kliknij **Wróć do pokazu slajdów**, aby natychmiast wrócić do standardowego pokazu.

Na froncie stan aplikacji jest odświeżany w tle (polling co 5 sekund), dzięki czemu przełączenia wykonane w panelu administratora są widoczne niemal natychmiast.

## Uwagi

- Domyślne grafiki korzystają z serwisu placehold.co – podmień je na właściwe adresy URL logotypów i zdjęć.
- Plik `storage/state.json` musi być zapisywalny przez serwer WWW, aby panel mógł zmieniać stan.
- Animacja tła jest umieszczona w osobnym pliku JavaScript, co ułatwia jej wymianę na inną implementację.
