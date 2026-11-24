---
title: "The class box"
minutes: 7
status: draft
---

## Why UML?

**UML** (Unified Modeling Language) is a standard notation for drawing software structures. You use it to plan a design before you write code, to explain code to teammates, and to document it afterwards. Later in this course the same notation describes the relationships between JPA entities.

In this module you learn **class diagrams**: which classes exist, what they contain and how they are connected. A class diagram shows the **structure**, not what happens at runtime.

## A class is a box with three compartments

```plantuml Class Person
hide empty members
class Person {
  - name: String
  - age: int
  --
  + Person(name: String, age: int)
  + getName(): String
  + setName(name: String)
}
```

From top to bottom: the **name**, the **attributes** (fields) and the **operations** (constructors and methods). An empty compartment can be left out.

The matching Java class:

```java
public class Person {
    private String name;
    private int age;

    public Person(String name, int age) { ... }
    public String getName() { ... }
    public void setName(String name) { ... }
}
```

Note the order: UML writes **name first, then the type** (`name: String`), the opposite of Java. The return type of a method goes at the end: `getName(): String`. A method without a result (`void`) simply has no `: Type`.

## Visibility

Every attribute and method starts with a visibility symbol:

| Symbol | Meaning | Java |
|---|---|---|
| `-` | private | only inside the class |
| `#` | protected | the class and its subclasses (and the same package) |
| `+` | public | everyone |
| `~` | package | same package, no modifier in Java |

Fields are normally `-` (private), the methods you want to expose are `+`.

## Static and abstract

Two more markers appear in diagrams:

- **static** members are **underlined** (in PlantUML source: `{static}`).
- **abstract** classes and methods are written in *italics* (in PlantUML source: `{abstract}` or `abstract class`).

```plantuml Static and abstract members
hide empty members
abstract class Shape {
  - {static} count: int
  + {static} getCount(): int
  + {abstract} area(): double
  + describe(): String
}
```

```java
public abstract class Shape {
    private static int count;

    public static int getCount() { ... }
    public abstract double area();
    public String describe() { ... }
}
```

## Interfaces, enums and records

Other kinds of types use a **stereotype** in guillemets above the name:

```plantuml Interface, enum and record
hide empty members
interface Borrowable <<interface>> {
  + borrow()
  + giveBack()
}
enum Level <<enumeration>> {
  LOW
  HIGH
}
class Point <<record>> {
  x: int
  y: int
}
```

The interface lists only method signatures (no fields, no bodies), the enum lists its constants, and a record lists its components. The exact stereotype text varies between tools, but `<<interface>>` and `<<enumeration>>` are common.

:::remember
A class box has three compartments: **name**, **attributes**, **operations**. Attributes are written `visibility name: Type`, methods `visibility name(params): ReturnType`. Visibility: `-` private, `#` protected, `+` public, `~` package. Static is underlined, abstract is italic.
:::

:::warning
A UML diagram is not Java. `age: int` is **not** valid Java, and UML does not need to show every getter or every detail. A diagram shows what matters for the design. Do not translate it character by character, translate its meaning.
:::
