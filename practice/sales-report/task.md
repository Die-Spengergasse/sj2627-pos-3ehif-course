A `Sale` record has an `id`, a `region`, a `product` and an `amountCents`. `SalesReport` summarises a list of sales with **collectors**. Implement the six methods with `collect(...)`:

1. **`productList(List<Sale> sales)`**: all product names joined by `", "` and wrapped in brackets, e.g. `"[Tea, Coffee]"`; for no sales `"[]"`. Use `map` and `Collectors.joining`.
2. **`salesPerRegion(List<Sale> sales)`**: the number of sales per region, as `Map<String, Long>`. Use `groupingBy` with `counting()`.
3. **`averagePerRegion(List<Sale> sales)`**: the average `amountCents` per region, as `Map<String, Double>`. Use `groupingBy` with `averagingInt`.
4. **`productsPerRegion(List<Sale> sales)`**: the product names per region, in the original order, as `Map<String, List<String>>`. Use `groupingBy` with `mapping`.
5. **`splitByAmount(List<Sale> sales, int limit)`**: a `Map<Boolean, List<Sale>>`: under `true` the sales with `amountCents` greater than or equal to `limit`, under `false` all the others. Use `partitioningBy`.
6. **`productById(List<Sale> sales)`**: a `Map<Integer, String>` from sale id to product name. Use `toMap`. If two sales have the same id, the exception from `toMap` (an `IllegalStateException`) is fine; you do not have to catch it.

Example: for the sales `(1, "North", "Tea", 300)` and `(2, "North", "Coffee", 500)`, `salesPerRegion` is `{North=2}` and `averagePerRegion` is `{North=400.0}`.
