---
title: "partitioningBy and choosing a collector"
minutes: 7
status: draft
---

## Splitting in two

`partitioningBy` is a special grouping for a yes/no question. You give it a **predicate**, and it returns a map with exactly two keys: `true` for the elements that satisfy it and `false` for all others.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

Map<Boolean, List<Integer>> evenOdd = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));

System.out.println(evenOdd);     // {false=[1, 3, 5], true=[2, 4, 6]}
System.out.println(evenOdd.get(true));   // [2, 4, 6]
```

Compared to `groupingBy` with a boolean classifier, `partitioningBy` **always contains both keys**, even if one group is empty. Then you can call `get(true)` and `get(false)` safely, and you get an empty list instead of `null`.

## With a downstream collector

Like `groupingBy`, `partitioningBy` accepts a downstream collector as second argument:

```java
Map<Boolean, Long> countEvenOdd = numbers.stream()
    .collect(Collectors.partitioningBy(
        n -> n % 2 == 0,
        Collectors.counting()
    ));
// {false=3, true=3}
```

For an empty stream, you still get `{false=0, true=0}`.

## Which collector do I need?

| You want ... | Use |
|---|---|
| a list or a set | `toList()` / `toSet()` |
| a map with one value per key | `toMap(keyFn, valueFn)` |
| one string | `joining(separator)` |
| a map with a group of elements per key | `groupingBy(classifier)` |
| a number or a property per group | `groupingBy(classifier, downstream)` |
| exactly two groups (yes/no) | `partitioningBy(predicate)` |

In practice, many tasks combine the building blocks you saw: a `filter` or `map` in the stream, a collector at the end, and a downstream collector for what happens per group.

:::remember
`collect` is the most flexible terminal operation. `groupingBy` classifies into any number of groups, `partitioningBy` into exactly two (both keys always present), and downstream collectors decide what each group becomes.
:::

:::exercise sales-report

:::exercise word-frequency
