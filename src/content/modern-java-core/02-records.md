---
title: "Records: immutable data carriers"
minutes: 9
status: draft
---

## One line instead of fifty

Many classes only carry data: a point, a person, an order line. Writing them by hand means private final fields, a constructor, getters, `equals`, `hashCode` and `toString`. A **record** (Java 16+) does all of that in one line:

```java
public record Person(String name, int age) {}
```

The components in brackets become `private final` fields. Java generates

- a constructor with all components: `new Person("Alice", 17)`,
- an **accessor** per component: `name()` and `age()` (no `get` prefix!),
- `equals` and `hashCode` that compare the **values**,
- `toString`: `Person[name=Alice, age=17]`.

A record is **immutable**: there are no setters, and the fields cannot change after construction.

## Using records

```java
var p = new Point(3, 4);
System.out.println(p.x());   // 3 (accessor, not getX!)
System.out.println(p);       // Point[x=3, y=4]

var q = new Point(3, 4);
System.out.println(p.equals(q));  // true: same values
```

Two records with the same values are equal, even though they are different objects. With a normal class, `equals` would compare references unless you override it.

## Validation in the compact constructor

A record should never hold invalid data. You check the values in a **compact constructor**: it has no parameter list, and the assignment to the fields happens automatically afterwards.

```java
public record Point(int x, int y) {

    public Point {
        if (x < 0 || y < 0) {
            throw new IllegalArgumentException("Negative coordinates");
        }
    }

    public double distanceFromOrigin() {
        return Math.sqrt(x * x + y * y);
    }
}
```

As you see, a record can also have **methods**. Inside, you use the components (`x`, `y`) directly.

:::remember
Records are for **data**: immutable, compared by value, validated once in the compact constructor. If an object has to change its state, use a normal class.
:::

## Record patterns

Since Java 21 you can take a record apart in one step with a **record pattern**:

```java
if (obj instanceof Point(int x, int y)) {
    System.out.println(x + ", " + y);
}
```

If `obj` is a `Point`, its components land in the new variables `x` and `y`. You will meet this again with `switch`.

:::exercise temperature-range
