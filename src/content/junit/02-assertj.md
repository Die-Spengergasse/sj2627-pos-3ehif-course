---
title: "AssertJ: fluent assertions"
minutes: 9
status: draft
---

## assertThat

JUnit ships its own assertions (`assertEquals(expected, actual)`), but in this course you use **AssertJ**. Its assertions read like a sentence, give detailed failure messages and offer many checks for strings, collections and exceptions. Everything starts with one static method:

```java
import static org.assertj.core.api.Assertions.assertThat;

assertThat(result).isEqualTo(42);
```

The **actual** value goes into `assertThat(...)`, and the checks follow as a chain. With JUnit's `assertEquals(expected, actual)` it is easy to swap the two arguments; with `assertThat(actual).isEqualTo(expected)` the roles are clear.

:::warning
`assertThat(x)` alone checks **nothing**. Without a method such as `isEqualTo` behind it, the test is always green. Make sure every `assertThat` ends in a check.
:::

## Common checks

```java
assertThat(actual).isEqualTo(expected);
assertThat(actual).isNotEqualTo(other);
assertThat(actual).isNull();
assertThat(actual).isNotNull();

assertThat(flag).isTrue();
assertThat(number).isZero().isNotNegative();
assertThat(price).isBetween(1, 10);

assertThat(text).startsWith("Hello").contains("World").hasSize(11);
assertThat(text).isEqualToIgnoringCase("hello world");
```

Checks can be **chained**, because each one returns the assertion object again:

```java
assertThat(result)
    .isNotNull()
    .isInstanceOf(Integer.class)
    .isEqualTo(42);
```

For `double` values use a tolerance, since floating point numbers are not exact: `assertThat(0.1 + 0.2).isCloseTo(0.3, within(0.0001))` (`within` is in the same static import class `Assertions`).

## Collections

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

assertThat(names)
    .hasSize(3)
    .contains("Alice")
    .doesNotContain("Dave")
    .allMatch(name -> name.length() > 2);
```

The important differences between the collection checks:

| Check | Passes if |
|---|---|
| `contains("a", "b")` | both are in the list (others may be, order does not matter) |
| `containsExactly("a", "b")` | exactly these elements **in exactly this order** |
| `containsExactlyInAnyOrder("b", "a")` | exactly these elements, any order |
| `isEmpty()` / `hasSize(n)` | no elements / exactly n elements |

Often you want to check one **property** of the elements, not the elements themselves. `extracting` maps them first:

```java
assertThat(people)
    .extracting(Person::name)
    .containsExactly("Alice", "Bob");
```

## Exceptions

Edge cases often mean "an exception must be thrown". Wrap the call in a lambda and use `assertThatThrownBy`:

```java
import static org.assertj.core.api.Assertions.assertThatThrownBy;

assertThatThrownBy(() -> calculator.divide(1, 0))
    .isInstanceOf(ArithmeticException.class)
    .hasMessageContaining("zero");
```

The lambda is needed so that the exception is thrown **inside** AssertJ, which can catch it and look at it. The test fails if no exception is thrown at all. (JUnit's own `assertThrows(Exception.class, () -> ...)` does the same; AssertJ's version reads better when you also check the message.)

:::remember
`assertThat(actual).isEqualTo(expected)`: the actual value goes in, the check is chained on. Use `containsExactly` when the order matters, `extracting` to check a property, and `assertThatThrownBy(() -> ...)` for exceptions.
:::

:::exercise shopping-cart
