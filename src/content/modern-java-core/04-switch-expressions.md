---
title: "Switch expressions and pattern matching"
minutes: 9
status: draft
---

## What's wrong with the old `switch`?

The classic `switch` is a **statement**: it cannot return a value, so you assign a variable in every branch. And if you forget a `break`, execution **falls through** into the next case:

```java
String result;
switch (day) {
    case MONDAY:
    case FRIDAY:
        result = "Work day";
        break;
    case SATURDAY:
    case SUNDAY:
        result = "Weekend";
        break;
    default:
        result = "Midweek";
}
```

## Arrow syntax: `switch` as an expression

With the arrow `->`, `switch` becomes an **expression** that yields a value:

```java
var result = switch (day) {
    case MONDAY, FRIDAY -> "Work day";
    case SATURDAY, SUNDAY -> "Weekend";
    default -> "Midweek";
};
```

- There is **no fall-through**: only the matching branch runs, no `break` needed.
- Several labels share one branch: `case MONDAY, FRIDAY`.
- Note the **semicolon** after the closing brace: the whole `switch` is the right-hand side of an assignment.
- A switch expression must be **exhaustive**: every possible value needs a branch. For an enum, listing all constants is enough; otherwise you need `default`.

:::exercise ticket-price

## Pattern matching in `switch`

Since Java 21, a `case` can check the **type** of a value and bind it to a variable at the same time:

```java
String formatted = switch (obj) {
    case Integer i -> "Integer: " + i;
    case String s -> "String: " + s;
    case null -> "null value";
    default -> "Unknown: " + obj;
};
```

In the branch `case String s`, `s` is already a `String`: no cast needed. `case null` handles `null` explicitly; without it, a `null` value would throw a `NullPointerException`.

Combined with **record patterns**, you can even take records apart:

```java
String text = switch (obj) {
    case Point(int x, int y) -> "Point at " + x + "/" + y;
    case Person(String name, int age) -> name + " (" + age + ")";
    default -> "Something else";
};
```

A branch may also `throw` instead of yielding a value, e.g. `default -> throw new IllegalArgumentException("…");`.

:::remember
Prefer the arrow form `case … ->` over the classic `case …:`. It returns a value, never falls through, and the compiler checks that every case is covered.
:::

:::exercise shape-area
