---
title: "TDD in action: FizzBuzz"
minutes: 9
status: draft
---

## The task

`FizzBuzz.of(n)` returns a `String` for a number `n`:

- `"Fizz"` if `n` is divisible by 3,
- `"Buzz"` if `n` is divisible by 5,
- `"FizzBuzz"` if `n` is divisible by both,
- otherwise the number itself as text.

We build it test by test. Follow along in your IDE if you like. Watch how little code each step adds.

## Lap 1: the number itself

**Red.** The test comes first, `FizzBuzz` does not even exist:

```java
@Test
void oneIsOne() {
    assertThat(FizzBuzz.of(1)).isEqualTo("1");
}
```

Let the IDE create the class and the method with a placeholder body (`throw new UnsupportedOperationException()`). Run: red, for the right reason.

**Green.** The simplest code that passes:

```java
class FizzBuzz {
    static String of(int n) {
        return "1";
    }
}
```

That looks like cheating, and it is allowed. The test is green, nothing to refactor. Next.

## Lap 2: force the generalization

**Red.** A second example breaks the constant:

```java
@Test
void twoIsTwo() {
    assertThat(FizzBuzz.of(2)).isEqualTo("2");
}
```

**Green.** Now `return "1"` is not enough, and the simplest honest fix is:

```java
static String of(int n) {
    return String.valueOf(n);
}
```

Using several examples to push the code from a constant to the general rule is called **triangulation**.

## Lap 3 and 4: Fizz and Buzz

```java
@Test
void threeIsFizz() {
    assertThat(FizzBuzz.of(3)).isEqualTo("Fizz");
}
```

Red. The smallest change:

```java
static String of(int n) {
    if (n % 3 == 0) return "Fizz";
    return String.valueOf(n);
}
```

Green. The same for `5` and `"Buzz"`: red, add `if (n % 5 == 0) return "Buzz";`, green. Every new `if` was demanded by a failing test.

## Lap 5: FizzBuzz

```java
@Test
void fifteenIsFizzBuzz() {
    assertThat(FizzBuzz.of(15)).isEqualTo("FizzBuzz");
}
```

Red: the code returns `"Fizz"`, because the `% 3` check comes first. Green: check the combined case first.

```java
static String of(int n) {
    if (n % 15 == 0) return "FizzBuzz";
    if (n % 3 == 0) return "Fizz";
    if (n % 5 == 0) return "Buzz";
    return String.valueOf(n);
}
```

## Refactor: the tests too

The code is fine. The **tests**, however, are five copies of the same shape. Tests are code too, so they get refactored. A parameterized test says the same in one place:

```java
@ParameterizedTest
@CsvSource({"1,1", "2,2", "3,Fizz", "5,Buzz", "15,FizzBuzz"})
void fizzBuzz(int input, String expected) {
    assertThat(FizzBuzz.of(input)).isEqualTo(expected);
}
```

Run again: green. A new case is now one more row, for example `"9,Fizz"` or `"10,Buzz"`. Notice that if such a row passes immediately, it adds confidence but did not drive any code. That is fine, but do not mistake it for a TDD lap.

:::remember
Small steps, one failing test at a time. Triangulate (more examples) to move from a hard-coded value to the general rule. Refactor the tests as well as the code.
:::

:::warning
A test that is green the very first time you run it is suspicious. Either the behavior already exists, or the test cannot fail. Make it red once (break the code on purpose) to be sure.
:::

## Your turn

The exercise is a different kata, the **String Calculator**. The tests are already written and ordered from easy to hard. Your job is the TDD discipline: make **one** test pass at a time, with the smallest change, then refactor.

:::exercise string-calculator
