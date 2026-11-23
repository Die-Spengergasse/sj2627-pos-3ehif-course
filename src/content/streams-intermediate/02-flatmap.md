---
title: "flatMap: flattening nested data"
minutes: 7
status: draft
---

## The problem: a stream of lists

Sometimes each element contains **several** values itself. Mapping such elements gives you a stream of lists instead of a stream of values:

```java
List<List<Integer>> nested = List.of(
    List.of(1, 2), List.of(3, 4), List.of(5, 6)
);

var wrong = nested.stream()
    .map(list -> list.stream())     // List<Stream<Integer>>, still nested
    .toList();
```

`map` produced exactly one result per element, and that result is itself a stream. What you actually want is **one** flat stream with the numbers 1 to 6.

## flatMap flattens

`flatMap` takes a function that turns each element into a **stream** and then joins all these streams into one:

```java
List<Integer> flat = nested.stream()
    .flatMap(List::stream)
    .toList();
// [1, 2, 3, 4, 5, 6]
```

`List::stream` is the same as `list -> list.stream()`: it is a method reference of the "arbitrary object of a type" kind. For each inner list, `flatMap` gets its stream and puts the elements into the resulting stream one after the other.

The difference to `map`: with `map`, one element becomes **exactly one** new element. With `flatMap`, one element becomes **any number** of new elements (none, one or many).

## Example: words of sentences

A typical use is to split text into words:

```java
List<String> sentences = List.of("Hello world", "Java streams");

List<String> words = sentences.stream()
    .flatMap(s -> Arrays.stream(s.split(" ")))
    .toList();
// ["Hello", "world", "Java", "streams"]
```

`s.split(" ")` returns a `String[]`, and `Arrays.stream(...)` turns the array into a stream. Compare this with `map(s -> s.split(" "))`, which would give you a stream of arrays, two elements instead of four words.

:::remember
Use `flatMap` when your function returns a stream (or something you can turn into one) and you want the elements of all these streams in one flat stream. Typical cases: a list of lists, words of lines, items of orders.
:::

:::warning
The function you pass to `flatMap` must return a **`Stream`**, not a `List` or an array. `flatMap(s -> s.split(" "))` does not compile; you need `Arrays.stream(...)` around the array, or `.stream()` on the list.
:::
