const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// const logger = require("logger");
require("dotenv").config();

const app = express();
app.use(express.json());

const Cliente = require("./models/Cliente")

app.get("/", (req, res) => {
    res.status(200).json({ msg: 'Bem vindo a nossa API' });
});

//Register user
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    if (!name) {
        return res.status(422).json({ msg: "O nome é obrigatório!" });
    }

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    if (password != confirmpassword) {
        return res
            .status(422)
            .json({ msg: "A senha e a confirmação precisam ser iguais!" });
    }

    // check if user exists
    const userExists = await Cliente.findOne({ email: email });

    if (userExists) {
        return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create user
    const user = new Cliente({
        name,
        email,
        password: passwordHash,
    });

    try {
        await user.save();

        res.status(201).json({ msg: "Usuário criado com sucesso!" });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao cadastrar" });
    }
})


app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha é obrigatória!" });
    }

    // check if user exists
    const user = await Cliente.findOne({ email: email });

    if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado!" });
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
        return res.status(422).json({ msg: "Senha inválida" });
    }


    try {
        const secret = process.env.SECRET;

        const token = jwt.sign(
            {
                id: user._id,
            },
            secret
        );

        res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
    } catch (error) {
        res.status(500).json({ msg: error });
    }
})



const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.set('strictQuery', true);

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL_DEV, options);
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`O Web Server está on em http://${host}:${port}`);
        });
    } catch (error) {
        console.log(`Erro ao conectar ao MongoDB: ${error}`);
    }
};

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

if (process.env.NODE_ENV !== 'test' && process.env.MONGO_URL_DEV) {
    connectToMongoDB();
} else {
    console.log('A variável de ambiente MONGO_URL_DEV não está definida.');
}
