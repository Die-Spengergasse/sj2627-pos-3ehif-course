---
title: "Lifecycle, nesting and parameterized tests"
minutes: 9
status: draft
---

## Independent tests and the lifecycle

JUnit creates a **new instance of the test class for every test method**. So fields set in one test are not visible in the next, and the **order of the tests does not matter**. That is deliberate: tests must be independent.

To avoid repeating the *arrange* part in every test, use lifecycle annotations:

| Annotation | Runs |
|---|---|
| `@BeforeAll` | once before all tests of the class (the method must be `static`) |
| `@BeforeEach` | before **each** test method |
| `@AfterEach` | after each test method |
| `@AfterAll` | once after all tests (`static`) |

```java
class ShoppingCartTest {

    private ShoppingCart cart;

    @BeforeEach
    void setUp() {
        cart = new ShoppingCart();      // a fresh cart for every test
    }

    @Test
    void newCartIsEmpty() {
        assertThat(cart.isEmpty()).isTrue();
    }

    @Test
    void addedItemAppearsInItems() {
        cart.add("Tea", 300, 2);
        assertThat(cart.itemCount()).isEqualTo(2);
    }
}
```

Use `@BeforeAll` / `@AfterAll` only for something expensive that is shared and never changed (for example opening a connection). Most unit tests only need `@BeforeEach`.

:::warning
Do not let tests depend on each other ("test 2 uses what test 1 added"). Because every test gets its own instance and the order is not guaranteed, such a test fails randomly.
:::

## Readable names and nesting

`@DisplayName` gives a test (or class) a readable name for the result tree, with spaces and any characters:

```java
@Test
@DisplayName("adding the same name increases the quantity")
void addSameName() { ... }
```

With `@Nested` you group the tests of a larger class into **inner classes**, e.g. one for `add`, one for `remove`. Each nested class can have its own `@BeforeEach`, which runs *after* the one of the outer class:

```java
class ShoppingCartTest {

    @Nested
    @DisplayName("remove")
    class Remove {
        @Test
        void removingUnknownItemFails() { ... }
    }
}
```

The inner class is **not** `static`.

## Parameterized tests

Often you want the same test for many inputs. Instead of copying the method, use `@ParameterizedTest` and supply the data with a source annotation. The module `junit-jupiter-params` is already part of the course build.

```java
@ParameterizedTest
@CsvSource({ "1, 1, 2", "2, 3, 5", "-1, 1, 0" })
void addsNumbers(int a, int b, int expected) {
    assertThat(calculator.add(a, b)).isEqualTo(expected);
}
```

Every line is one run of the test, and the columns become the method parameters (converted to `int`, `String`, enums, ...). The most important sources:

| Source | Supplies |
|---|---|
| `@ValueSource(ints = {1, 2, 3})` | one literal value per run (`ints`, `strings`, `doubles`, ...) |
| `@CsvSource({"a, 1", "b, 2"})` | several values per run, inline |
| `@CsvFileSource(resources = "/data.csv")` | the same, from a CSV file |
| `@MethodSource("name")` | a method that returns a `Stream<Arguments>`, for complex objects |

```java
@ParameterizedTest
@ValueSource(strings = { "racecar", "radar", "madam" })
void palindromesAreRecognised(String word) {
    assertThat(isPalindrome(word)).isTrue();
}
```

:::remember
Every test gets a fresh instance, so use `@BeforeEach` for the shared arrange part and keep tests independent. Group with `@Nested`, name with `@DisplayName`, and replace copy-pasted tests with `@ParameterizedTest` plus `@ValueSource` or `@CsvSource`.
:::

## Best practices in a nutshell

- Test **one thing** per test method.
- Use descriptive names.
- Keep tests fast and independent.
- Tests are code too: keep them clean. (Writing tests *before* the code is the topic of the TDD module.)
