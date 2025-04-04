const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// 챗봇 응답을 위한 커스텀 엔드포인트
server.post('/chat', (req, res) => {
  const userMessage = req.body.message.toLowerCase();
  const db = router.db.getState();

  // Check if db.responses exists and is an array
  if (!db || !db.responses || !Array.isArray(db.responses)) {
    console.error('Error: db.responses is undefined or not an array.');
    return res.status(500).json({ error: 'Internal server error' });
  }

  // 키워드 매칭을 통한 응답 찾기
  const matchedResponse = db.responses.find(item => {
    // Check if item.keywords exists and is an array
    if (!item.keywords || !Array.isArray(item.keywords)) {
      console.warn('Warning: item.keywords is undefined or not an array.');
      return false; // Skip this item
    }
    return item.keywords.some(keyword => userMessage.includes(keyword.toLowerCase()));
  });

  if (matchedResponse) {
    let response = matchedResponse.response;

    // 특수 응답 처리 (예: 시간)
    if (response.includes("{time}")) {
      const now = new Date();
      response = response.replace("{time}", now.toLocaleTimeString());
    }

    return res.json({ text: response, matched: true });
  }

  // 기본 응답 중 랜덤 선택
  if (!db.defaultResponses || !Array.isArray(db.defaultResponses)) {
    console.error('Error: db.defaultResponses is undefined or not an array.');
    return res.status(500).json({ error: 'Internal server error' });
  }
  const defaultResponses = db.defaultResponses;
  const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];

  res.json({ text: randomResponse, matched: false });
});

server.use(router);

server.listen(3007, () => {
  console.log('JSON Server is running at http://localhost:3007');
});
