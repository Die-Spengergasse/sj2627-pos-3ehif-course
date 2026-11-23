---
title: "filter and map in depth"
minutes: 8
status: draft
---

## filter selects

`filter` keeps the elements for which a predicate returns `true`. The result has the same element type and equal or fewer elements.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

List<Integer> even = numbers.stream()
    .filter(n -> n % 2 == 0)
    .toList();
// [2, 4, 6]
```

## filter with objects

Streams become more interesting with your own types. The examples in this module use a record:

```java
record Person(String name, int age, String city) { }
```

```java
List<Person> adults = people.stream()
    .filter(p -> p.age() >= 18)
    .toList();
```

You can call `filter` several times in a row. An element must pass **all** filters, so two filters act like `&&`:

```java
List<Person> named = people.stream()
    .filter(p -> p.name() != null)
    .filter(p -> !p.name().isEmpty())
    .toList();
```

The order matters here: the second filter calls `p.name().isEmpty()`, which would throw a `NullPointerException` for a `null` name. Because the first filter already removed those people, the second one is safe. Each element goes through the whole pipeline one after the other, so an element rejected by the first filter never reaches the second.

## map transforms

`map` applies a function to every element and collects the results. The number of elements stays the same, but the type may change.

```java
List<String> names = List.of("alice", "bob", "charlie");

List<String> capitalized = names.stream()
    .map(s -> s.substring(0, 1).toUpperCase() + s.substring(1))
    .toList();
// ["Alice", "Bob", "Charlie"]
```

If the lambda only calls one method of the element, a method reference is shorter:

```java
List<Integer> lengths = capitalized.stream()
    .map(String::length)
    .toList();
// [5, 3, 7]
```

:::remember
`filter` answers "do I keep this element?" with a `boolean`. `map` answers "what does this element turn into?" with a new value. Combine them freely: `people.stream().filter(p -> p.age() >= 18).map(Person::name).toList()` gives the names of all adults.
:::

:::warning
`map` never removes elements and `filter` never changes them. If a result has fewer elements than the source, look for a `filter`; if the elements look different, look for a `map`.
:::
