const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const API_URLS = {
  p: 'http://20.244.56.144/evaluation-service/primes',
  f: 'http://20.244.56.144/evaluation-service/fibo',
  e: 'http://20.244.56.144/evaluation-service/even',
  r: 'http://20.244.56.144/evaluation-service/rand',
};

const numberStore = {
  p: [],
  f: [],
  e: [],
  r: [],
};

const WINDOW_SIZE = 10;

async function fetchNumbers(type) {
  try {
    const response = await axios.get(API_URLS[type]);
    return response.data.numbers;
  } catch (error) {
    return []; 
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return (sum / numbers.length).toFixed(2);
}

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const newNumbers = await fetchNumbers(numberid);
  if (newNumbers.length === 0) {
    return res.status(500).json({ error: 'Error fetching numbers' });
  }

  const windowPrevState = [...numberStore[numberid]];

  newNumbers.forEach(num => {
    if (!numberStore[numberid].includes(num)) {
      numberStore[numberid].push(num);
    }
  });

  while (numberStore[numberid].length > WINDOW_SIZE) {
    numberStore[numberid].shift(); 
  }

  const windowCurrState = numberStore[numberid];
  const avg = calculateAverage(windowCurrState);

  return res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Average Calculator running at http://localhost:${port}`);
});
