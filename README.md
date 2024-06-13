# Desafio HIT

O projeto está integrado com a Agenda Google, então quando for feito um request para criar um evento, também será criado na agenda em que foi feito o login da aplicação.

O id da task, utilizado nos endpoints de post, patch, put e delete, são do campo **_id**.

Por exemplo, ao acessar o endpoint **get** /tasks, vamos obter na resposta um objeto com o array tasks, que são tarefas salvas no banco de dados pela aplicaçãoe e que tem o parâmetro **_id**, e GoogleAgendaEvents, que são os eventos cadastrados na agenda Google do usuário.
## Instalação
##### OBS: todos os comandos são considerando a pasta root (hit-communications-challenge) como inicial.

Para realizar a instalção dos pacotes, basta utilizar o seguinte comando:

    $ npm install

## Rodando o projeto

Para rodar o projeto, basta utilizar o seguinte comando:

    $ npm start

## Testes 

Para realizar os testes, basta utilizar o seguinte comando:

    $ npm start-and-test

## Monitoramento

Para acompanhar as metricas do app, basta acessar o endpoint **/status**, supondo que o app esteja rodando na url http://localhost:3000, acesse:

    http://localhost:3000/status
