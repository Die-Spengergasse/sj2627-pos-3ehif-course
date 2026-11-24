---
title: "Associations, aggregation and composition"
minutes: 9
status: draft
---

## Association: one class knows another

An **association** is a line between two classes. It means: objects of one class are linked to objects of the other, usually because one holds a **reference** to the other.

```plantuml Association with multiplicities
hide empty members
class Person
class Address
Person "1" -- "1" Address : lives at
```

In code, an association becomes a **field**:

```java
public class Person {
    private Address address;
}
```

The label (`lives at`) is optional and describes the relationship.

## Multiplicity

The numbers at the ends of the line are the **multiplicity**: how many objects of that class take part.

| Notation | Meaning |
|---|---|
| `1` | exactly one |
| `0..1` | optional: zero or one |
| `*` | any number (`0..*`) |
| `1..*` | at least one |

Read it from one class towards the other: in `Car "1" -- "*" Wheel`, **one** car is linked to **many** wheels. The number next to a class says how many of **that** class belong to one object on the other end.

The multiplicity decides the Java type:

```java
public class Car {
    private List<Wheel> wheels;       // Wheel: *  (a collection)
}

public class Order {
    private Customer customer;        // Customer: 1      (never null)
    private Coupon coupon;            // Coupon: 0..1     (may be null, or Optional in the API)
}
```

## Direction (navigability)

A plain line means both sides could know each other. An **arrow** says who knows whom:

```plantuml Directed association
hide empty members
class Student
class Course
Student "1" --> "*" Course : attends
```

A `Student` holds the courses, but a `Course` has **no** reference back:

```java
public class Student {
    private List<Course> courses;
}

public class Course {
    // no field of type Student
}
```

The arrow points to the class that is **known**. Without an arrow, the diagram does not tell you in which direction the references go, so you decide when you implement it.

## Aggregation and composition

Both are "has-a" relationships with a **diamond** at the owner (the "whole") side. They differ in how strong the ownership is.

```plantuml Aggregation and composition
hide empty members
class Department
class Employee
class Order
class OrderItem
Department "1" o-- "*" Employee : has
Order "1" *-- "1..*" OrderItem : contains
```

| | Aggregation | Composition |
|---|---|---|
| Diamond | empty (`o--`) | filled (`*--`) |
| Ownership | shared | exclusive |
| Lifecycle | the part lives on its own | the part belongs to exactly one whole and dies with it |
| Example | `Department` and `Employee` | `Order` and `OrderItem` |

If you delete a department, the employees still exist (they can move to another department): **aggregation**. If you delete an order, its order items make no sense any more: **composition**.

In Java both are usually a field with a collection. The difference is who **creates and owns** the parts:

```java
// Aggregation: the employee exists first and is handed in
public class Department {
    private final List<Employee> employees = new ArrayList<>();

    public void hire(Employee employee) { employees.add(employee); }
}

// Composition: the order creates its items itself and never gives them away
public class Order {
    private final List<OrderItem> items = new ArrayList<>();

    public void addItem(String product, int quantity) {
        items.add(new OrderItem(product, quantity));
    }
}
```

:::remember
A diamond marks the **whole**. Empty diamond: **aggregation**, the parts can exist without the whole. Filled diamond: **composition**, the parts are owned exclusively and die with the whole. Rule of thumb: if deleting the whole should delete the parts, draw a filled diamond.
:::

:::warning
Java has no keyword for aggregation or composition. In both cases the code is "a field with a reference". The diamond is a **design decision** about ownership, shown in how the code creates, hands out and deletes the parts. If the parts are created inside the whole and never leak out, it is composition.
:::

## Practice

:::exercise library-model
