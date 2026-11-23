A `PhoneBook` maps names to phone numbers. Looking up a name that is not in the book must not lead
to a `NullPointerException`. Implement the three methods with `Optional`:

1. **`findNumber(String name)`** returns the number wrapped in an `Optional`, or an empty `Optional`
   if the name is unknown. Hint: `Map.get` returns `null` for unknown keys.
2. **`numberOrUnknown(String name)`** returns the number, or the text `"unknown"`.
3. **`numberOrThrow(String name)`** returns the number, or throws an `IllegalArgumentException`
   whose message contains the name.

Use `findNumber` in the other two methods, without calling `get()` or `isPresent()`.
