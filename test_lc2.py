import urllib.request, json
req = urllib.request.Request(
    'https://leetcode.com/graphql',
    data=json.dumps({
        'operationName':'questionData',
        'variables':{'titleSlug':'two-sum'},
        'query':'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { title content difficulty } }'
    }).encode('utf-8'),
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'Origin': 'https://leetcode.com'
    }
)
try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except Exception as e:
    print(e)
