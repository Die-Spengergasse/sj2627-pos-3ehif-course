package at.spengergasse.pos3.modernjava.phonebook;

import java.util.Map;
import java.util.Optional;

public class PhoneBook {

    private final Map<String, String> numbers;

    public PhoneBook(Map<String, String> numbers) {
        this.numbers = Map.copyOf(numbers);
    }

    public Optional<String> findNumber(String name) {
        throw new UnsupportedOperationException("TODO");
    }

    public String numberOrUnknown(String name) {
        throw new UnsupportedOperationException("TODO");
    }

    public String numberOrThrow(String name) {
        throw new UnsupportedOperationException("TODO");
    }
}
