// backend/server.js
require('dotenv').config(); // Carrega variáveis do .env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const QuizResult = require('./models/QuizResult'); // Importa o modelo

const app = express();
const PORT = process.env.PORT || 3000; // Porta do servidor, ou 3000

// Middleware
app.use(cors()); // Permite requisições de outras origens (seu frontend)
app.use(express.json()); // Permite que o servidor entenda JSON no corpo das requisições

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado ao MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Gabarito do Quiz (AGORA COM SUAS PERGUNTAS E RESPOSTAS FINAIS!)
const gabarito = {
    q1: 'b', // Pergunta 1: Qual a capital do Brasil? (Resposta: Brasília)
    q2: 'c', // Pergunta 2: Ação recomendada aos pais. (Resposta: Limitar tempo de tela)
    q3: 'c', // Pergunta 3: Principal "moeda" das redes. (Resposta: Atenção e tempo)
    q4: 'c', // Pergunta 4: Principal função do painel de controle da IA. (Resposta: O que veem e como se sentem)
    q5: 'd', // Pergunta 5: Ex-executivo do Google que fala de dopamina. (Resposta: Sean Parker)
    q6: 'd', // Pergunta 6: Estratégia algorítmica de polarização. (Resposta: Filtro bolha)
    q7: 'c', // Pergunta 7: Terceiro objetivo das plataformas. (Resposta: Influência da percepção)
    q8: 'c', // Pergunta 8: Principal ideia por trás da reforma de sistemas. (Resposta: Priorizar bem-estar humano)
    q9: 'b', // Pergunta 9: Evento histórico dos EUA citado. (Resposta: Eleições de 2016)
    q10: 'c', // Pergunta 10: Principal crítica dos ex-funcionários. (Resposta: Impacto negativo na saúde mental)
};

// Rota para submeter as respostas do quiz
app.post('/submit-quiz', async (req, res) => {
    const { numeroAluno, respostas } = req.body; // Mudado de 'nome' para 'numeroAluno'
    let pontuacao = 0;

    // Validação do número do aluno
    if (numeroAluno === undefined || typeof numeroAluno !== 'number' || numeroAluno < 1 || numeroAluno > 50) {
        return res.status(400).json({ message: 'Número do aluno deve ser um valor entre 1 e 50.' });
    }

    // Corrige o quiz
    for (const qKey in respostas) {
        if (gabarito.hasOwnProperty(qKey) && respostas[qKey] === gabarito[qKey]) {
            pontuacao++;
        }
    }

    try {
        // Verifica se o aluno já enviou o quiz
        const existingResult = await QuizResult.findOne({ numeroAluno });
        if (existingResult) {
            return res.status(409).json({ message: `Aluno número ${numeroAluno} já enviou o quiz.` });
        }

        // Salva o resultado no banco de dados
        const newQuizResult = new QuizResult({ numeroAluno, pontuacao });
        await newQuizResult.save();
        console.log(`Resultado salvo: Aluno ${numeroAluno} - ${pontuacao} pontos`);
        res.status(201).json({ message: 'Respostas enviadas e salvas!', pontuacao });
    } catch (error) {
        console.error('Erro ao salvar resultado do quiz:', error);
        res.status(500).json({ message: 'Erro ao processar as respostas.' });
    }
});

// Rota para obter o ranking
app.get('/ranking', async (req, res) => {
    try {
        // Busca todos os resultados, ordena por pontuação (desc) e número do aluno (asc)
        const ranking = await QuizResult.find()
            .sort({ pontuacao: -1, numeroAluno: 1 }) // Maior pontuação primeiro, depois os de menor número
            .limit(50); // Limita aos 50 melhores, ou todos se houver menos

        res.status(200).json(ranking);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});