---
title: "Flexible constructor bodies"
minutes: 7
status: draft
---

## The old rule: super() first

A constructor of a subclass has to call a constructor of its superclass with `super(...)`. For a long time, this call had to be the **very first statement**. So you could not validate an argument before passing it on:

```java
public class Account {
    protected final String owner;

    public Account(String owner) {
        this.owner = owner;
    }
}

public class SavingsAccount extends Account {
    private final double rate;

    public SavingsAccount(String owner, double rate) {
        if (rate < 0) {                       // error before Java 25
            throw new IllegalArgumentException("Negative rate");
        }
        super(owner);
        this.rate = rate;
    }
}
```

The only workaround was to hide the check in a static helper method that you call inside `super(...)`, which is clumsy.

## Statements before super()

Flexible constructor bodies (final in Java 25, first previewed in Java 22) allow statements **before** `super(...)` or `this(...)`, as long as they do **not** use the object that is being constructed. So the example above is valid: the check only uses the parameter `rate`.

:::warning
Before `super(...)`, the object does not exist yet. You may use parameters, local variables and static methods, and you may `throw`. You may **not** read instance fields, call instance methods or use `this`.
:::

## Typical use cases

Validate an argument first:

```java
public class ValidatedHashMap<K, V> extends HashMap<K, V> {
    public ValidatedHashMap(Map<K, V> source) {
        if (source == null) {
            throw new IllegalArgumentException("source must not be null");
        }
        super(source);   // super is not first, and that is fine now
    }
}
```

Prepare an argument for the superclass constructor:

```java
public class Logger extends PrintWriter {
    public Logger(String path) throws IOException {
        var normalized = path.strip().replace('\\', '/');   // preparation
        super(normalized);
    }
}
```

A failing check now happens **before** the superclass constructor does any work, instead of after it.

:::remember
In Java 25 you may run code before `super(...)`: validate and prepare with parameters and local variables. What you must not touch is the instance under construction.
:::
