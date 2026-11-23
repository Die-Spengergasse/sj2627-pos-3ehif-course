package at.spengergasse.pos3.modernjava.coinenum;

import java.util.List;
import java.util.Optional;

public enum Coin {
    CENT_10, CENT_20, CENT_50, EURO_1, EURO_2;

    public int cents() {
        throw new UnsupportedOperationException("TODO");
    }

    public boolean isEuroCoin() {
        throw new UnsupportedOperationException("TODO");
    }

    public static int total(List<Coin> coins) {
        throw new UnsupportedOperationException("TODO");
    }

    public static Optional<Coin> largestNotAbove(int cents) {
        throw new UnsupportedOperationException("TODO");
    }
}
