import express from 'express';
import accountModel from '../models/account.js';

const router = express();

//ok -----------------------------------------------------------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    const account = await accountModel.find();
    res.send(account);
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.get('/avg/:agencia', async (req, res) => {
  try {
    const { agencia } = req.params;
    const avgs = await accountModel.aggregate([
      {
        $group: { _id: '$agencia', saldoMedio: { $avg: '$balance' } },
      },
    ]);

    const avg = avgs.filter((average) => {
      return average._id == agencia;
    });

    console.log(avgs);

    res.send({ 'O saldo médio desta agência é': avg[0].saldoMedio.toFixed(2) });
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.get('/lessBalance/:limit', async (req, res) => {
  try {
    const { limit } = req.params;
    const lessBalance = await accountModel
      .find({})
      .sort({ balance: 1 })
      .limit(+limit);

    res.send(
      lessBalance.map(({ agencia, conta, name, balance }, index) => {
        return {
          Contador: index + 1,
          Correntista: name,
          Conta: conta,
          Agencia: agencia,
          Saldo: balance,
        };
      })
    );
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.get('/moreBalance/:limit', async (req, res) => {
  try {
    const { limit } = req.params;
    const moreBalance = await accountModel
      .find({})
      .sort({ balance: -1 })
      .limit(+limit);

    res.send(
      moreBalance.map(({ agencia, conta, name, balance }, index) => {
        return {
          Contador: index + 1,
          Correntista: name,
          Conta: conta,
          Agencia: agencia,
          Saldo: balance,
        };
      })
    );
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.patch('/deposito', async (req, res) => {
  try {
    const { agencia: getAgencia, conta: getConta, deposit } = req.body;
    if (deposit < 0)
      throw new Error('Valor depositado tem que ser maior do que zero!');

    await accountModel.updateOne(
      { agencia: getAgencia, conta: getConta },
      { $inc: { balance: deposit } }
    );

    const data = await accountModel.findOne({
      agencia: getAgencia,
      conta: getConta,
    });
    if (!data) throw new Error('Registro não encontrado. Tente novamente!');

    const { name, conta, agencia, balance } = data;

    res.send({
      Correntista: name,
      Conta: conta,
      Agência: agencia,
      'Novo Saldo da Conta': balance,
    });
    console.log('oi');
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.patch('/transferenciaAgencia', async (req, res) => {
  try {
    /*
      ----------------agencia 10----------------
    */
    const getAgencia10 = await accountModel
      .findOne({ agencia: 10 })
      .sort({ balance: -1 });

    const { conta: conta10, agencia: agencia10 } = getAgencia10;

    await accountModel.updateOne(
      { conta: conta10, agencia: agencia10 },
      { $set: { agencia: 99 } }
    );

    /*
      ----------------agencia 25----------------
    */
    const getAgencia25 = await accountModel
      .findOne({ agencia: 25 })
      .sort({ balance: -1 });

    const { conta: conta25, agencia: agencia25 } = getAgencia25;

    await accountModel.updateOne(
      { conta: conta25, agencia: agencia25 },
      { $set: { agencia: 99 } }
    );

    /*
      ----------------agencia 47----------------
    */
    const getAgencia47 = await accountModel
      .findOne({ agencia: 47 })
      .sort({ balance: -1 });

    const { conta: conta47, agencia: agencia47 } = getAgencia47;

    await accountModel.updateOne(
      { conta: conta47, agencia: agencia47 },
      { $set: { agencia: 99 } }
    );

    /*
      ----------------agencia 33----------------
    */
    const getAgencia33 = await accountModel
      .findOne({ agencia: 33 })
      .sort({ balance: -1 });

    const { conta: conta33, agencia: agencia33 } = getAgencia33;

    await accountModel.updateOne(
      { conta: conta33, agencia: agencia33 },
      { $set: { agencia: 99 } }
    );

    const agencia99 = await accountModel.find({ agencia: 99 });

    res.send(agencia99);
    console.log(getAgencia10);
    console.log(getAgencia25);
    console.log(getAgencia47);
    console.log(getAgencia33);
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.patch('/saque', async (req, res) => {
  try {
    const { agencia: getAgencia, conta: getConta, withdraw } = req.body;
    if (withdraw < 0)
      throw new Error('Valor do saque tem que ser maior do que zero!');

    let data = await accountModel.findOne({
      agencia: getAgencia,
      conta: getConta,
    });
    if (!data) throw new Error('Registro não encontrado. Tente novamente!');

    const { balance: oldBalance } = data;

    if (oldBalance < withdraw + 1)
      throw new Error(
        'Saldo insuficiente para saque. Você precisa ter pelo menos o valor do saque acrescido da taxa de saque, que custa R$ 1,00'
      );

    await accountModel.updateOne(
      { agencia: getAgencia, conta: getConta },
      { $inc: { balance: -(withdraw + 1) } }
    );

    data = await accountModel.findOne({
      agencia: getAgencia,
      conta: getConta,
    });
    const { name, conta, agencia, balance } = data;

    res.send({
      Correntista: name,
      Conta: conta,
      Agência: agencia,
      'Novo Saldo da Conta': balance,
    });
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.delete('/', async (req, res) => {
  try {
    const { agencia, conta } = req.body;

    await accountModel.deleteOne({
      agencia,
      conta,
    });

    const count = await accountModel.countDocuments({ agencia });

    res.send({ 'Contas ativas na mesma agência': count });
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.get('/balance', async (req, res) => {
  try {
    const { agencia: getAgencia, conta: getConta } = req.body;

    const data = await accountModel.findOne({
      agencia: getAgencia,
      conta: getConta,
    });
    if (!data) throw new Error('Registro não encontrado. Tente novamente!');

    const { name, agencia, conta, balance } = data;

    res.send({
      Correntista: name,
      Conta: conta,
      Agência: agencia,
      'Saldo da Conta': balance,
    });
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

//ok -----------------------------------------------------------------------------------------------------------
router.patch('/transferencia', async (req, res) => {
  try {
    const { fromConta, toConta, value } = req.body;
    if (value <= 0)
      throw new Error('Valor da transferencia tem que ser maior do que zero!');

    let origin = await accountModel.findOne({ conta: fromConta });
    if (!origin)
      throw new Error('Conta de origem não encontrada. Tente novamente!');

    let destination = await accountModel.findOne({ conta: toConta });
    if (!destination)
      throw new Error('Conta de destino não encontrada. Tente novamente!');

    if (origin.agencia === destination.agencia) {
      if (origin.balance < value)
        throw new Error('Saldo insuficiente para realizar a transferência!');

      await accountModel.updateOne(
        { conta: fromConta },
        { $inc: { balance: -value } }
      );
      await accountModel.updateOne(
        { conta: toConta },
        { $inc: { balance: value } }
      );

      res.send({ 'O seu novo saldo é': origin.balance - value });
      //
    } else {
      if (origin.balance < value + 8)
        throw new Error(
          'Saldo insuficiente para realizar a transferência! Você precisa ter pelo menos o valor a ser transferido' +
            'acrescido do valor da taxa de transferência para uma agência diferente, que custa R$ 8,00'
        );

      await accountModel.updateOne(
        { conta: fromConta },
        { $inc: { balance: -(value + 8) } }
      );
      await accountModel.updateOne(
        { conta: toConta },
        { $inc: { balance: value } }
      );
      res.send({ 'O seu novo saldo é': origin.balance - (value + 8) });
      console.log('oi');
    }
  } catch (error) {
    res.status(500).send({ err: error.message });
  }
});

export default router;
