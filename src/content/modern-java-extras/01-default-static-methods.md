---
title: "Default and static methods in interfaces"
minutes: 9
status: draft
---

## Interfaces with behavior

Originally an interface could only declare methods; every implementing class had to write them. Since Java 8, an interface may also provide an implementation: a **default method**.

```java
public interface Greeter {
    String name();

    default String greet() {
        return "Hello, " + name() + "!";
    }
}
```

`greet()` is written once in the interface and calls the abstract method `name()`. Any class that implements `Greeter` only has to provide `name()`:

```java
public record Person(String name) implements Greeter {}

var p = new Person("Alice");
System.out.println(p.greet());   // Hello, Alice!
```

(The accessor `name()` that the record generates implements the abstract method `name()` of the interface.)

The original reason for default methods: you can **add a method to an existing interface without breaking** the classes that already implement it. They simply inherit the default.

## Conflicts between defaults

What if a class inherits the same default method from two interfaces? Java resolves it with three rules:

1. **A class wins over an interface.** If the class (or a superclass) defines the method, that one is used.
2. **A more specific interface wins.** If one interface extends the other, its version is used.
3. Otherwise there is a conflict, and the class **must override** the method itself.

```java
public interface A {
    default void sayHi() { System.out.println("Hi from A"); }
}
public interface B {
    default void sayHi() { System.out.println("Hi from B"); }
}
public class C implements A, B {
    public void sayHi() { A.super.sayHi(); }
}
```

`C` does not compile without its own `sayHi()`. Inside, the syntax `A.super.sayHi()` calls the default method of a specific interface. You may of course also write your own code instead.

## Static methods in interfaces

An interface can also contain `static` methods. They are utility methods that belong to the **interface itself**, not to instances:

```java
public interface MathUtils {
    static double circleArea(double radius) {
        return Math.PI * radius * radius;
    }

    static double celsiusToFahrenheit(double celsius) {
        return celsius * 9.0 / 5.0 + 32;
    }
}

double area = MathUtils.circleArea(2);
```

You always call them through the interface name. They are **not inherited** by implementing classes. With `class Geometry implements MathUtils {}`, both `Geometry.circleArea(2)` and `new Geometry().circleArea(2)` do not compile; only `MathUtils.circleArea(2)` works. You saw this idea in the Factory Method module: `Shape.circle(5)` is a static method of an interface.

:::remember
`default` gives an interface a method body that implementors inherit; `static` adds utility methods to the interface itself. When two interfaces clash, the class must override and can pick one with `A.super.method()`.
:::
