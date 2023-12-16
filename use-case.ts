import { Publisher, EventData, Subject } from "./observer";
import { Subscriber } from "./subscriber";

const newsAgency = new Publisher();

type NewsUpdate = { headline: string; content: string; count: number };

const sportsFan = new Subscriber<NewsUpdate>({
  name: "SportsFan",
  initialState: { count: 0, limit: 10 },
  onNext(data: EventData<NewsUpdate>) {
    console.log(`[${this.name}] Received: ${data.payload.headline}`);
    this.state.count += data.payload.count;
    if (this.state.count >= this.state.limit) {
      this.complete(Subject.Sports);
    }
  },
  onError(err: Error) {
    console.error(`[${this.name}] Error:`, err);
  },
  onComplete() {
    this.unsubscribeFromPublisher(newsAgency, Subject.Sports);
    console.log(`[${this.name}] Unsubscribed from sports news`);
  },
});

const politicalAnalyst = new Subscriber<NewsUpdate>({
  name: "PoliticalAnalyst",
  initialState: { articleCount: 0, limit: 5 },
  onNext(data: EventData<NewsUpdate>) {
    console.log(`[${this.name}] Political update: ${data.payload.headline}`);
    this.state.articleCount += 1;
    if (this.state.articleCount >= this.state.limit) {
      this.complete(Subject.Politics);
    }
  },
  onError(err: Error) {
    console.error(`[${this.name}] Error:`, err);
  },
  onComplete() {
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
