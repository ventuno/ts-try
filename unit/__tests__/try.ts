import { Try } from "../../try";

const fnThatThrows = () => {
  throw new Error();
};

describe("Try", () => {
  describe("get", () => {
    test("It properly returns the wrapped object", () => {
      const t: Try<string> = Try.of(() => "s");
      expect(t.get()).toBe("s");
    });

    test("It properly throws the exception", () => {
      const t = Try.of(fnThatThrows);
      expect(() => t.get()).toThrow(new Error());
    });
  });

  describe("getCause", () => {
    test("It properly throws an exception on a Success", () => {
      const t: Try<string> = Try.of(() => "s");
      expect(() => t.getCause()).toThrow(new Error());
    });

    test("It properly returns the Exception Failure", () => {
      const t = Try.of(fnThatThrows);
      expect(t.getCause()).toBeInstanceOf(Error);
    });
  });

  describe("isEmpty, isFailure, isSuccess", () => {
    test("Success", () => {
      const t: Try<string> = Try.of(() => "s");
      expect(t.isEmpty()).toBe(false);
      expect(t.isFailure()).toBe(false);
      expect(t.isSuccess()).toBe(true);
    });

    test("Failure", () => {
      const t: Try<string> = Try.of(fnThatThrows);
      expect(t.isEmpty()).toBe(true);
      expect(t.isFailure()).toBe(true);
      expect(t.isSuccess()).toBe(false);
    });
  });

  describe("onSuccess, onFailure", () => {
    test("Success", () => {
      const successConsumer = jest.fn();
      const failureConsumer = jest.fn();
      Try.of(() => "s")
        .onSuccess(successConsumer)
        .onFailure(failureConsumer);
      expect(successConsumer).toHaveBeenCalledWith("s");
      expect(failureConsumer).not.toHaveBeenCalled();
    });

    test("Failure", () => {
      const successConsumer = jest.fn();
      const failureConsumer = jest.fn();
      Try.of(fnThatThrows)
        .onSuccess(successConsumer)
        .onFailure(failureConsumer);
      expect(successConsumer).not.toHaveBeenCalled();
      expect(failureConsumer).toHaveBeenCalledWith(new Error());
    });
  });

  describe("recover", () => {
    test("It doesn't call recover on Success", () => {
      const recoverConsumer = jest.fn();
      const supportsException = jest.fn().mockReturnValue(true);
      Try.of(() => "s").recover(supportsException, recoverConsumer);
      expect(supportsException).not.toHaveBeenCalled();
      expect(recoverConsumer).not.toHaveBeenCalled();
    });

    test("It properly recovers with supplier", () => {
      const t = Try.of(fnThatThrows).recover(
        () => true,
        () => 21
      );
      expect(t.get()).toBe(21);
    });

    test("It properly recovers with value", () => {
      const t = Try.of(fnThatThrows).recover(() => true, 21);
      expect(t.get()).toBe(21);
    });
  });

  describe("recoverWith", () => {
    test("It doesn't call recoverWith on Success", () => {
      const recoverConsumer = jest.fn();
      const supportsException = jest.fn().mockReturnValue(true);
      Try.of(() => "s").recoverWith(supportsException, recoverConsumer);
      expect(supportsException).not.toHaveBeenCalled();
      expect(recoverConsumer).not.toHaveBeenCalled();
    });

    test("It properly recovers with supplier", () => {
      const t = Try.of(fnThatThrows).recoverWith(
        () => true,
        () => Try.of(() => 21)
      );
      expect(t.get()).toBe(21);
    });

    test("It properly recovers with value", () => {
      const t: Try<number> = Try.of(fnThatThrows).recoverWith(
        () => true,
        Try.of(() => 21)
      );
      expect(t.get()).toBe(21);
    });
  });
});
