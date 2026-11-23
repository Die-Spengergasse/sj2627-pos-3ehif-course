---
title: "The Singleton pattern"
minutes: 7
status: draft
---

## Things that should exist only once

Some objects make sense only **once** per application: the configuration, a connection pool, a registry of loggers. If there were two configurations, one part of the program might read different values than another.

You could create one object and pass it as an argument through every method and constructor. That works, but it is tedious. The **Singleton** pattern solves the problem differently.

:::remember
**Singleton**: a creational design pattern that ensures a class has **exactly one instance** and provides a **global point of access** to it.
:::

A Singleton class does three things:

- Its **constructor is private**, so nobody outside the class can write `new`.
- The class **manages its single instance itself**, in a `private static` field.
- Everybody else gets the instance through a **static method** (or field).

## The classic implementation

```java
public class AppConfig {
    private static AppConfig instance;

    private AppConfig() {
        // load the configuration
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
        }
        return instance;
    }
}
```

Using it:

```java
AppConfig config = AppConfig.getInstance();
```

How does it work? The first call finds `instance == null` and creates the object. Every later call finds the existing object and returns it. Because the constructor is private, `new AppConfig()` outside the class does not compile, so no second instance can sneak in.

This is called **lazy initialization**: the instance is only created when it is needed for the first time. If the program never calls `getInstance()`, the object is never created.

:::warning
Calling `getInstance()` twice returns the **same** object: `AppConfig.getInstance() == AppConfig.getInstance()` is `true`. If your version can return different objects, it is not a Singleton.
:::
