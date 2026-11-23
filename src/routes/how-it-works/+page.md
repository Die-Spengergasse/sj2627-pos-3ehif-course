<script>
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>How it works · POS 3EHIF · Learning Site</title>
</svelte:head>

# How this site works

This site is for self-study in POS (3rd grade HTL). You revise what we did in class in short units, test yourself with practice questions and try small exercises in IntelliJ.

## Learn: units

Every module consists of short **units** based on the slides from class.

- Every module links to its **slides**.
- At the end of a unit there is a **knowledge check**. It tells you right away whether you are right and explains the answer. It does not affect your boxes, so feel free to try things out.
- **Mark as read** ticks off a unit. You can see your progress on the home page, in the module overview and in the sidebar.
- Found a mistake in a text or a question? **Report a mistake** opens a prefilled issue on GitHub (you need a GitHub account for that).

## Exercises

Some units contain small **exercises**. They live in one Gradle project that you clone once in IntelliJ; the <a href={resolve('/course-info')}>course info</a> shows how.

- **Copy class name** on an exercise, then press <kbd>Shift</kbd> <kbd>Shift</kbd> in IntelliJ, paste and press <kbd>Enter</kbd>. The exercise opens.
- Each exercise comes with JUnit tests. Run them with the green ▶ next to the test class. When all of them are green, you're done.
- New exercises arrive with **Git → Update Project** (<kbd>Ctrl</kbd>+<kbd>T</kbd> / <kbd>⌘</kbd>+<kbd>T</kbd>).
- There are no sample solutions. Ask in class if you get stuck.

## Practice

In <a href={resolve('/practice')}>Practice</a> you choose a module, a chapter or everything at once.

- A round has **10 question groups**: one main question and up to two follow-up questions on the same topic.
- There is **no feedback** during the round. At the end you see your score and a full review of all answers.
- Every group sits in one of five **boxes** (0 to 4, Leitner system). Answered correctly, it moves up one box; answered wrongly, it goes back to box 1.
- A round in progress survives reloading the page.

There are these question types:

- **Single choice** and **multiple choice**
- **Parsons puzzles**: fill the gaps in code, or put lines of code in the right order

## Your progress

There is **no login**. Everything you do here (units read, boxes, rounds, settings) is stored only in your browser.

- In <a href={resolve('/progress')}>My progress</a> you can **export** your progress as a JSON file and **import** it on another device.
- In private mode, or when you delete the site data, your progress is gone. So export it now and then.
- Your teacher does **not** see your progress unless you hand over the file.

More on this under <a href={resolve('/privacy')}>Privacy</a>.
