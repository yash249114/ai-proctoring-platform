import urllib.request, json
req = urllib.request.Request(
    'https://leetcode.com/graphql', 
    data=json.dumps({
        'operationName':'questionData',
        'variables':{'titleSlug':'letter-combinations-of-a-phone-number'},
        'query':'query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { title content difficulty } }'
    }).encode('utf-8'), 
    headers={'Content-Type': 'application/json'}
)
print(urllib.request.urlopen(req).read().decode('utf-8'))
