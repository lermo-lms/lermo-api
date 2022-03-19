
# User 1


curl -XPOST 'http://localhost:9200/post/1' -d @/Users/devster/Champ/lermo-api/notes/post-data/c-sharp-en.json
curl -H 'Content-Type: application/x-ndjson' -XPOST 'localhost:9200/post/1/_bulk?pretty' --data-binary @/Users/devster/Champ/lermo-api/notes/post-data/c-sharp-en.json