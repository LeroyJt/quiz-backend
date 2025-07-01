// backend/models/QuizResult.js
const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema({
    numeroAluno: { // Mudado de 'nome' para 'numeroAluno'
        type: Number,
        required: true,
        min: 1, // Número mínimo do aluno
        max: 50, // Número máximo do aluno
        unique: true // Garante que cada número de aluno só possa enviar o quiz uma vez
    },
    pontuacao: {
        type: Number,
        required: true,
        min: 0, // Pontuação mínima é 0
        max: 10 // Pontuação máxima é 10 (1 ponto por pergunta)
    },
    dataEnvio: {
        type: Date,
        default: Date.now // Data e hora do envio, padrão é o momento atual
    }
});

module.exports = mongoose.model('QuizResult', QuizResultSchema);