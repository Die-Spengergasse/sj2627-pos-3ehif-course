---
title: "Enum basics"
minutes: 8
status: draft
---

## The problem with int constants

Imagine an order that is either pending, shipped or delivered. A common first attempt uses `int` constants:

```java
public class Order {
    public static final int PENDING = 0;
    public static final int SHIPPED = 1;
    public static final int DELIVERED = 2;

    private int status;
}
```

It works, but it is not safe: nothing stops you from writing `order.status = 42;`. It compiles, yet `42` is not a valid status. And if you print the status, you only see a number, not a meaning.

## Defining an enum

An **enum** is a type with a **fixed, known set of instances**. You list them once:

```java
public enum OrderStatus {
    PENDING, SHIPPED, DELIVERED
}
```

```java
OrderStatus status = OrderStatus.PENDING;
System.out.println(status);   // PENDING
```

Now the variable can only hold one of the three constants (or `null`). The compiler rejects anything else, and printing shows the name.

## `values()`, `valueOf()` and `ordinal()`

Every enum gets some methods for free:

```java
for (OrderStatus s : OrderStatus.values()) {
    System.out.println(s.ordinal() + ": " + s.name());
}
// 0: PENDING
// 1: SHIPPED
// 2: DELIVERED

OrderStatus s = OrderStatus.valueOf("SHIPPED");
```

- `values()` returns an array of all constants, in **declaration order**.
- `name()` returns the constant's name as a `String`; `ordinal()` its position, starting at 0.
- `valueOf(String)` turns a name back into the constant. If there is no such constant, it throws an `IllegalArgumentException`.

:::warning
Do not store `ordinal()` in a database or file. If somebody inserts a new constant in the middle, all numbers shift and your old data silently means something else.
:::

## Enums in `switch`

Enums work very well with the switch expressions you already know:

```java
String label = switch (status) {
    case PENDING -> "Waiting for confirmation";
    case SHIPPED -> "On its way";
    case DELIVERED -> "Completed";
};
```

Inside the `case`, you write the constant name **without** the enum name. Because the compiler knows all constants, it can check that your switch is **exhaustive**: no `default` is needed if every constant is covered. And if you later add a constant to the enum, every such switch stops compiling until you handle it. That is a feature: the compiler finds all places you forgot.

:::remember
An enum is a type with a closed set of instances. It is type-safe (no `42`), prints readably, and plays well with an exhaustive `switch`.
:::
