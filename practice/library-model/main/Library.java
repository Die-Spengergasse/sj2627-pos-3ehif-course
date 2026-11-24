package at.spengergasse.pos3.testingdesign.librarymodel;

import java.util.List;
import java.util.Optional;

public class Library {

    public Library(String name) {
        throw new UnsupportedOperationException("TODO");
    }

    public String name() {
        throw new UnsupportedOperationException("TODO");
    }

    public Book addBook(String title, String isbn) {
        throw new UnsupportedOperationException("TODO");
    }

    public List<Book> books() {
        throw new UnsupportedOperationException("TODO");
    }

    public Optional<Book> findByIsbn(String isbn) {
        throw new UnsupportedOperationException("TODO");
    }

    public void join(Member member) {
        throw new UnsupportedOperationException("TODO");
    }

    public List<Member> members() {
        throw new UnsupportedOperationException("TODO");
    }
}
