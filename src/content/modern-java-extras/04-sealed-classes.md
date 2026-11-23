---
title: "Sealed classes and exhaustive switch"
minutes: 10
status: draft
---

## Restricting who may extend a type

Normally anybody can implement your interface or extend your class. A **sealed** type lists exactly which classes are allowed to extend it, with `permits`:

```java
public sealed interface Shape
    permits Circle, Rectangle, Triangle {}

public record Circle(double radius) implements Shape {}
public record Rectangle(double width, double height) implements Shape {}
public record Triangle(double base, double height) implements Shape {}
```

Nobody else can implement `Shape`. The compiler now knows **all** possible subtypes, and that makes an exhaustive `switch` without `default` possible.

## Syntax

Sealed works for abstract and normal classes and for interfaces:

```java
public abstract sealed class Vehicle
    permits Car, Truck, Motorcycle {}

public final class Car extends Vehicle {}
public sealed class Truck extends Vehicle permits DumpTruck {}
public non-sealed class Motorcycle extends Vehicle {}
```

Every permitted subclass must say how the hierarchy continues. It has to be exactly one of:

- `final`: no further subclasses (records are implicitly final),
- `sealed`: further restricted with its own `permits`,
- `non-sealed`: open again, anybody may extend it.

The permitted classes must be in the same package (or module) as the sealed type. If they are in the **same file**, you can even leave out `permits`.

## Sealed types and pattern matching

```java
public static double area(Shape shape) {
    return switch (shape) {
        case Circle c    -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t  -> 0.5 * t.base() * t.height();
    };
}
```

There is no `default`. The compiler checks that **every permitted subtype is covered**. If you later add a fourth shape to `permits`, this switch (and every other like it) stops compiling until you handle the new case. With an ordinary interface, a forgotten case would only show up as a bug at runtime.

:::warning
If you leave out one of the permitted types, for example the `Triangle` branch above, the switch is not exhaustive and does not compile. A `default` would hide the problem, so avoid it for sealed types.
:::

:::remember
`sealed ... permits` fixes the set of subtypes. Subclasses are `final`, `sealed` or `non-sealed`. A switch over a sealed type needs no `default`, because the compiler checks that all subtypes are covered.
:::

:::exercise expression-evaluator
