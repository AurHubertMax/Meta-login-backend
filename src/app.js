require('dotenv').config();
const express = require('express');
const app = express();
// const bodyParser = require('body-parser');
const routes = require('./routes/index');
const { requestLogger, responseLogger } = require('./middleware');

require('./startup/cors')(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use(requestLogger);
app.use(responseLogger);
app.use('/api', routes)





app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 4500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
    console.log(`Visit http://localhost:${PORT}/api to access the API`);
});

module.exports = app;