---
title: "Thread safety, enum singletons and trade-offs"
minutes: 9
status: draft
---

## The problem: two threads at once

The classic version has a hidden bug. Imagine two threads call `getInstance()` at nearly the same time while `instance` is still `null`:

1. Thread A checks `instance == null`: true.
2. Before A creates the object, thread B checks `instance == null`: also true.
3. Both create an object. **Now there are two instances.**

The naive lazy version is **not thread-safe**.

## Double-checked locking

One fix is to synchronize the creation, but only when it is really necessary:

```java
public class AppConfig {
    private static volatile AppConfig instance;

    private AppConfig() { }

    public static AppConfig getInstance() {
        if (instance == null) {
            synchronized (AppConfig.class) {
                if (instance == null) {
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }
}
```

- The **first check** avoids the expensive lock once the instance exists.
- `synchronized` lets only one thread at a time into the block.
- The **second check** is needed because another thread may have created the instance while we waited for the lock.
- `volatile` makes sure that other threads see a fully constructed object, never a half-initialized one.

It works, but it is complex and easy to get wrong. (Simpler alternatives are an *eager* instance, `private static final AppConfig INSTANCE = new AppConfig();`, or simply marking `getInstance()` as `synchronized`.)

## The enum singleton

There is a much shorter way: use an **enum with one constant**.

```java
public enum AppConfig {
    INSTANCE;

    private final Map<String, String> settings = new HashMap<>();

    public String get(String key) {
        return settings.get(key);
    }
}

AppConfig.INSTANCE.get("timeout");
```

Java guarantees that an enum constant is created **exactly once**, even with many threads. So this version is thread-safe "for free", and it is considered the **safest** way to write a Singleton.

:::remember
Classic lazy Singleton: private constructor + static `getInstance()`. It needs double-checked locking with `volatile` to be thread-safe. An enum with a single constant `INSTANCE` is thread-safe automatically.
:::

## Singletons in the wild

- `Runtime.getRuntime()`: one `Runtime` per JVM.
- `Desktop.getDesktop()`: one desktop integration per platform.
- Spring beans with the default scope `singleton`: one instance per application context.
- Loggers are often managed as singletons (one registry per name).

## Use with care

A Singleton is global state in disguise. Any class can reach it from anywhere, so it is hard to see who depends on it, and tests influence each other when they change its state. Before you reach for a Singleton, consider passing the object in (**dependency injection**), which frameworks like Spring do for you.

:::exercise id-generator
