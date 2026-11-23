---
title: "From loops to streams: filter and map"
minutes: 7
status: draft
---

## Pattern 1: filtering

In the first pattern, a loop collects only the elements that satisfy a condition. In a stream, that is exactly what `filter` does.

```java
// Before: loop
List<Integer> big = new ArrayList<>();
for (Integer n : numbers) {
    if (n > 100) {
        big.add(n);
    }
}

// After: stream
List<Integer> big = numbers.stream()
    .filter(n -> n > 100)
    .toList();
```

`filter` receives a **condition**: a lambda that returns `true` or `false` for each element. Elements for which it returns `true` stay in the stream; the others are dropped.

The `if` of the loop became the lambda passed to `filter`. The `new ArrayList<>()` and the `add` call are gone: `toList()` takes care of collecting.

## Pattern 2: transforming

In the second pattern, a loop creates one new element for each old element. A stream uses `map`:

```java
// Before: loop
List<Integer> lengths = new ArrayList<>();
for (String word : words) {
    lengths.add(word.length());
}

// After: stream
List<Integer> lengths = words.stream()
    .map(word -> word.length())
    .toList();
```

`map` receives a **function** that is applied to every element. The result has the **same number** of elements, but they may have a different type: this stream goes from `String` to `Integer`.

When the lambda only calls one method on its parameter, you can write a shorter *method reference* instead: `.map(String::length)`. You learn this in the lambdas module.

:::remember
`filter` keeps some of the elements and does not change them (fewer elements, same type). `map` changes every element and keeps all of them (same number, possibly new type).
:::

## Combining the steps

Because every intermediate operation returns a stream, you can combine them. Here is a task that needs both patterns:

```java
// Before
List<String> result = new ArrayList<>();
for (String word : words) {
    if (word.length() > 3) {
        result.add(word.toUpperCase());
    }
}

// After
List<String> result = words.stream()
    .filter(word -> word.length() > 3)
    .map(word -> word.toUpperCase())
    .toList();
```

The stream version reads like a recipe: keep the long words, then make them upper case. The order of the steps matters: with `map` first and `filter` second, the filter would see the already transformed elements.

:::warning
`toList()` returns an **unmodifiable** list (available since Java 16). Calling `add` or `remove` on the result throws an `UnsupportedOperationException`. If you need a list you can change, create a new one: `new ArrayList<>(list)`.
:::
