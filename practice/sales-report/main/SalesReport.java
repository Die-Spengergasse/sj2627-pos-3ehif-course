package at.spengergasse.pos3.streams.salesreport;

import java.util.List;
import java.util.Map;

public class SalesReport {

    public static String productList(List<Sale> sales) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Map<String, Long> salesPerRegion(List<Sale> sales) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Map<String, Double> averagePerRegion(List<Sale> sales) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Map<String, List<String>> productsPerRegion(List<Sale> sales) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Map<Boolean, List<Sale>> splitByAmount(List<Sale> sales, int limit) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Map<Integer, String> productById(List<Sale> sales) {
        throw new UnsupportedOperationException("TODO");
    }
}
