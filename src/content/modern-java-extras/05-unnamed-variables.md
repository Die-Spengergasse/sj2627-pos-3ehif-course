---
title: "Unnamed variables"
minutes: 7
status: draft
---

## Variables you do not need

Sometimes the syntax forces you to declare a variable that you never use: the exception in a `catch`, the element in a loop that only counts, a record component you do not care about. An unused name is noise, and it invites the question "did the author forget to use it?".

Since Java 22, you can write an underscore `_` instead of the name. It says: "this variable is intentionally unused".

```java
// Before
try {
    int count = processItems();
} catch (Exception e) {
    // e is never used
    System.out.println("Error occurred");
}

// After
try {
    int count = processItems();
} catch (Exception _) {
    System.out.println("Error occurred");
}
```

## In loops

```java
for (var item : items) {
    counter++;
}

for (var _ : items) {
    counter++;
}
```

Use `_` when you iterate only to repeat something and do not need the element. You cannot read an unnamed variable: it has no name.

## In patterns

Record patterns often contain components you ignore:

```java
if (obj instanceof Point(int x, int _)) {
    System.out.println("x = " + x);
}

String result = switch (obj) {
    case Integer _ -> "It's a number";
    case String _  -> "It's a string";
    default        -> "Unknown";
};
```

In the first example only `x` is needed. In the `switch`, we test only the **type** and do not need the value, so `Integer _` is enough. You can mix named and unnamed components, and `var _` works as well:

```java
record Person(String name, int age, String email) {}

if (obj instanceof Person(var name, int _, String _)) {
    System.out.println("Name: " + name);
}
```

## Resources

A `try`-with-resources statement sometimes opens a resource only so that it gets closed automatically:

```java
try (var _ = new Scanner(System.in)) {
    // the resource is opened but not directly used
}
```

:::remember
`_` replaces the name of a variable you never use: in `catch`, loops, patterns and `try`-with-resources. It documents intent, and the compiler prevents you from using it by accident.
:::
