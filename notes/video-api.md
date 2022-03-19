
# Data

```
_id
userId
title
description
price
thumbnail
tag
category

status
videoName
videoPath

videoLists
```


# Video status

```
draft

# Transcoder
inprogress

# Transcode Successed + Upload to S3 Successed
complated

# Transcode Successed + Upload to S3 Failure
incomplated

# Transcode error
error

# Delete Video
deleted

# Straming
streaming -> complated
```

# Data Example
```json
{
    "_id" : ObjectId("6089967fdb1723de7870120d"),
    "view" : 0,
    "userId" : "6067f760a10c875dcdb8d7c7",
    "title" : "Hello w2w2",
    "description" : "Testing",
    "price" : 500,
    "createdAt" : ISODate("2021-04-28T17:08:15.709Z"),
    "updatedAt" : ISODate("2021-04-29T04:31:16.310Z"),
    "status" : "completed",
    "videoName" : "Deepfake",
    "videoPath" : "6067f760a10c875dcdb8d7c7/Deepfake-1619670657"
}
```


# Video Type

```
Pay
Donate
```


