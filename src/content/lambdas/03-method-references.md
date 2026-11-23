---
title: "Method references"
minutes: 8
status: draft
---

## A shorthand for forwarding lambdas

Look at these two lines:

```java
words.stream().forEach(word -> System.out.println(word));
words.stream().forEach(System.out::println);
```

The lambda does nothing but pass its parameter to an existing method. A **method reference** says the same thing more briefly. The operator `::` separates the class or object from the method name, and there are no parentheses after the name, because the method is not called here: you only name it.

:::remember
Use a method reference when the lambda body is just `x -> someMethod(x)`, a single call of an existing method (or constructor) with exactly the parameters of the lambda.
:::

## Four kinds

| Kind | Example | Equivalent lambda |
|---|---|---|
| Static method | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| Instance method of a particular object | `System.out::println` | `x -> System.out.println(x)` |
| Instance method of an arbitrary object of a type | `String::toUpperCase` | `s -> s.toUpperCase()` |
| Constructor | `ArrayList::new` | `() -> new ArrayList<>()` |

The third kind is the one that confuses most people. In `String::toUpperCase`, there is no object before `::`, only the class name. The stream's element **becomes the object** the method is called on: for the element `"abc"`, it calls `"abc".toUpperCase()`. In the second kind (`System.out::println`), the object `System.out` is fixed, and the element is passed as the argument.

```java
Function<String, Integer> parse = Integer::parseInt;          // static
Consumer<String> print = System.out::println;                 // particular object
Function<String, String> upper = String::toUpperCase;         // arbitrary object
Supplier<List<String>> factory = ArrayList::new;              // constructor
```

Like a lambda, a method reference needs a functional interface as its target. The compiler checks that the signatures fit, and decides from that which kind it is.

## Method references in streams

Now the stream code from the last module reads naturally. `filter` takes a `Predicate`, `map` a `Function`, `forEach` a `Consumer`, and lambdas or method references are just values of those types:

```java
List<String> words = List.of("stream", "lambda", "java");

List<String> upper = words.stream()
    .map(String::toUpperCase)        // arbitrary object of a type
    .toList();

List<Integer> lengths = words.stream()
    .map(String::length)             // arbitrary object of a type
    .toList();

words.stream()
    .forEach(System.out::println);   // particular object
```

## Lambda or method reference?

A method reference and its lambda do the same job here. The method reference is usually shorter and gives the reader less to parse: `String::toUpperCase` says "call this method", with no parameter name to read.

A lambda is clearer when the body does more than forward, for example `word -> word.length() > 3`, or when a parameter name explains the meaning, like `price -> price * 1.2`. In such cases there is no single existing method to refer to.

:::warning
A method reference does not work when the parameters do not line up. `words.stream().map(w -> w.substring(1))` cannot become a method reference, because the lambda passes an extra argument. When in doubt, write the lambda; your IDE can convert it for you when it fits.
:::

:::exercise lambda-workshop

:::exercise operation-table
