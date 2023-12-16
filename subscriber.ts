import { EventData, Publisher, Subject } from "./observer";

/**
 * Configuration interface for creating a new Subscriber.
 */
interface SubscriberConfig<T> {
  name: string;
  initialState: object;
  onNext: (this: Subscriber<T>, data: EventData<T>) => void;
  onError: (this: Subscriber<T>, err: Error) => void;
  onComplete: (this: Subscriber<T>, subject: Subject) => void;
}

/**
 * Represents a subscriber in the Observer pattern.
 * @template T The type of data the subscriber will receive.
 */
class Subscriber<T> {
  readonly name: string;
  state: any;
  next: (data: EventData<T>) => void;
  error: (err: Error) => void;
  complete: (subject: Subject) => void;

  /**
   * Creates an instance of a Subscriber.
   * @param {SubscriberConfig<T>} config - The configuration object for the subscriber.
   */
  constructor(config: SubscriberConfig<T>) {
    this.name = config.name;
    this.state = config.initialState;
    this.next = config.onNext.bind(this);
    this.error = config.onError.bind(this);
    this.complete = config.onComplete.bind(this);
  }

  /**
   * Unsubscribes the subscriber from a given subject via a publisher.
   * @param {Publisher} publisher - The publisher to unsubscribe from.
   * @param {Subject} subject - The subject to unsubscribe from.
   */
  unsubscribeFromPublisher(publisher: Publisher, subject: Subject): void {
    publisher.unsubscribe(subject, this);
  }
}

export { Subscriber };
