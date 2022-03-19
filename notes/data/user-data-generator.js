
var fs = require('fs');

users = []
for (i=1; i<= 100; i++) {
  var user =   {
    "email": "instructor1@test.test",
    "username": "instructor1",
    "password": "$2b$10$QR.74T4n3.G3/RJ8yMAve.p1sStXzQzM8zNqu/e5vvQu1wuNYYepm",
    "avatar": "/avatar",
    "banner": "/banner",
    "follower": [
      "",
      ""
    ],
    "following": [
      "",
      ""
    ],
    "history": {
      "latestVideos": [],
      "latestHastags": [],
      "letestCategories": [],
      "letestSearchs": []
    },
    "explore": [
      ""
    ]
  }

  user.email = "instructor" + i + "@test.test"
  user.username = "instructor" + i

  users.push(user)
}

console.log(users)

fs.writeFile('notes/data/user-instructor.json', JSON.stringify(users), 'utf8', function() {});