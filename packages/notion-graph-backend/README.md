# backend

This is the backend of user-facing tryout page for Notion knowledge graph.

## Developing

```
nvm use

npm i -g serverless

sls offline # run in this current dir
```

## Requirements

- Any public Notion pages can be requested
- A page that was requested up to an hour ago can't be requested again (to prevent misuse). After an hour, it can be requested again.
  - If a page is requested again inside the one-hour time frame, the user will be presented with the existing graph of the corresponding Notion page id.
  - the BE has to make sure that no scraper jobs with the same id exist. Only one client can request a knowledge graph for a Notion page at a time. Other clients who try later (even by 1 sec) will receive a notification that it's being processed anyway
- All users are able to see the knowledge graphs of other users if they know the id of the original Notion page (the last 32 alphanumeric letters of https://blahblah.notion.site/Some-long-title-like-this-3c718fc5c0c84a92855df8e6edca2cb5). But since the hash is quite hard to know anyway, it is meant to behave just like 'unlisted' function on Youtube. This will also allow the system to be free from the need for login and session management. 
- Users will be able to browse other public pages using a dedicated page on frontend.
  - a page will have a view count and likes
  - if the list becomes long, it will be paginated
- Users can sign up for the waitlist for the support for larger size of knowledge graph, with their emails. This is an option for users.