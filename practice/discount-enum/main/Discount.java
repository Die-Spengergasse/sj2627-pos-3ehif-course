package at.spengergasse.pos3.modernjava.discountenum;

public enum Discount {
    NONE, HALF_PRICE, FIXED_5;

    public int apply(int priceInCents) {
        throw new UnsupportedOperationException("TODO");
    }
}
