---
title: "Text blocks and handy APIs"
minutes: 10
status: draft
---

## Text blocks

Multi-line strings used to be painful: quotes, `\n` and `+` everywhere. Since Java 15, a **text block** is written between triple quotes:

```java
// Before
String html = "<html>\n" +
              "    <body>\n" +
              "        <p>Hello</p>\n" +
              "    </body>\n" +
              "</html>";

// After
String html = """
    <html>
        <body>
            <p>Hello</p>
        </body>
    </html>
    """;
```

The opening `"""` must be followed by a line break. The text starts on the next line.

- **Leading whitespace is stripped.** The indentation that all lines have in common is removed; the position of the closing `"""` counts too. So the code can be indented nicely without the string containing the indentation.
- Because the closing delimiter is on its own line, the string ends with a line break.
- Normal **escape sequences** work. You do not need to escape double quotes inside a text block, which is ideal for JSON:

```java
var json = """
    {
        "name": "Alice",
        "age": 30
    }
    """;
```

Two escapes are new: `\s` is a space that is not stripped, and a `\` at the end of a line continues the string without a line break.

## Modern String methods

```java
var text = "  Hello, World!  ";

System.out.println(text.isBlank());   // false
System.out.println("  ".isBlank());   // true
System.out.println(text.strip());     // "Hello, World!"
System.out.println("ab".repeat(3));   // ababab

"line1\nline2\nline3".lines()
    .forEach(System.out::println);

var upper = "hello".transform(s -> s.toUpperCase());
```

- `isBlank()` is true for an empty string or one with only whitespace (unlike `isEmpty()`, which is only true for length 0).
- `strip()` removes whitespace at both ends (it understands Unicode whitespace, unlike `trim()`).
- `repeat(n)` concatenates the string `n` times.
- `lines()` splits at line breaks and gives a stream of lines (streams come in the next chapter; `forEach` just handles each one).
- `transform(f)` applies a function to the string and returns the result.

## Files and collection factory methods

```java
var content = Files.readString(Path.of("data.txt"));
Files.writeString(Path.of("out.txt"), content);

var list = List.of("a", "b", "c");
var set = Set.of(1, 2, 3);
var map = Map.of("key1", "value1", "key2", "value2");

var copy = List.copyOf(list);
```

- `Files.readString` and `Files.writeString` read or write a whole text file in one call.
- `List.of`, `Set.of` and `Map.of` are factory methods that create **immutable** collections. `List.copyOf` makes an immutable copy of an existing collection.

:::remember
Text blocks (`"""`) make multi-line text readable. `isBlank`, `strip`, `repeat`, `lines` and `transform` save boilerplate, and `Files.readString` / `List.of` cover everyday tasks in one line.
:::

:::exercise text-tools
