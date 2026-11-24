---
title: "Why tests? Your first JUnit test"
minutes: 8
status: draft
---

## Why automated tests?

A **unit test** checks one small unit of code (a method or a class) in isolation. It is code that calls your code and compares the result with what you expect. Good unit tests are:

- **fast**: hundreds run in a few seconds,
- **automated and repeatable**: no clicking, same result every time,
- **a safety net**: when you change code later, a failing test tells you immediately what you broke.

:::remember
A test should fail for **only one reason**. If a test can fail for five different reasons, a red test does not tell you what is wrong.
:::

## JUnit Jupiter

**JUnit** is the standard test framework for Java. The part you write against is called **JUnit Jupiter**: the annotations (`@Test`, `@BeforeEach`, ...) and the classes around them. A second part, the JUnit Platform, finds and runs the tests, so IntelliJ and Gradle can start them. (JUnit Vintage, which runs old JUnit 4 tests, you will not need.)

A test is a method with the annotation `@Test`:

```java
import org.junit.jupiter.api.Test;

class CalculatorTest {

    @Test
    void addsTwoNumbers() {
        // ...
    }
}
```

Test classes and methods can be package-private (no `public` needed), and a test method returns `void` and takes no parameters.

## Arrange, Act, Assert

Every good test has the same three parts:

1. **Arrange** (also *Given*): prepare the objects and the input.
2. **Act** (also *When*): call the one thing you test.
3. **Assert** (also *Then*): compare the result with your expectation.

```java
@Test
void divideDividesTwoNumbers() {
    // arrange
    var calculator = new Calculator();

    // act
    int result = calculator.divide(100, 10);

    // assert
    assertThat(result).isEqualTo(10);
}
```

The assertion (`assertThat`, from AssertJ) is covered in the next unit. If the assertion fails, the test is **red**; if the method runs through without a failed assertion or an unexpected exception, it is **green**.

## Happy path and edge cases

Test both sides of your method:

- The **happy path**: it does what it should for normal input (`divide(100, 10)` is 10).
- The **edge cases**: it fails *as expected* for bad input or at the borders (`divide(1, 0)` must throw an exception, an empty list, the value 0, the largest allowed value).

## Naming a test

The test name is documentation: when the test is red, the name is the first thing you read. Say **what is expected**, not just which method is tested:

| Weak | Better |
|---|---|
| `test1`, `testDivide` | `divideDividesTwoNumbers` |
| `testAddItem` | `addingSameNameIncreasesQuantity` |
| `exceptionTest` | `divisionByZeroIsRejected` |

## Running tests

- **IntelliJ**: click the green arrow in the gutter next to the class or a single method, or right-click the test folder and choose *Run Tests*. The result tree shows green and red tests; click a red one to see the message.
- **Gradle**: `./gradlew test` runs all tests of the project (on Windows `gradlew.bat test`). The build files of the course already contain JUnit and AssertJ.

:::warning
A test that you have never seen **fail** may be worthless (for example because it asserts nothing). That is why the exercises of this course come with tests that are red until you implement the code.
:::

:::remember
`@Test` marks a test method. Structure it as Arrange, Act, Assert, test happy path and edge cases, and name the test after the expected behaviour.
:::
