`LambdaWorkshop` is a small collection of methods that **return** or **take** functional-interface values. Implement each one with a lambda or a method reference:

1. **`longerThan(int length)`**: a `Predicate<String>` that is true for strings with **more than** `length` characters. (The lambda reads the parameter `length`, which is allowed because it is effectively final.)
2. **`shout()`**: a `Function<String, String>` that turns `"hi"` into `"HI!"` (upper case plus an exclamation mark).
3. **`parser()`**: a `Function<String, Integer>` that parses a string to an `int`. Use a **method reference**. Invalid text such as `"x"` throws a `NumberFormatException`; you do not have to handle it.
4. **`listFactory()`**: a `Supplier<List<String>>` that creates a **new, empty, modifiable** list on every call. Use a **constructor reference**.
5. **`byLengthThenAlphabet()`**: a `Comparator<String>` that orders shorter strings first and strings of equal length alphabetically (`compareTo`). Use a lambda with two parameters and `Integer.compare(...)`.
6. **`applyTwice(Function<Integer, Integer> function, int value)`**: applies the function to the value and then to the result. This one is an ordinary method: it calls `function.apply(...)`.

Example: `applyTwice(n -> n * 3, 2)` is `18`.
