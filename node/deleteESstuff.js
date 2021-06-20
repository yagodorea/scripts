const fetch = require("node-fetch");

const ES_URL = process.argv[2];
const indexName = process.argv[3];
const Authorization = process.env.ES_AUTH;

if (!ES_URL || !indexName || !Authorization) {
  console.log('Usage: ES_AUTH={Authorization} node deleteESstuff {ES_URL} {index_name}');
  process.exit(0);
}

(async () => {
  let total = 100000;
  let i = 0;
  do {
    i = i + 1;
    console.log('Chamada', i);
    const result = await fetch(`${ES_URL}/${indexName}/_delete_by_query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          // Modify range here
          bool: { filter: { range: { "@timestamp": { lte: "now-18d" } } } }
        }
      }),
      headers: {
        Authorization,
        'Content-type': 'application/json'
      }
    });
    total = (await result.json()).total
    console.log(`Faltam ${total} logs`);
  } while (total > 0);
})();
