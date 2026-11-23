---
title: "forEach and reduce"
minutes: 9
status: draft
---

## forEach: terminal action

`forEach` performs an action on every element and ends the pipeline. It is a terminal operation and returns nothing.

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

names.stream()
    .filter(n -> n.length() > 3)
    .forEach(System.out::println);
// Alice
// Charlie
```

:::warning
Prefer `toList()` over `forEach` for collecting results. Code like `stream.forEach(x -> result.add(x))` modifies a list outside the pipeline. That brings back exactly what streams avoid, and it breaks as soon as a stream runs in parallel.
:::

## reduce: many values become one

`reduce` combines all elements into **one** value by applying an operation again and again. In its first form, you give it a start value (the *identity*) and a function that combines two values:

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

int sum = numbers.stream()
    .reduce(0, (a, b) -> a + b);       // 15

int product = numbers.stream()
    .reduce(1, (a, b) -> a * b);       // 120
```

Here is how the sum is computed: start with `0`; combine it with `1`, which gives `1`; combine that with `2`, giving `3`; then `6`, `10` and finally `15`. In the lambda, `a` is the result so far and `b` the next element.

The identity must be a value that does not change anything: `0` for sums, `1` for products. For an empty stream, it is also the result, so `reduce(0, ...)` on no elements gives `0`.

## reduce without identity: Optional

Some operations have no sensible start value, like the maximum. Then you use `reduce` with just the function. The result may not exist (the stream could be empty), so it is returned as an `Optional`:

```java
List<Integer> values = List.of(3, 7, 2, 9, 5);

Optional<Integer> max = values.stream()
    .reduce(Integer::max);

max.ifPresent(System.out::println);   // 9
```

`Integer::max` is a method reference for `(a, b) -> Integer.max(a, b)`. For an empty list, `max` is an empty `Optional`, and `ifPresent` does nothing. You already know how to handle `Optional` from the first module.

:::remember
`reduce(identity, function)` returns a plain value and uses the identity for an empty stream. `reduce(function)` returns an `Optional`, because there may be no element at all.
:::

## Loop or stream?

Streams are not always better. They shine when the task is a chain of filtering, transforming and combining. A loop can be clearer when you need several mutable variables, an early `break`, or complex branching in the body. Choose the version that a reader understands fastest. Simple sums and maxima can also use special operations such as `mapToInt(...).sum()`; `reduce` is the general tool underneath.

:::exercise order-analysis
