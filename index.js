import mongoose from 'mongoose';
import express from 'express';
import router from './routes/routes.js';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERDB}:${process.env.PWDDB}@alecsander-igtibootcamp-fullstack-ofsjp.mongodb.net/my-bank-api?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Conexão com o MongoDB estabelicida!');
  } catch (error) {
    console.log({ err: error.message });
  }
})();

const app = express();

app.use(express.json());
app.use('/account', router);

app.listen(process.env.PORT, () => {
  console.log('API iniciada');
});
