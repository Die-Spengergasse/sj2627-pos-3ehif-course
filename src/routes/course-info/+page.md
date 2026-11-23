<script>
	import { resolve } from '$app/paths';
	import { CHAPTERS, MODULES, deckUrl } from '#lib/content/modules.js';
</script>

<svelte:head>
	<title>Kursinfo · POS 3EHIF · Learning Site</title>
</svelte:head>

# Kursinfo

Willkommen in POS (Programmieren und Software Engineering) in der 1. Klasse HIF! Hier findest du, worum es in diesem Jahr geht, wie du benotet wirst und was du für den Einstieg brauchst. Die Folien zur ersten Stunde findest du <a href={deckUrl('00_Einfuehrung')} target="_blank" rel="noopener">hier</a>.

## Unsere Ziele

- Erste Schritte in der Programmierung mit **Java**
- Grundlegende Konzepte des Programmierens verstehen
- Freude daran entwickeln, Probleme mit Code zu lösen

## Bewertung

Deine Note setzt sich aus zwei gleich großen Teilen zusammen:

| Teil | Anteil |
|---|---|
| PLÜs | 50 % |
| Mitarbeit | 50 % |

Zur **Mitarbeit** zählen:

- praktische Übungen
- Wiederholungen
- aktive Mitarbeit im Unterricht
- deine Mitschrift

:::remember
Die Übungsaufgaben bekommst du im Unterricht. Diese Lernseite hilft dir beim Wiederholen und Festigen, ersetzt aber nicht die Mitarbeit.
:::

## Kursinhalte

Das lernen wir in diesem Jahr, in der Reihenfolge des Unterrichts:

{#each CHAPTERS as chapter (chapter.slug)}

### {chapter.note}: {chapter.title}

<ul>
	{#each MODULES.filter((m) => m.chapter === chapter.slug) as m (m.slug)}
		<li><a href={resolve('/[module]', { module: m.slug })}>{m.title}</a></li>
	{/each}
</ul>

{/each}

## Setup: J;DE

Verwende [**J;DE**](https://github.com/mfreimueller/jide/releases/) zum Programmieren. Das Programm läuft unter Windows und braucht keine Administrator-Rechte. Ein **JDK** (Java Development Kit) ist schon eingebaut, du musst also nichts anderes installieren.

1. Starte den Installer, den du [hier](https://github.com/mfreimueller/jide/releases/) bekommst.
2. Beim ersten Start zeigt Windows (SmartScreen) vielleicht eine Warnung. Klicke auf "Weitere Informationen" und dann auf "Trotzdem ausführen".
3. Melde dich mit deinem persönlichen Code an, den du von deiner Lehrkraft bekommst.

Mit **▶ Ausführen** startest du dein Programm, mit **■ Stopp** beendest du es. Fehler zeigt dir J;DE schon beim Tippen an, die Liste **Probleme** nennt sie dir im Detail.

:::remember
Alles, was du für den Einstieg brauchst, ist J;DE. Weitere Programme brauchst du in diesem Jahr nicht.
:::

## Wie geht es weiter?

Beginne mit <a href={resolve('/[module]', { module: 'was-ist-programmieren' })}>Was ist Programmieren?</a>. Wie die Lernseite funktioniert, steht unter <a href={resolve('/how-it-works')}>So funktioniert die Lernseite</a>.
