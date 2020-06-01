export abstract class Try<T> {
  abstract get(): T | never;
  abstract getCause(): T | never;
  abstract isEmpty(): boolean;
  abstract isFailure(): boolean;
  abstract isSuccess(): boolean;
  protected constructor() {}

  static of<T>(fn: () => T | never): Try<T> {
    try {
      return new Success<T>(fn());
    } catch (e) {
      return new Failure<T>(e);
    }
  }

  onFailure(consumer: (value: T) => void): Try<T> {
    if (this.isFailure()) {
      consumer(this.getCause());
    }
    return this;
  }

  onSuccess(consumer: (value: T) => void): Try<T> {
    if (this.isSuccess()) {
      consumer(this.get());
    }
    return this;
  }

  recover<U>(supportsException: (cause: U) => boolean, x: () => U): Try<U>;
  recover<U>(supportsException: (cause: U) => boolean, x: U): Try<U>;
  recover(supportsException: (cause: T) => boolean, x: any): Try<T> {
    if (this.isFailure() && supportsException(this.getCause())) {
      if (typeof x === "function") {
        return new Success<T>(x());
      }
      return new Success<T>(x);
    }
    return this;
  }

  recoverWith<U>(
    supportsException: (cause: U) => boolean,
    x: () => Try<U>
  ): Try<U>;
  recoverWith<U>(supportsException: (cause: U) => boolean, x: Try<U>): Try<U>;
  recoverWith(supportsException: (cause: T) => boolean, x: any): Try<T> {
    if (this.isFailure() && supportsException(this.getCause())) {
      if (typeof x === "function") {
        return x();
      }
      return x;
    }
    return this;
  }
}

class Success<T> extends Try<T> {
  value: T;
  constructor(value: T) {
    super();
    this.value = value;
  }

  get(): T {
    return this.value;
  }

  getCause(): never {
    throw new Error();
  }

  isEmpty(): boolean {
    return false;
  }

  isFailure(): boolean {
    return false;
  }

  isSuccess(): boolean {
    return true;
  }
}

class Failure<T> extends Try<T> {
  cause: T;
  constructor(cause: T) {
    super();
    this.cause = cause;
  }

  get(): never {
    throw this.cause;
  }

  getCause(): T {
    return this.cause;
  }

  isEmpty(): boolean {
    return true;
  }

  isFailure(): boolean {
    return true;
  }

  isSuccess(): boolean {
    return false;
  }
}
