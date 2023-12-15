interface IPublisher {
  subscribe(subject: Subject, subscriber: Subscriber<any>): void;
  unsubscribe(subject: Subject, subscriber: Subscriber<any>): void;
  notify<T>(subject: Subject, data: EventData<T>): void;
}

interface EventData<T> {
  type: string;
  payload: T;
  timestamp?: Date;
}

enum Subject {
  Sports = "sports",
  Politics = "politics",
}

class Publisher implements IPublisher {
  private observers: Map<Subject, Array<Subscriber<any>>>;

  constructor() {
    this.observers = new Map();
  }

  public subscribe<T>(subject: Subject, subscriber: Subscriber<T>): void {
    if (!this.observers.has(subject)) {
      this.observers.set(subject, []);
    }

    const subscribers = this.observers.get(subject);
    if (!subscribers!.includes(subscriber)) {
      subscribers!.push(subscriber);
    } else {
      console.error("Attempted to subscribe an already subscribed observer.");
    }
  }

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

  public notify<T>(subject: Subject, data: EventData<T>): void {
    const subscribers = this.observers.get(subject);
    if (subscribers) {
      subscribers.forEach((subscriber) => {
        subscriber.next.call(subscriber, data);
      });
    }
  }
}
interface SubscriberConfig<T> {
  name: string;
  initialState: object;
  onNext: (this: Subscriber<T>, data: EventData<T>) => void;
  onError: (this: Subscriber<T>, err: Error) => void;
  onComplete: (this: Subscriber<T>, subject: Subject) => void;
}

class Subscriber<T> {
  readonly name: string;
  state: any;
  next: (data: EventData<T>) => void;
  error: (err: Error) => void;
  complete: (subject: Subject) => void;

  constructor(config: SubscriberConfig<T>) {
    this.name = config.name;
    this.state = config.initialState;
    this.next = config.onNext;
    this.error = config.onError;
    this.complete = config.onComplete;
  }

  unsubscribeFromPublisher(publisher: Publisher, subject: Subject): void {
    publisher.unsubscribe(subject, this);
  }
}

const observable = new Publisher();

type eventData = { count: number };

const genRandNum = (x: number) => {
  return Math.floor(Math.random() * x);
};

const newsAgency = new Publisher();

type NewsUpdate = { headline: string; content: string; count: number };

const sportsFan = new Subscriber<NewsUpdate>({
  name: "SportsFan",
  initialState: { count: 0, limit: 10 },
  onNext: function (this: Subscriber<NewsUpdate>, data) {
    console.log(`[${this.name}] Received: ${data.payload.headline}`);
    this.state.count += data.payload.count;
    if (this.state.count >= this.state.limit) {
      this.complete(Subject.Sports);
    }
  },
  onError: function (this: Subscriber<NewsUpdate>, err) {
    console.error(`[${this.name}] Error:`, err);
  },
  onComplete: function (this: Subscriber<NewsUpdate>, subject: Subject) {
    this.unsubscribeFromPublisher(newsAgency, Subject.Sports);
    console.log(`[${this.name}] Unsubscribed from sports news`);
  },
});

const politicalAnalyst = new Subscriber<NewsUpdate>({
  name: "PoliticalAnalyst",
  initialState: { articleCount: 0, limit: 5 },
  onNext: function (this: Subscriber<NewsUpdate>, data) {
    console.log(`[${this.name}] Political update: ${data.payload.headline}`);
    this.state.articleCount += 1;
    if (this.state.articleCount >= this.state.limit) {
      this.complete(Subject.Politics);
    }
  },
  onError: function (this: Subscriber<NewsUpdate>, err) {
    console.error(`[${this.name}] Error:`, err);
  },
  onComplete: function (this: Subscriber<NewsUpdate>) {
    this.unsubscribeFromPublisher(newsAgency, Subject.Politics);
    console.log(`[${this.name}] Unsubscribed from political news`);
  },
});

newsAgency.subscribe<NewsUpdate>(Subject.Sports, sportsFan);
newsAgency.subscribe<NewsUpdate>(Subject.Politics, politicalAnalyst);

const sportsNews = [
  {
    headline: "Team wins championship!",
    content: "Team X won against Team Y.",
    count: 1,
  },
  {
    headline: "Player sets new record!",
    content: "Player A sets new scoring record.",
    count: 1,
  },
  {
    headline: "Upcoming match scheduled!",
    content: "Team A will play against Team B.",
    count: 1,
  },
  {
    headline: "Injury update on key player!",
    content: "Player B is recovering well.",
    count: 1,
  },
];

const politicalNews = [
  {
    headline: "Election results announced!",
    content: "Party A wins majority.",
    count: 1,
  },
  {
    headline: "New policy introduced!",
    content: "Government introduces new law.",
    count: 1,
  },
];

sportsNews.forEach((update, index) => {
  setTimeout(() => {
    newsAgency.notify<NewsUpdate>(Subject.Sports, {
      type: "NewsUpdate",
      payload: update,
    });
  }, index * 2000);
});

politicalNews.forEach((update, index) => {
  setTimeout(() => {
    newsAgency.notify<NewsUpdate>(Subject.Politics, {
      type: "NewsUpdate",
      payload: update,
    });
  }, index * 3000);
});
