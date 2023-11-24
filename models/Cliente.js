const mongoose = require('mongoose')

const User = mongoose.model('Clientes', {
  name: String,
  email: String,
  password: String,
})

module.exports = User