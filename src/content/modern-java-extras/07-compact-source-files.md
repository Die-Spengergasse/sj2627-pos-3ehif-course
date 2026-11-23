---
title: "Compact source files"
minutes: 6
status: draft
---

## Too much ceremony for Hello World

The smallest traditional Java program needs a class, a `public static void main` and `String[] args`, and a beginner must understand all of that before printing one line:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Java 25 (JEP 512, the finished version of the feature that started as JEP 477) lets small programs skip this boilerplate.

## The compact form

```java
// HelloWorld.java: no class declaration needed
void main() {
    System.out.println("Hello, World!");
}
```

- The compiler wraps the file in an **implicit, unnamed top-level class**.
- `main` can be an **instance method** and needs no `String[] args`.
- Fields and helper methods can live in the same file:

```java
int counter = 0;

void increment() {
    counter++;
}

void main() {
    increment();
    increment();
    System.out.println("Counter: " + counter);
}
```

You can run such a file directly, for example with `java HelloWorld.java`.

:::warning
Compact source files are meant for **small programs, scripts and learning**. They are not a replacement for regular classes in larger projects: there you still want named classes, packages and normal structure.
:::

:::remember
A file with just `void main() { ... }` is a complete Java program. The compiler adds the class around it. Use it for quick experiments, not for big applications.
:::
