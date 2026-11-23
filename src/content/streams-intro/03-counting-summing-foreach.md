---
title: "Counting, summing and forEach"
minutes: 8
status: draft
---

## Pattern 3: counting and summing

Loops often compute a number while they iterate: how many elements fit, and what is their sum?

```java
// Before: loop
int sum = 0;
int count = 0;
for (Integer n : numbers) {
    if (n > 0) {
        sum += n;
        count++;
    }
}
```

With streams, each result gets its own small pipeline, and you do not need mutable counters:

```java
long count = numbers.stream().filter(n -> n > 0).count();
int sum = numbers.stream().filter(n -> n > 0).mapToInt(n -> n).sum();
```

Two details to know:

- `count()` is a terminal operation that returns a **`long`**, not an `int`. Assigning it to an `int` does not compile without a cast.
- `sum()` does not exist on a normal `Stream<Integer>`. First you convert the stream with `mapToInt` into an `IntStream` (a stream of primitive `int` values), which has `sum()`. The lambda `n -> n` converts each `Integer` into an `int`. For an empty stream, `sum()` returns `0`.

The stream version goes through the data twice, while the loop did it once. For ordinary list sizes this does not matter, and the intent of each line is much clearer.

## forEach: do something with every element

Sometimes you do not want a result, but an **action** for each element, such as printing it.

```java
// Before: loop
for (String word : words) {
    System.out.println(word);
}

// After: stream
words.stream().forEach(word -> System.out.println(word));
```

`forEach` is a **terminal** operation: it ends the pipeline and returns nothing (`void`). Its parameter is a lambda that is run for each element. The shorter form `words.stream().forEach(System.out::println)` is a method reference; see the lambdas module.

Use `forEach` for actions like printing. To **build a result**, prefer `toList()` or another collecting operation. Adding to an outer list inside `forEach` brings back exactly the bookkeeping that streams are supposed to remove.

## Summary

- Streams turn "how to iterate" into "what to compute".
- `filter` selects, `map` transforms, `forEach` acts on each element.
- Intermediate operations are lazy; nothing runs until a terminal operation such as `toList()`, `count()`, `sum()` or `forEach` is called.
- Next you learn what lambdas really are. After that, you go deeper into `filter`, `map` and `flatMap`.

:::remember
Typical loop patterns and their stream versions: collecting matches is `filter` + `toList()`, converting is `map`, counting is `filter` + `count()` (a `long`), summing is `mapToInt` + `sum()`, and acting on each element is `forEach`.
:::

:::exercise price-stats
