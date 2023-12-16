import { Subscriber } from "./subscriber";

/**
 * Interface representing the publisher in the Observer pattern.
 */
interface IPublisher {
  subscribe(subject: Subject, subscriber: Subscriber<any>): void;
  unsubscribe(subject: Subject, subscriber: Subscriber<any>): void;
  notify<T>(subject: Subject, data: EventData<T>): void;
}

/**
 * Defines the structure of event data.
 */
interface EventData<T> {
  type: string;
  payload: T;
  timestamp?: Date;
}

/**
 * Enum for the different types of subjects that can be observed.
 */
enum Subject {
  Sports = "sports",
  Politics = "politics",
}

/**
 * Implements the IPublisher interface to manage subscribers and notifications.
 */
class Publisher implements IPublisher {
  private observers: Map<Subject, Array<Subscriber<any>>>;

  constructor() {
    this.observers = new Map();
  }

  /**
   * Subscribes a new subscriber to a specific subject.
   * @param {Subject} subject - The subject to subscribe to.
   * @param {Subscriber<T>} subscriber - The subscriber object.
   */
  public subscribe<T>(subject: Subject, subscriber: Subscriber<T>): void {
    if (!this.observers.has(subject)) {
      this.observers.set(subject, []);
    }

    const subscribers = this.observers.get(subject);
    if (subscribers) {
      if (!subscribers.includes(subscriber)) {
        subscribers.push(subscriber);
      } else {
        console.error("Attempted to subscribe an already subscribed observer.");
      }
    } else {
      console.error("Failed to retrieve subscribers for subject.");
    }
  }

  /**
   * Unsubscribes a subscriber from a specific subject.
   * @param {Subject} subject - The subject to unsubscribe from.
   * @param {Subscriber<T>} subscriber - The subscriber object to remove.
   */
  public unsubscribe<T>(subject: Subject, subscriber: Subscriber<T>): void {
    const subscribers = this.observers.get(subject);
    if (subscribers) {
      const index = subscribers.indexOf(subscriber);
      if (index !== -1) {
        console.log("unsubscribing: " + subscriber.name + " from " + subject);
        subscribers.splice(index, 1);
      } else {
        console.error("Attempted to unsubscribe a non-existent observer.");
      }
    }
  }

  /**
   * Notifies all subscribers of a specific subject with the given data.
   * @param {Subject} subject - The subject of the event.
   * @param {EventData<T>} data - The data to be sent to subscribers.
   */
  public notify<T>(subject: Subject, data: EventData<T>): void {
    const subscribers = this.observers.get(subject);
    if (subscribers) {
      subscribers.forEach((subscriber) => {
        subscriber.next.call(subscriber, data);
      });
    }
  }
}

export { Publisher, EventData, Subject };
