# 🧾 Documentação de Migração para React

Este documento descreve o processo de migração do projeto original baseado em HTML/CSS/JS puro para a biblioteca React.js, com o objetivo de obter maior modularização, escalabilidade e manutenibilidade do código.

---

## 🗂️ 1. Estrutura Original

O projeto original era composto por:
- Arquivos HTML estáticos com múltiplas seções
- Estilos centralizados em arquivos `.css`
- Funcionalidades básicas com JavaScript tradicional
- Sem modularização ou roteamento entre "páginas"

---

## 🔁 2. Justificativa para Migração

A decisão de migrar o projeto para React foi motivada pelos seguintes fatores:

- Organização de código com **componentes reutilizáveis**
- Facilidade de **manutenção e atualização**
- Integração mais fluida com **Firebase** e outras APIs
- Melhor estrutura para gerenciar **estados e interações**
- Maior aprendizado e experiência prática com tecnologias modernas de frontend

---

## 🛠️ 3. Etapas da Migração

### 3.1 Criação do Projeto React

Utilizamos o Create React App para iniciar o novo projeto:

```bash
npx create-react-app projeto-final-trainee-react
cd projeto-final-trainee-react
npm start
```

---

### 3.2 Conversão de HTML para JSX

- O conteúdo dos arquivos HTML foi transferido para o arquivo `App.js`.
- A conversão de sintaxe HTML → JSX foi realizada com a ferramenta:
  🔗 https://magic.reactjs.net/htmltojsx.htm
- Ajustes realizados:
  - `class` → `className`
  - `for` → `htmlFor`
  - Tags auto-fechadas corretamente (`<img />`, `<input />`)
  - Comentários HTML convertidos para JSX (`{/* ... */}`)

---

### 3.3 Separação em Componentes

Criamos componentes reutilizáveis para cada parte da interface:

```
src/
├── components/
│   ├── Header.js
│   ├── Footer.js
│   ├── NotificationCard.js
│   └── UserList.js
├── pages/
│   ├── Home.js
│   ├── AdminPanel.js
│   └── Login.js
└── App.js
```

---

### 3.4 Migração do CSS

- Os arquivos `.css` originais foram importados em cada componente React.
- Também utilizamos módulos CSS (`.module.css`) em alguns componentes para evitar conflitos globais de estilo.

---

### 3.5 Lógica JavaScript

- A lógica de exibição dinâmica foi adaptada com o uso de **hooks**:
  - `useState` para armazenar variáveis como notificações, usuários, e status.
  - `useEffect` para chamadas de dados e simulação de ciclo de vida.
- Eventos como `onClick`, `onChange` e validações de formulário foram adaptados para a sintaxe React.

---

### 3.6 Roteamento (Se necessário)

Foi adicionado o React Router:

```bash
npm install react-router-dom
```

E configurado no `App.js`:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### 3.7 Publicação

A nova aplicação React foi hospedada no **Firebase Hosting**:

```bash
npm run build
firebase deploy
```

---

## 📌 4. Resultados

- 🔧 Código modular, com manutenção facilitada
- 👥 Componentes reutilizáveis e responsivos
- 📡 Possibilidade de integrar APIs externas com facilidade
- 🚀 Preparado para futuras expansões (ex: autenticação, dashboard, etc.)

---

## 👨‍💻 Desenvolvedores

- Anderson  
- João  
- Heitor  
- Bernardo  
- Felipe  

---

**Status:** ✔️ Migração concluída com sucesso.  
**Observação:** A versão original foi mantida em um branch separado (`/legacy`) para fins de comparação.