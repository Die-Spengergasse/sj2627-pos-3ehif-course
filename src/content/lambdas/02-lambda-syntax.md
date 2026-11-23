---
title: "Lambda syntax and captured variables"
minutes: 9
status: draft
---

## Two forms

A lambda has parameters on the left of `->` and the body on the right. There are two forms of body:

```java
(parameters) -> expression

(parameters) -> {
    statements;
    return value;
}
```

```java
Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());

Predicate<Integer> isEven = (n) -> {
    return n % 2 == 0;
};
```

- **Expression body**: a single expression. Its value is returned automatically; you write no `return` and no `;` after the expression.
- **Block body**: braces, `return` and `;` like in a normal method. You need it when the body has several statements.

## Variations of the parameter list

```java
(Integer n) -> n % 2 == 0     // explicit parameter type
n -> n % 2 == 0               // type inferred (the usual style)
(n) -> n % 2 == 0             // parentheses are optional for exactly one parameter
() -> 42                      // no parameters: empty parentheses are required
(a, b) -> a + b               // several parameters: parentheses are required
```

You rarely write parameter types. The compiler infers them from the functional interface that the lambda is assigned to or passed to. This is called **target typing**: for `Predicate<Integer>`, the abstract method is `boolean test(Integer t)`, so `n` must be an `Integer` and the body must give a `boolean`.

The same lambda text can mean different things in different places:

```java
interface Greeter {
    String greet(String name);
}

Greeter formal = name -> "Good day, " + name + ".";
Greeter casual = name -> "Hey " + name + "!";

System.out.println(formal.greet("Ada"));   // Good day, Ada.
```

:::remember
`n -> n % 2 == 0` alone has no meaning. Only together with a target type (here `Predicate<Integer>`) does it become an object.
:::

## Using variables from the outside

A lambda may use local variables of the method around it:

```java
int threshold = 10;
Predicate<Integer> aboveThreshold = n -> n > threshold;   // OK
```

There is one rule: such a variable must be **effectively final**, meaning it is never reassigned after its initialization (you do not need to write `final`). The lambda captures the **value**, not a live link to the variable. If the variable could change later, the lambda and the surrounding code would silently work with different values.

```java
int threshold = 10;
Predicate<Integer> aboveThreshold = n -> n > threshold;   // compile error here: threshold is not effectively final
threshold = 20;   // ... because of this reassignment
```

:::warning
You also cannot change a captured local variable **inside** the lambda: `count++` on a captured `int count` does not compile. If you want to count elements, use a stream operation such as `count()` instead of an outer counter.
:::

The rule applies to **local variables and parameters**. Fields of an object can be read and changed from a lambda; it is only the local variable itself that cannot change.
