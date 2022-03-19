# API

```
POST /users/register
GET /users/profile
PATCH /users/profile/avatar
PATCH /users/profile/banner

```

# Data
```js
{
  email: string,
  username: string,
  password: string,
  avatar: string,
  banner: string,

  follwer: ["user1", "user2"]
  following: ["",""]

  history: {
    latestVideos: []
    latestHastags: []
    letestCategories: []
    letestSearchs: []
  },
  explore: [""]
}
```

# Suggest Users
1. Suggest by content (Posts, Videos, ETC.)


# Action

```
Search: [Post, Video, Article, User]
Read: [Post, Video, Article]
Watch: Video
Reaction: [Post, Video, Article]
```

# Content Suggest
```
Latest video
Latest hastag
Letest category
Leatst search
```