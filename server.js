const { randomInt } = require('crypto')
const { response } = require('express')
const express = require('express')// inclui biblioteca 'express'
const app = express()// chama função construtora para instanciar aplicação
app.use(express.static('public'))// permite acessar aquivos da pasta 'public'
const http = require('http').Server(app)// instancia servidor http
const serverSocket = require('socket.io')(http)// inclui biblioteca 'socket.io'
const port = 8000// declarando e atribuindo valor a porta
var users = []// declarando array que armazena nome de usuários online

// inicia servidor http
http.listen(port, function () {
    console.log('Servidor Iniciado')
    console.log(`Acesse o site "localhost:${port}"`)
})

// atende requisições http
app.get('/', function (req, resp) {
    resp.sendFile(__dirname + '/index.html')
})

// canal de comunicação com o cliente
serverSocket.on('connection', function (socket) {
    // categoria login - executa quando entrar novo cliente
    socket.on('login', function (nickname) {
        if (users.indexOf(nickname) == -1) {
            console.log(`Cliente Conectado: ${nickname}`)
            users.push(nickname)
        }
        serverSocket.emit('login/logoff', users)
        socket.nickname = nickname
    })

    // categoria logoff - executa quando cliente sair da aplicação
    socket.on('logoff', function (nickname) {
        console.log(`Cliente Desconectado: ${nickname}`)
        users.splice(users.indexOf(nickname), 1)
        serverSocket.emit('login/logoff', users)
        socket.nickname = null
    })

    // categoria chat msg - executa quando cliente enviar mensagens no chat
    socket.on('chat msg', function (msg) {
        if (msg != '') {
            console.log(`Mensagem Recebida do Cliente ${socket.nickname} : ${msg}`)
            serverSocket.emit('chat msg', `${socket.nickname}: ${msg}`)
        }
    })

    // categoria status - executa quando algum cliente estiver digitando
    socket.on('status', function (msg) {
        socket.broadcast.emit('status', msg)
    })
})