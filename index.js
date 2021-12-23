const express = require('express');
const cookieParser = require('cookie-parser');
const { graphqlHTTP } = require('express-graphql');

const app = express();
const schema = require('./schema/index');

//Use .env file if in development
if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  const result = dotenv.config();
  if (result.error) {
      throw result.error;
  }
}

const PORT = process.env.PORT;

//Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: false }));

//Routes
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

const startServer = () => {
  try {
    app.listen(PORT);
    console.log(`Server is running on Port: ${PORT}`);
  } catch {
    console.log(`Server failed to run`)
  }
}

startServer();

