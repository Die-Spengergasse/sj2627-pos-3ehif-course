package at.spengergasse.pos3.modernjava.temperaturerange;

public record TemperatureRange(double min, double max) {

    public TemperatureRange {
        // TODO: reject a range where min is greater than max
    }

    public boolean contains(double temperature) {
        throw new UnsupportedOperationException("TODO");
    }

    public double width() {
        throw new UnsupportedOperationException("TODO");
    }
}
