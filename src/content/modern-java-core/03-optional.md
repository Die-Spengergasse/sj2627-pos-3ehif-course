---
title: "Optional: values that may be missing"
minutes: 8
status: draft
---

## The problem with `null`

A method that looks something up may find nothing. Traditionally it then returns `null`, and the caller has to remember to check it. If they forget, the program crashes with a `NullPointerException`:

```java
String name = getUserName();
System.out.println(name.toUpperCase());  // NPE if name is null
```

Nothing in `String getUserName()` warns you that the result may be missing.

## `Optional` makes "maybe" visible

`Optional<T>` is a box that contains **either one value or nothing**. If a method returns `Optional<String>`, its signature says: "the result may be missing, deal with it".

```java
Optional<String> a = Optional.of("Hello");             // value must not be null
Optional<String> b = Optional.ofNullable(maybeNull);   // empty if maybeNull is null
Optional<String> c = Optional.empty();                 // explicitly empty
```

:::warning
`Optional.of(null)` throws a `NullPointerException`. For values that may be `null` (e.g. the result of `Map.get`), always use `Optional.ofNullable`.
:::

## Getting the value out

```java
Optional<String> email = findUserEmail(42);

email.ifPresent(e -> System.out.println(e));            // only runs if there is a value

var a = email.orElse("unknown@example.com");            // default value
var b = email.orElseGet(() -> generateDefault());       // default, only computed if needed
var c = email.orElseThrow(() -> new IllegalStateException("No email"));
```

There is also `isPresent()` and `get()`, but `get()` on an empty `Optional` throws an exception, so you are back to the original problem. Prefer `orElse`, `orElseGet`, `orElseThrow` and `ifPresent`.

## Best practices

- Use `Optional` as a **return type** for "may be missing".
- Do **not** use it for fields or method parameters.
- Do **not** call `get()` without checking; use the methods above instead.

:::remember
`Optional` is a return type that says "maybe". The caller decides what happens if the value is missing: a default, an exception, or nothing.
:::

:::exercise phone-book
