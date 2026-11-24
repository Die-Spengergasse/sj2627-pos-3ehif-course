---
title: "FIRST: properties of good tests"
minutes: 8
status: draft
---

## What makes a test good?

A test suite helps only if you **run it often and trust it**. The acronym **FIRST** collects five properties that make this happen.

| Letter | Property | In one sentence |
|---|---|---|
| **F** | Fast | A unit test runs in milliseconds. |
| **I** | Independent (isolated) | No test depends on another test or on shared state. |
| **R** | Repeatable | Same result every time, in every environment. |
| **S** | Self-validating | The test itself says pass or fail, no human reads output. |
| **T** | Timely | Written at the right time: just before the production code. |

## Fast

Unit tests should run in **milliseconds**, so that you can run the whole suite after every small change. That rules out databases, network calls, real files and `Thread.sleep` in unit tests. If the suite takes ten minutes, developers stop running it, and then the tests no longer protect anything.

```java
// bad: a unit test that talks to a real server
@Test
void loadsUser() {
    var user = new HttpUserClient("https://example.org").load(7);
    assertThat(user.name()).isEqualTo("Alice");
}
```

The fix is not to avoid testing the logic, but to **separate** it from the slow parts: test the logic with in-memory data and replace the slow dependency by a test double (see the last unit).

## Independent

Each test must be able to run **alone** and in **any order**. It must not rely on a test that ran before, and must not leave something behind for the next test.

```java
// bad: shared mutable state, tests depend on the order
class CartTest {
    private static final Cart cart = new Cart();

    @Test void addsTea()    { cart.add("Tea");    assertThat(cart.size()).isEqualTo(1); }
    @Test void addsCoffee() { cart.add("Coffee"); assertThat(cart.size()).isEqualTo(1); } // fails if run second
}
```

```java
// good: a fresh object for every test
class CartTest {
    private Cart cart;

    @BeforeEach
    void setUp() {
        cart = new Cart();
    }

    @Test void addsTea()    { cart.add("Tea");    assertThat(cart.size()).isEqualTo(1); }
    @Test void addsCoffee() { cart.add("Coffee"); assertThat(cart.size()).isEqualTo(1); }
}
```

JUnit creates a **new instance of the test class for every test method**, so a normal (non-static) field is already fresh each time. `static` fields, singletons, files and databases are what leak between tests.

## Repeatable

A repeatable test gives the **same result** on your laptop, on a colleague's machine and on the build server, today and tomorrow. Typical enemies are the current time, random numbers, the order of a `HashSet`, the default locale or time zone, and external systems.

```java
// bad: depends on today's date
boolean isWeekend() {
    return LocalDate.now().getDayOfWeek().getValue() >= 6;
}
```

Pass the varying part in instead: take a `LocalDate` or a `Clock` as a parameter, and the test decides what "today" is.

```java
boolean isWeekend(LocalDate date) {
    return date.getDayOfWeek().getValue() >= 6;
}

@Test
void saturdayIsWeekend() {
    assertThat(isWeekend(LocalDate.of(2026, 11, 28))).isTrue();
}
```

A test that sometimes fails for no reason is called **flaky**. Flaky tests are worse than no tests, because people learn to ignore red.

## Self-validating

The test decides on its own whether it passed. Printing a value and looking at it is not a test.

```java
// bad: a human has to read the console
@Test
void total() {
    System.out.println(cart.total());
}

// good: the assertion is the verdict
@Test
void total() {
    assertThat(cart.total()).isEqualTo(750);
}
```

Also avoid tests without any assertion: they are green even if the code does nothing. A test that expects an exception must say so with `assertThatThrownBy` or `assertThrows`.

## Timely

Write the tests at the right time: **just before** the production code, as in TDD. Tests written weeks later are written for code that is already hard to test, and by then you are tempted to skip them. Tests that come first also protect you from writing code that nobody needs.

:::remember
**F**ast, **I**ndependent, **R**epeatable, **S**elf-validating, **T**imely. When a test is annoying, slow, or flaky, check the five letters: one of them is usually violated.
:::

:::warning
Do not confuse "independent" with "one assert per test". A test can have several assertions about one behavior. It must not depend on **other tests** or on state they leave behind.
:::
