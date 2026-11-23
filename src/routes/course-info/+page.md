<script>
	import { resolve } from '$app/paths';
	import { CHAPTERS, MODULES, deckUrl } from '#lib/content/modules.js';
	import { MATERIALS_REPO_URL } from '#lib/content/links.js';
</script>

<svelte:head>
	<title>Course info · POS 3EHIF · Learning Site</title>
</svelte:head>

# Course info

Welcome to POS (Programming and Software Engineering) in the 3rd grade of HIF! This page sums up what this year is about, how you are graded and what you need to set up. The slides of the first lesson are <a href={deckUrl('00_Introduction')} target="_blank" rel="noopener">here</a>.

## Our goals

- Moving towards **modern Java**
- Creating our first complex(ish) software
- Thinking about **software design**

## Grading

POS consists of two parts. **You must be positive in both of them.**

| Part | Weight |
|---|---|
| Programming / Software Engineering | 75 % |
| Logic | 25 % |

In Programming / SE, your grade is made up of:

| | Weight |
|---|---|
| PLÜs (practical exams) | 50 % |
| Mitarbeit (participation) | 50 % |

**Mitarbeit** includes:

- practical exercises
- revisions
- active participation in class
- the WMC project, which replaces the 4th PLÜ

:::remember
This site helps you revise and practise. It does not replace working along in class.
:::

## Course topics

This is what we cover this year, grouped by topic:

{#each CHAPTERS as chapter (chapter.slug)}

### {chapter.note}: {chapter.title}

<ul>
	{#each MODULES.filter((m) => m.chapter === chapter.slug) as m (m.slug)}
		<li>
			<a href={resolve('/[module]', { module: m.slug })}>{m.title}</a>{#if m.bonus}&nbsp;(bonus){/if}{#if m.placeholder}&nbsp;(coming soon){/if}
		</li>
	{/each}
</ul>

{/each}

## Setup

You need these tools for this course. Set them up before the next lesson.

- **IntelliJ IDEA**: our IDE.
- **JDK 27**: in IntelliJ, open **File → Project Structure → SDKs**, click **+** and choose **Download JDK** (version 27, vendor *Eclipse Temurin*). Alternatively, install it from [Adoptium](https://adoptium.net) or with SDKMAN (`sdk list java` shows the available versions).
- **Gradle**: nothing to install. Every project brings its own Gradle (the `gradlew` wrapper), and IntelliJ uses it automatically.
- **Git** and a **GitHub account**.

:::remember
If JDK 27 is missing, Gradle downloads it by itself the first time you open a project. That takes a few minutes, so do it at home, not at the start of a lesson.
:::

## Exercises: set up once

All exercises of this site live in one Gradle project on GitHub. You clone it once; new exercises arrive with an update.

1. In IntelliJ: **File → New → Project from Version Control**.
2. Paste this URL and click **Clone**:
   <code>{MATERIALS_REPO_URL}</code>
3. If IntelliJ asks whether you trust the project, choose **Trust Project**.
4. Wait until Gradle has finished importing (progress bar at the bottom right). The first time, this takes a while.

Then, for every exercise on this site:

1. Click **Copy class name** on the exercise.
2. In IntelliJ press <kbd>Shift</kbd> <kbd>Shift</kbd>, paste and press <kbd>Enter</kbd>. The class opens; the task is at the top.
3. Solve the task. Run the tests with the green ▶ next to the test class (`<ClassName>Test`). When all tests are green, you are done.

New exercises: **Git → Update Project** (<kbd>Ctrl</kbd>+<kbd>T</kbd> / <kbd>⌘</kbd>+<kbd>T</kbd>). Your own changes stay; published exercises never change, so the update never conflicts with your work.

:::warning Can't clone?
Every exercise also has a **Download as zip** link. Unzip it and open the folder in IntelliJ (**File → Open**). You then have to download each exercise separately, so cloning is the better way.
:::

## What's next?

Start with <a href={resolve('/[module]', { module: 'modern-java-core' })}>var, Records, Optional & switch</a>. How this site works is explained under <a href={resolve('/how-it-works')}>How this site works</a>.
