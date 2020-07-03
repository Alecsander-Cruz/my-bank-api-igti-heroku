import mongoose from 'mongoose';
import Int32 from 'mongoose-int32';

const accountSchema = mongoose.Schema({
  agencia: {
    type: Int32,
    required: true,
  },
  conta: {
    type: Int32,
    required: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  balance: {
    type: Number,
    required: true,
    validate(balance) {
      if (balance < 0)
        throw new Error('O valor do saldo bancário não pode ser negativo!');
    },
  },
});

const accountModel = mongoose.model('account', accountSchema, 'account');

export default accountModel;
