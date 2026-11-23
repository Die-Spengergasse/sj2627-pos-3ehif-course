---
title: "var: local variable type inference"
minutes: 6
status: draft
---

## Less repetition

Since Java 10 you can write `var` instead of the type of a **local variable**. The compiler infers the type from the value on the right-hand side.

```java
// Before
String message = "Hello, World!";
ArrayList<String> names = new ArrayList<String>();

// With var
var message = "Hello, World!";        // String
var names = new ArrayList<String>();  // ArrayList<String>
```

`var` does **not** make Java dynamically typed. `message` is still a `String`, and the compiler rejects `message = 42;` exactly as before. You just don't have to write the type twice.

:::remember
Use `var` when the type is **obvious** from the right-hand side, e.g. after `new`, a literal or a well-named factory method like `List.of(…)`.
:::

## Where `var` works, and where it doesn't

`var` is only for **local variables**: variables inside a method, including loop variables. It does not work for

- fields (attributes of a class),
- method parameters,
- return types.

And the variable must be **initialized** right away, with a value whose type the compiler can determine:

```java
var count = 42;      // ok: int
var name = "Alice";  // ok: String

var x;               // error: no value, no type
var y = null;        // error: null has no usable type
```

## `var` with collections and loops

`var` shines when types get long, for example with nested generics or in loops:

```java
var scores = new HashMap<String, List<Integer>>();

for (var entry : scores.entrySet()) {
    var name = entry.getKey();      // String
    var points = entry.getValue();  // List<Integer>
}
```

Without `var`, the loop variable would be `Map.Entry<String, List<Integer>> entry`.

:::warning When `var` hurts readability
`var result = service.process(data);` hides what `result` is. If a reader has to look up a method to understand the type, write the type out.
:::
