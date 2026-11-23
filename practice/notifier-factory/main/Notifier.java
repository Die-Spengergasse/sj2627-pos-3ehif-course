package at.spengergasse.pos3.modernjava.notifierfactory;

public interface Notifier {

    String send(String message);

    static Notifier email(String address) {
        throw new UnsupportedOperationException("TODO");
    }

    static Notifier sms(String number) {
        throw new UnsupportedOperationException("TODO");
    }

    static Notifier silent() {
        throw new UnsupportedOperationException("TODO");
    }

    static Notifier to(String target) {
        throw new UnsupportedOperationException("TODO");
    }
}
