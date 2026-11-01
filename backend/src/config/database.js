const mongoose = require("mongoose");

const connectDatabase = async () => {
  console.log("Aguarde, tentando conectar ao banco de dados...");

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Conexão estabelecida! MongoDB conectado.");
};

module.exports = connectDatabase;
