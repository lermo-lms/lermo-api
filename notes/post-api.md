# Note
User can share their post to each other

# Requirement

As a user I want to post on the platform

# Data

Format we used: HTML
Store in Database

## Supported
```
h1
p
img
code (Future https://github.com/highlightjs/highlight.js/)

hashtags
```

# Status

```
draft
public
```

## Database Example

```json
{ 
  "id": 1234,
  "username": "user1",
  "date": "23123213",
  "content":[
    {"h1" : "Example"},
    {"p": "Hello There"},
    {"p": "Hello There"},
    {"p": "Hello There"},
    {"img": "https://example-img.com"}],
}
```

