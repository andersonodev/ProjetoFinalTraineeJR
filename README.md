# Projeto Final - Trainees Ibmec Jr

## 👥 Integrantes

- **Anderson**
- **João**
- **Heitor**
- **Bernardo**
- **Felipe**

Este repositório contém o projeto final dos trainees da Ibmec Jr, desenvolvido com o objetivo de aprimorar a gestão de membros da empresa e substituir a utilização de planilhas Excel por um sistema mais eficiente e automatizado.

## 🧠 Contexto

A Ibmec Jr enfrenta desafios na organização e visualização de dados dos membros. Atualmente, isso é feito por meio de planilhas, o que dificulta a manutenção e escalabilidade das informações. Este projeto tem como missão resolver esse problema.

## 🎯 Objetivo

Dar continuidade ao software iniciado pelo primeiro grupo, focando na colaboração, aprendizado mútuo e no desenvolvimento de novas funcionalidades, respeitando os diferentes níveis de conhecimento técnico dos integrantes.

Repositório base do grupo anterior:
🔗 [Projeto Inicial](https://github.com/DanielJT20/ProjetoFinalTraineeJR/tree/primeira)

## ✅ Requisitos do Projeto

- [ ]  Utilizar GitHub ou GitLab para controle de versionamento.
- [ ]  Comentar o código para facilitar a leitura e manutenção.
- [ ]  Desenvolver sistema de **reset de senha**.
- [ ]  Criar funcionalidade de **cadastro de usuários** (restrito ao administrador).
- [ ]  Implementar **sistema de notificações e advertências**:
  - 3 notificações = 1 advertência
  - 3 advertências = exclusão do colaborador
- [ ]  Exibir status de atividade do colaborador (ativo/inativo) e período correspondente.
- [ ]  Criar **página de registros** com as advertências atribuídas.
- [ ]  **Publicar a aplicação** em um serviço de hospedagem (sugestão: Firebase Hosting).
- [ ]  Documentar o software ao final.
- [ ]  Realizar **apresentação final**, abordando os desafios enfrentados.
- [ ]  Separar versão com apenas os requisitos obrigatórios da versão com funcionalidades extras (se houver).

## 🚀 Tecnologias Utilizadas

- **Frontend**: React, HTML, CSS, TypeScript, Tailwind CSS
- **Backend**: Firebase Functions, Node.js, Express.js
- **Banco de Dados**: Firebase Firestore, Firebase Realtime Database
- **Autenticação**: Firebase Authentication
- **Hospedagem**: Firebase Hosting
- **Testes**: Jest, React Testing Library
- **Controle de Versionamento**: Git, GitHub Actions (para CI/CD)
- **Ferramentas de Desenvolvimento**: ESLint, Prettier, Husky

## 📄 Funcionalidades

- **Gestão de Usuários**: Cadastro, edição, exclusão e visualização de informações.
- **Sistema de Penalidades**: Controle de notificações e advertências com regras automáticas.
- **Dashboard**: Exibição de estatísticas e status dos membros.
- **Autenticação**: Login e reset de senha.
- **Histórico de Ações**: Registro detalhado de todas as ações realizadas no sistema.

### Diferenciação de Funcionalidades por Tipo de Usuário

- **Usuário Normal**:
  - Visualizar informações pessoais e notificações.
  - Consultar o histórico de ações relacionadas ao próprio perfil.
  - Receber notificações e advertências.

- **Administrador**:
  - Todas as funcionalidades de um usuário normal.
  - Gerenciar usuários (cadastrar, editar, excluir).
  - Atribuir notificações e advertências a colaboradores.
  - Visualizar o status de atividade de todos os colaboradores.

- **Super Administrador**:
  - Todas as funcionalidades de um administrador.
  - Gerenciar permissões de outros administradores.
  - Acessar relatórios completos e estatísticas avançadas.
  - Configurar parâmetros do sistema (ex.: regras de penalidades).

## 🛠️ Configuração do Projeto

### Pré-requisitos

- Node.js (versão 16 ou superior)
- Firebase CLI
- Gerenciador de pacotes (npm ou yarn)

### Passos para Configuração

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/ProjetoFinalTraineeJR.git
   cd ProjetoFinalTraineeJR
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Firebase:
   - Faça login no Firebase CLI:
     ```bash
     firebase login
     ```
   - Inicialize o Firebase no projeto:
     ```bash
     firebase init
     ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Acesse a aplicação no navegador:
   ```
   http://localhost:8080
   ```

### Deploy para Produção

1. Gere o build da aplicação:
   ```bash
   npm run build
   ```

2. Faça o deploy no Firebase Hosting:
   ```bash
   firebase deploy
   ```

## 📄 Documentação

- **Explicações das funcionalidades implementadas**: Detalhamento de cada funcionalidade do sistema.
- **Estrutura do banco de dados**: Descrição das coleções e documentos no Firestore.
- **Fluxo de autenticação e permissões**: Como o sistema gerencia usuários e níveis de acesso.
- **Desafios enfrentados e soluções adotadas**: Relato das dificuldades e como foram superadas.

## 🧩 Contribuição

Este projeto valoriza o trabalho em equipe. Caso algum membro possua menor conhecimento técnico, é dever dos demais auxiliá-lo no processo para garantir a entrega conjunta e a aprendizagem de todos.

### Como Contribuir

1. Faça um fork do repositório.
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m "Minha nova feature"
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin minha-feature
   ```
5. Abra um Pull Request.

## IBEEEEEEEE MECCCCCCCCC 💙💙💙💙💙

