---
title: "collect: toList, toSet, toMap, joining"
minutes: 9
status: draft
---

## What is collect?

`collect` is a terminal operation that gathers the elements of a stream into a **result container**: a list, a set, a map or a string. What exactly is built is decided by a **collector** that you pass in. The factory methods for collectors are in the class `java.util.stream.Collectors`:

```java
import java.util.stream.Collectors;

List<String> result = stream.collect(Collectors.toList());
```

`collect` is more flexible than `reduce`: `reduce` combines values into one value, while `collect` is made for accumulating into a **mutable** container such as a list or a map. Most of the time you do not write the collector yourself, but pick one from `Collectors`.

## toList and toSet

```java
List<String> filtered = words.stream()
    .filter(s -> s.length() > 3)
    .collect(Collectors.toList());
```

Since Java 16, you can write `.toList()` directly on the stream. It is shorter and returns an **unmodifiable** list, while `Collectors.toList()` makes no promise about the list type (in practice an `ArrayList`). Use `toList()` unless you really need `collect`, or old code requires it.

`Collectors.toSet()` puts the elements into a `Set`, which removes duplicates:

```java
Set<String> unique = words.stream()
    .map(String::toLowerCase)
    .collect(Collectors.toSet());
```

A `Set` does not guarantee any order, so do not rely on the order of the elements.

## toMap

`toMap` needs two functions: one for the **key** and one for the **value** of each element.

```java
record Person(int id, String name, String city, int age) { }

Map<Integer, String> idToName = people.stream()
    .collect(Collectors.toMap(
        Person::id,       // key mapper
        Person::name      // value mapper
    ));
```

:::warning
If two elements produce the **same key**, `toMap` throws an `IllegalStateException` ("Duplicate key ..."). Use it only when the keys are unique, such as ids. If keys can repeat, you need grouping (next unit) or a merge function as a third argument.
:::

## joining

For streams of strings, `joining` glues the elements together into **one `String`**:

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

String plain = names.stream().collect(Collectors.joining(", "));
// "Alice, Bob, Charlie"

String bracketed = names.stream().collect(Collectors.joining(", ", "[", "]"));
// "[Alice, Bob, Charlie]"
```

The first argument is the separator between elements, the optional second and third are a prefix and a suffix. `joining` works on a `Stream<String>` (or another `CharSequence`). If your elements are objects, `map` them first, e.g. `.map(Person::name)`.

:::remember
`toList` and `toSet` collect into collections, `toMap(keyFunction, valueFunction)` into a map (duplicate keys fail), `joining(separator, prefix, suffix)` into a string.
:::
