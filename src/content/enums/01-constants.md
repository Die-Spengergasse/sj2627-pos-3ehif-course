---
title: "Constants with static final"
minutes: 6
status: draft
---

## Magic numbers

Look at this line:

```java
if (retries > 3) {
    giveUp();
}
```

What does `3` mean? Is it the maximum number of attempts? Is it a timeout? Nobody knows without searching the code, and if the same `3` appears in five places, you have to change all of them when the rule changes. Such unexplained values are called **magic numbers** (or magic strings). The cure is to give the value a name:

```java
if (retries > MAX_RETRIES) {
    giveUp();
}
```

## Defining a constant

A constant in Java is a field that is both `static` and `final`:

```java
package at.example.shop;

public class Config {
    public static final int MAX_RETRIES = 3;
    public static final String DEFAULT_LOCALE = "en-US";
    public static final double TAX_RATE = 0.20;
}
```

You use it through the class name: `Config.MAX_RETRIES`.

- `static`: there is **one shared value per class**, not one per object.
- `final`: the value can be assigned **only once**; afterwards the compiler rejects every change.

By convention the names are written in `UPPER_SNAKE_CASE`, so that a constant is recognizable at first sight.

## Where to put constants

- A constant that only one class needs belongs **into that class**, as `private static final`.
- A constant that many classes share belongs into a dedicated class such as `Config` or `AppConstants`.
- If it improves readability, you can import a constant statically: `import static at.example.shop.Config.MAX_RETRIES;` (with the full package name) lets you write `MAX_RETRIES` without the class name.

:::warning The "constant interface" anti-pattern
Do not put constants into an interface just so that classes can `implements` it and use the names without a prefix:

```java
interface Constants {
    int MAX_RETRIES = 3;
}
class Client implements Constants { /* ... */ }
```

The constants then become part of the public API of `Client`, although they are only an implementation detail. Use a normal constants class and a static import instead.
:::

## When constants are not enough

Constants are perfect for **standalone** fixed values such as a tax rate. But if you have a small, closed set of alternatives (for example the states of an order), several constants are a poor tool. The next unit shows why, and what to use instead: **enums**.

:::remember
`static final` + `UPPER_SNAKE_CASE` gives a fixed value a meaningful name. Keep constants close to where they are used, and never use an interface as a constants container.
:::
