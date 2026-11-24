---
title: "Clean code details: names, methods, constants, comments"
minutes: 8
status: draft
---

## Code is read far more often than written

You write a line once. You, your team and your future self read it dozens of times. Clean code is code that is cheap to **read**. Four habits get you most of the way.

## 1. Names that say what and why

A name should tell the reader what something *is* or *does*, without opening the declaration.

| Weak | Better | Why |
|---|---|---|
| `d`, `e`, `tmp` | `denomination`, `envelope` | Intent instead of abbreviation |
| `process(x)` | `breakdownPayment(payment)` | A verb that says what really happens |
| `getData()` | `totalValue()` | Says which data |
| `flag` | `isPaid`, `hasEnvelopes` | Booleans read like a question |

Rules of thumb: classes and records are **nouns** (`Envelope`), methods are **verbs** (`addDenomination`), booleans start with `is`, `has` or `can`. Use the language of the domain (`Denomination`, `Envelope`), not technical filler (`DataManager`, `Helper`). One word per concept: do not mix `payment`, `wage` and `amount` for the same thing.

## 2. Small methods

A method should do **one thing**, and its name should say which. If you need a comment to explain a block inside a method, that block wants to be a method of its own.

Here is a method from the kata, with the comments the author needed to explain it:

```java
public Envelope breakdownPayment(Integer payment) {
    // go over each denomination and check how many amounts of each bill is in the payment
    // then place it in the envelope
    return Stream.of(Denomination.values())
            .reduce(new Envelope(),
                    (envelope, denomination) -> {
                        // how big is the amount of the denomination in the payment
                        int amount = denomination.countAmountIn(payment - envelope.totalValue());
                        return envelope.addDenomination(denomination, amount);
                    },
                    (e1, e2) -> e1);
}
```

Extracting the inner lambda gives the step a name, and the comments disappear:

```java
public Envelope breakdownPayment(int payment) {
    ensurePositive(payment);
    return Stream.of(Denomination.values())
            .reduce(new Envelope(),
                    (envelope, denomination) -> fillWith(denomination, envelope, payment),
                    (e1, e2) -> e1);
}

private Envelope fillWith(Denomination denomination, Envelope envelope, int payment) {
    int stillMissing = payment - envelope.totalValue();
    return envelope.addDenomination(denomination, denomination.countAmountIn(stillMissing));
}
```

The algorithm is the same. The second version reads like a description of the algorithm, and each method fits on a screen without scrolling. Keep parameter lists short too: three or more parameters often hint that a concept is missing (a record that groups them).

## 3. No magic numbers

A **magic number** is a literal whose meaning the reader has to guess:

```java
if (age >= 18 && basket.size() <= 25) { /* ... */ }      // 18 of what? 25 of what?
```

Give it a name:

```java
private static final int ADULT_AGE = 18;
private static final int MAX_BASKET_SIZE = 25;

if (age >= ADULT_AGE && basket.size() <= MAX_BASKET_SIZE) { /* ... */ }
```

Constants are written in `UPPER_SNAKE_CASE`, are `static final`, and live in the class that owns the concept. When there is a *fixed set* of related values, an `enum` is even better. The kata does exactly this: the values `200, 100, 50, ...` are not scattered through the code, they are the `Denomination` enum, together with the behaviour that belongs to them. (Numbers like `0`, `1` or `2` in `i + 1` or `n / 2` are fine: their meaning is obvious.)

## 4. Comments only where they add something

A comment that repeats the code is noise, and it becomes a **lie** as soon as the code changes and the comment does not:

```java
// convenience constructor
public Envelope() { ... }              // adds nothing the code does not say

int count = rest / value;              // divide rest by value   <- useless
```

Good comments explain what the code *cannot* say:

- **Why** something is done in a surprising way (`// € 500 notes are excluded: banks no longer hand them out`)
- A **warning** about a non-obvious consequence
- The contract of a public API (Javadoc: parameters, exceptions)

Before you write a comment, ask: *can I rename something or extract a method so that the comment becomes unnecessary?* If yes, do that instead.

:::remember
Good names (nouns for types, verbs for methods), small single-purpose methods, named constants or enums instead of magic numbers, and comments that explain the *why*, never the *what*.
:::

:::warning
Do not overdo it. A method named `calculateTheTotalValueOfAllDenominationsInTheEnvelopeAndReturnIt` is not clean, just long. Aim for the shortest name that is still unambiguous in its context.
:::
