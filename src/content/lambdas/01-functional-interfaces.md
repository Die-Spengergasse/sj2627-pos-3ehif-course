---
title: "Functional interfaces"
minutes: 8
status: draft
---

## From anonymous classes to lambdas

Before Java 8, passing a small piece of behaviour to a method meant writing an **anonymous inner class**. Here is a `Comparator` that compares strings by length:

```java
Comparator<String> byLength = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return Integer.compare(a.length(), b.length());
    }
};
```

Of these six lines, only `Integer.compare(a.length(), b.length())` carries meaning. The rest is boilerplate. With a **lambda expression**, the same object looks like this:

```java
Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());
```

Both versions create an object that implements `Comparator<String>`. The lambda only removes the noise: no class name, no method name, no `@Override`.

## What is a functional interface?

The compiler can only turn a lambda into an object if it knows which method the lambda implements. That works when the target type is a **functional interface**:

- an interface with **exactly one abstract method**,
- which may additionally have any number of `default` and `static` methods.

```java
@FunctionalInterface
interface Greeter {
    String greet(String name);          // the single abstract method

    default String greetTwice(String name) {   // allowed: has a body
        return greet(name) + " " + greet(name);
    }
}
```

The annotation `@FunctionalInterface` is optional, but useful: if somebody later adds a second abstract method, the compiler reports an error right there.

`Comparator` is a functional interface too. Its one abstract method is `compare`. (It also redeclares `equals` from `Object`, which does not count, and has many `default` and `static` methods.)

:::remember
A lambda expression is only valid where a functional interface is expected. The lambda is the implementation of that one abstract method.
:::

## The interfaces you meet most often

You do not have to write a functional interface for every use. The package `java.util.function` contains the standard ones. Four of them cover most cases:

| Interface | Method | Purpose |
|---|---|---|
| `Predicate<T>` | `boolean test(T t)` | a yes/no check |
| `Function<T, R>` | `R apply(T t)` | transform a `T` into an `R` |
| `Consumer<T>` | `void accept(T t)` | do something with a `T`, return nothing |
| `Supplier<T>` | `T get()` | produce a `T` from nothing |

```java
Predicate<Integer> isEven = n -> n % 2 == 0;
Function<String, Integer> length = s -> s.length();
Consumer<String> print = s -> System.out.println(s);
Supplier<String> greeting = () -> "Hello!";

System.out.println(isEven.test(4));        // true
System.out.println(length.apply("Java"));  // 4
```

This explains the streams you already wrote: `filter` expects a `Predicate<T>`, `map` expects a `Function<T, R>`, and `forEach` expects a `Consumer<T>`. So `numbers.stream().filter(n -> n % 2 == 0)` works because `Predicate<Integer>` has exactly one abstract method, `test`, and the lambda implements it.

:::warning
The interface name tells you the **role**, the lambda does not mention it. If you cannot tell what a lambda should return, look at the method it is passed to: `filter` wants a `boolean`, `map` wants any value, `forEach` wants nothing.
:::
