---
title: "Factory methods in the JDK"
minutes: 6
status: draft
---

## You have used them already

Factory methods are everywhere in the standard library. You met several of them in the last units:

```java
Optional<String> present = Optional.of("value");
Optional<String> empty   = Optional.empty();
Optional<String> maybe   = Optional.ofNullable(getName());

List<String> names = List.of("Alice", "Bob");
Map<String, Integer> ages = Map.of("Alice", 30);

Calendar cal = Calendar.getInstance();
```

None of these classes has a public constructor you can call. There is no `new Optional<>()` for you. The static factory method **controls the creation**:

- `Optional.empty()` does not create a new object each time; it returns a **shared** `EMPTY` instance.
- `Optional.of(value)` rejects `null`, and `Optional.ofNullable(value)` picks between a real value and the empty instance.
- `List.of(...)` and `Map.of(...)` return **immutable** collections, and the concrete class (you never see which one) may depend on the number of elements.
- `Calendar.getInstance()` returns a calendar suitable for the current locale: the caller does not name the concrete class.

## Naming conventions

Factory methods usually have recognizable names:

| Name | Meaning |
|---|---|
| `of(...)` | create from the given values (`List.of`, `Optional.of`) |
| `ofNullable(...)` | like `of`, but tolerates `null` |
| `empty()` | the empty variant |
| `getInstance()` | get an instance (often shared) |
| `valueOf(...)` | convert from another type (`Integer.valueOf("5")`) |

:::warning
Do not confuse a factory method with the Singleton pattern. `getInstance()` often returns a shared instance, but a factory method may just as well return a **new** object every time. The point of a factory is that the **method** decides what to create.
:::

:::remember
A factory method hides the concrete class, can validate, cache or choose a subtype, and can have a descriptive name. In the JDK: `Optional.of/empty/ofNullable`, `List.of`, `Map.of`, `Calendar.getInstance()`.
:::

:::exercise notifier-factory
