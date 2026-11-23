---
title: "Pattern matching for instanceof"
minutes: 9
status: draft
---

## No more casting

Before Java 16, checking a type and using the object took two steps: test, then cast.

```java
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}
```

With **pattern matching**, you declare the variable inside the test:

```java
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

If `obj` is a `String`, it is assigned to the **pattern variable** `s`, which already has the right type. No cast is needed.

## Where is the pattern variable available?

The compiler allows `s` exactly where it is **certain** that the match succeeded:

```java
// s is in scope in the true block, and after && in the same condition
if (obj instanceof String s && s.length() > 5) {
    System.out.println(s);
}

// negated test with an early return
if (!(obj instanceof String s)) {
    return;                  // here s is NOT available
}
System.out.println(s.length());   // here s is available
```

In the second example the method is left when `obj` is not a `String`. So after the `if`, the match must have succeeded, and `s` can be used.

:::warning
With `||` the variable is not available: in `obj instanceof String s || s.isEmpty()` the right side may run when the match failed. The compiler rejects this.
:::

## Record patterns

You can also take a **record** apart in the test. This is called a record pattern (you saw it briefly in the record unit):

```java
public record Point(int x, int y) {}

public static void printPoint(Object obj) {
    if (obj instanceof Point(int x, int y)) {
        System.out.println("Point at (" + x + ", " + y + ")");
    }
}
```

If `obj` is a `Point`, its components are assigned to the variables `x` and `y` in one step.

## Nested patterns

Record patterns can be **nested**. You can use `var` to let the compiler infer the component types:

```java
record Address(String street, String city) {}
record Person(String name, Address address) {}

if (obj instanceof Person(var name, Address(var street, var city))) {
    System.out.println(name + " lives on " + street + " in " + city);
}
```

One `if` checks that `obj` is a `Person`, that its address is an `Address`, and extracts three values. Without patterns, this would take several casts and accessor calls.

:::remember
`obj instanceof Type name` tests and casts in one step. Record patterns `Point(int x, int y)` also destructure the record, and they can be nested.
:::
