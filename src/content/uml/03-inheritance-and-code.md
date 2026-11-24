---
title: "Inheritance, interfaces and reading a diagram"
minutes: 8
status: draft
---

## Generalization: "is-a"

**Generalization** (inheritance) is a line with an **empty triangle** pointing at the **superclass**. In Java it is `extends`.

```plantuml Generalization
hide empty members
abstract class Animal
class Dog
class Cat
Animal <|-- Dog
Animal <|-- Cat
```

```java
public abstract class Animal { }
public class Dog extends Animal { }
public class Cat extends Animal { }
```

The arrow always points **from the subclass to the superclass**. A `Dog` *is an* `Animal`; it inherits everything that is not private.

## Realization: implementing an interface

**Realization** looks the same, but the line is **dashed**. The triangle points at the interface. In Java it is `implements`.

```plantuml Realization
hide empty members
interface Borrowable
class Book
Borrowable <|.. Book
```

```java
public interface Borrowable { }
public class Book implements Borrowable { }
```

A class can realize many interfaces but extend only one class.

## Dependency: "uses"

A **dependency** is a dashed line with an open arrowhead (`..>`). It is the weakest relationship: one class **uses** another only briefly, for example as a parameter, a local variable or a return type, without keeping a reference in a field.

```plantuml Dependency
hide empty members
class Printer
class Report
Printer ..> Report : uses
```

```java
public class Printer {
    public void print(Report report) { ... }   // only a parameter, no field
}
```

If `Printer` stored the report in a field, it would be an association instead.

## All symbols at a glance

| Symbol | Name | Java |
|---|---|---|
| `A -- B` line | association | field in A or B |
| `A --> B` arrow | directed association | field in A of type B |
| `A o-- B` empty diamond | aggregation | A has Bs, they live independently |
| `A *-- B` filled diamond | composition | A creates and owns its Bs |
| `A <\|-- B` solid, empty triangle | generalization | `B extends A` |
| `A <\|.. B` dashed, empty triangle | realization | `B implements A` |
| `A ..> B` dashed, open arrow | dependency | A only uses B |

Remember: a **solid** line for "has" and "is-a" between classes, a **dashed** line for "implements" and "uses".

## From UML to Java

Here is one diagram. Read it step by step.

```plantuml Library
hide empty members
class Library {
  - name: String
  + addBook(title: String, isbn: String): Book
  + books(): List<Book>
}
class Book {
  - title: String
  - isbn: String
}
interface Borrowable {
  + borrow()
  + giveBack()
}
Library "1" *-- "*" Book : contains
Borrowable <|.. Book
```

1. Each box becomes a type: two classes and an interface.
2. Attributes become **fields** with their visibility and type.
3. Operations become **methods**.
4. The association with multiplicity `*` becomes a **collection** field in `Library`. `Book` has no arrow back, so it has **no** `Library` field.
5. The filled diamond means the library **creates** its books (`addBook` takes title and ISBN, not a `Book`).
6. The dashed triangle means `Book implements Borrowable`.

```java
public interface Borrowable {
    void borrow();
    void giveBack();
}

public class Book implements Borrowable {
    private final String title;
    private final String isbn;

    Book(String title, String isbn) { ... }
    // borrow(), giveBack() ...
}

public class Library {
    private final String name;
    private final List<Book> books = new ArrayList<>();

    public Book addBook(String title, String isbn) {
        Book book = new Book(title, isbn);
        books.add(book);
        return book;
    }

    public List<Book> books() { return List.copyOf(books); }
}
```

:::remember
Read a diagram in three questions: **what are the types** (boxes and stereotypes), **who knows whom** (associations, arrows, multiplicities, diamonds), and **what is the family tree** (triangles). Then write the fields, collections and `extends`/`implements` that express exactly that.
:::

:::warning
Do not mix up the two triangles with the diamonds. A **triangle** is about **types** (`extends`, `implements`: "is-a"). A **diamond** is about **objects** (a whole that has parts: "has-a").
:::
