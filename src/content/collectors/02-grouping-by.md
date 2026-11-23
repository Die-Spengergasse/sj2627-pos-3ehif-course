---
title: "groupingBy and downstream collectors"
minutes: 10
status: draft
---

## Grouping into a map

`groupingBy` classifies the elements: you give it a **classifier function**, and it returns a map from each result of that function to the list of elements that produced it.

```java
record Person(String name, int age, String city) { }

Map<String, List<Person>> byCity = people.stream()
    .collect(Collectors.groupingBy(Person::city));
```

If the people are Ann (Graz), Ben (Wien) and Cleo (Graz), the map contains `Graz` with the list `[Ann, Cleo]` and `Wien` with the list `[Ben]`. Within a group the elements keep their stream order. The map itself does not promise any key order.

By default, the groups are lists. That is often not what you want: maybe you only need the **number** of people per city, or the average age. For that, `groupingBy` accepts a second argument.

## Downstream collectors

A **downstream collector** says what to do with the elements of each group. The group is not collected into a list, but handed to this second collector instead:

```java
// Count people per city
Map<String, Long> countByCity = people.stream()
    .collect(Collectors.groupingBy(
        Person::city,
        Collectors.counting()
    ));

// Average age per city
Map<String, Double> avgAgeByCity = people.stream()
    .collect(Collectors.groupingBy(
        Person::city,
        Collectors.averagingInt(Person::age)
    ));
```

Look at the **value type** of the resulting map: `counting()` gives a `Long`, `averagingInt(...)` a `Double`. The key type comes from the classifier. Other useful downstream collectors are `summingInt(...)` (sum of an `int` property, as an `Integer`), and `toSet()` and `joining(...)` that you know from the last unit.

## mapping: collect a property instead of the object

By default, the list of a group holds the whole elements. To store only one property of each, use `mapping`. It applies a function first, and then passes the result to another downstream collector:

```java
// Names per city
Map<String, List<String>> namesByCity = people.stream()
    .collect(Collectors.groupingBy(
        Person::city,
        Collectors.mapping(Person::name, Collectors.toList())
    ));
```

Read it from the inside out: `mapping(Person::name, toList())` means "take each person's name and collect these into a list". `groupingBy(Person::city, ...)` applies that per city.

:::remember
`groupingBy(classifier)` gives `Map<K, List<T>>`. `groupingBy(classifier, downstream)` lets you decide what happens with each group: `counting()`, `averagingInt(...)`, `mapping(function, collector)` and more. The collectors nest like building blocks.
:::

:::warning
A `Map` from `groupingBy` only contains keys that **occur**. A city with no people does not appear with a count of 0; it is missing. Plan for `map.get(city)` returning `null` (or use `getOrDefault`).
:::
