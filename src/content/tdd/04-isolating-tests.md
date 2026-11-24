---
title: "Isolating tests with test doubles"
minutes: 8
status: draft
---

## The problem: dependencies

Most classes do not work alone. A `Cart` asks a price service, an `OrderService` sends mails, a `Report` reads a database. If the test uses the real dependency, the test becomes slow (F), depends on outside state (I), and may give different results on different days (R).

The solution is to give the class under test a **test double**: a stand-in object that looks like the real dependency but is simple and under your control. The class must make this possible by receiving its dependency from outside (constructor parameter) instead of creating it with `new` itself.

## Stub: provides answers

A **stub** returns fixed answers. Here is a `Cart` that depends on a price service:

```java
interface PriceService {
    int priceCents(String product);
}

class Cart {
    private final PriceService prices;
    private final List<String> items = new ArrayList<>();

    Cart(PriceService prices) { this.prices = prices; }

    void add(String product) { items.add(product); }

    int totalCents() {
        return items.stream().mapToInt(prices::priceCents).sum();
    }
}
```

The test needs no database, no network. Since `PriceService` has a single method, a lambda is enough as stub:

```java
@Test
void totalIsSumOfPrices() {
    PriceService prices = product -> product.equals("Tea") ? 250 : 400;
    var cart = new Cart(prices);

    cart.add("Tea");
    cart.add("Coffee");

    assertThat(cart.totalCents()).isEqualTo(650);
}
```

Such a hand-written double is also called a **fake** when it is a small working implementation (for example an in-memory list instead of a database).

## Mock: also checks the calls

Sometimes the **result** of the code is a call to a collaborator: "a mail must be sent". A **mock** records the calls so that the test can verify them afterwards. Libraries such as **Mockito** create stubs and mocks for you:

```java
PriceService prices = mock(PriceService.class);
when(prices.priceCents("Tea")).thenReturn(250);   // stub the answer

var cart = new Cart(prices);
cart.add("Tea");

assertThat(cart.totalCents()).isEqualTo(250);
verify(prices).priceCents("Tea");                 // check the interaction
```

Mockito is not part of this course's exercises, but it is the standard tool in many Java projects, so you should know what the three calls `mock`, `when ... thenReturn` and `verify` are for.

## Use doubles with care

- **Prefer state over interaction.** Assert on the result (`totalCents`), and use `verify` only when the call itself is the observable outcome (sending the mail). A test full of `verify` calls is tied to the implementation and breaks on every refactoring.
- **Do not mock what you own and can create cheaply.** A `record` or a simple value object is used as it is, never mocked.
- **Do not mock the class under test.** Then you test the mock, not your code.
- Doubles are for the **slow or uncontrollable** parts: network, database, clock, random numbers, e-mail.

## Common pitfalls of TDD, in one list

- Writing too much code in the Green phase.
- Skipping the Refactor phase.
- Writing tests that are too large (several behaviors in one test, so a failure does not tell you what is broken).
- Not running the tests often enough. Run them after every small step.
- Not watching the test fail first.

:::remember
A test double replaces a slow or uncontrollable dependency. A **stub** gives answers, a **mock** also verifies calls. To make this possible, pass dependencies in through the constructor instead of creating them inside the class.
:::

:::warning
If a class creates its dependency with `new` inside a method, you cannot replace it in a test. That is one more way in which TDD shapes your design: code that is hard to test is usually code with hidden dependencies.
:::
