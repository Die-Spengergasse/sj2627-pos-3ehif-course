---
title: "Enums with fields, methods and behavior"
minutes: 9
status: draft
---

## Enums are classes

An enum is not just a list of names. It is a special kind of class: its constants are **objects**, and these objects can have fields, a constructor and methods.

## Fields and a constructor

You pass arguments to each constant in brackets. They are handed to the constructor, which stores them in fields:

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    VENUS(4.869e+24, 6.0518e6),
    EARTH(5.976e+24, 6.37814e6);

    private final double mass;
    private final double radius;

    Planet(double mass, double radius) {
        this.mass = mass;
        this.radius = radius;
    }
}
```

Note the **semicolon** after the last constant: once an enum has more than just constants, the list must be closed with `;`.

An enum constructor is **always private** (implicitly). You can never write `new Planet(...)`: the constants are the only instances that will ever exist.

## Methods

Enums can have methods and constants like any other class:

```java
public enum Planet {
    MERCURY(3.303e+23, 2.4397e6),
    EARTH(5.976e+24, 6.37814e6);

    private static final double G = 6.67300E-11;
    private final double mass;
    private final double radius;

    Planet(double mass, double radius) { /* ... */ }

    double surfaceGravity() {
        return G * mass / (radius * radius);
    }
}

System.out.println(Planet.EARTH.surfaceGravity());   // 9.802...
```

The constants are written first, then the fields, constructor and methods.

:::exercise coin-enum

## Behavior per constant

Sometimes every constant needs a **different** implementation of a method. One solution is a `switch` inside the method. A second solution: declare the method `abstract` in the enum, and give **each constant its own body** that implements it:

```java
public enum Operation {
    PLUS  { public int apply(int a, int b) { return a + b; } },
    MINUS { public int apply(int a, int b) { return a - b; } };

    public abstract int apply(int a, int b);
}

int result = Operation.PLUS.apply(3, 4);   // 7
```

Each constant is then an anonymous subclass of the enum. The compiler forces you to implement `apply` for every constant, so you cannot forget one.

:::exercise discount-enum

## Constants or enum?

Use **constants** for standalone fixed values (a tax rate, a timeout). Use an **enum** when a value is one of a closed set of alternatives (a status, a weekday, a size). If you find yourself writing several related constants such as `SMALL = 0`, `MEDIUM = 1`, `LARGE = 2`, that is the sign to use an enum.

:::remember
Enum constants are objects: they can have fields (set by a private constructor), methods, and even their own method bodies. Prefer an enum over related `int` constants.
:::
