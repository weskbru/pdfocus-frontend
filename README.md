# 📚 pdFocus - Frontend

![Angular](https://img.shields.io/badge/Angular-20-red)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue)
![Status](https://img.shields.io/badge/Status-Work_in_Progress-yellow)
![Uso](https://img.shields.io/badge/Portfolio-WIP_(não_clonar)-lightgrey)

> ⚠️ **Aviso Importante**
>
> Este projeto é um **portfólio work-in-progress**.  
> O código está público **apenas para avaliação técnica** (arquitetura, padrões e evolução).  

---

## ✨ Visão Geral

# pdFocus - Frontend

O **pdFocus** é um projeto solo que estou desenvolvendo com dois objetivos: **aprender na prática** e criar um **micro-SaaS para gestão de estudos**.  
A ideia é ser uma *central de comando* para organizar **disciplinas**, **resumos** e **materiais**, ajudando não só outros estudantes, mas também **meus próprios estudos**.

Este repositório contém o **frontend em Angular**, que consome a **API do backend** construída em **Java + Spring Boot**.

Mais do que um produto em evolução, o **pdFocus** é parte do meu **portfólio**, onde aplico **arquitetura de software**, **boas práticas** e **integração entre frontend e backend**.  
Cada funcionalidade é testada e utilizada por mim, tornando o projeto **vivo e centrado no aprendizado real**.

- **Organizar**: cadastrar disciplinas e agrupar conteúdo.
- **Criar**: escrever e gerenciar resumos.
- **Armazenar**: upload de PDFs, slides e imagens.
- **Otimizar** *(visão futura)*: revisão espaçada para retenção de conhecimento.

---

## 📸 Screenshot do Dashboard (MVP)

> Substitua pelo print real do seu dashboard quando quiser:
>
> ![Dashboard do pdFocus](https://via.placeholder.com/1000x500.png?text=Preview+Dashboard)

---

## 🛠️ Stack Tecnológica

| Categoria        | Tecnologia     |
|------------------|----------------|
| **Framework**    | Angular 20+    |
| **Linguagem**    | TypeScript     |
| **Estilização**  | Tailwind CSS   |
| **Formulários**  | Reactive Forms |
| **Roteamento**   | Angular Router |
| **HTTP Client**  | HttpClient     |
| **Pacotes**      | NPM            |

---

## 🏛️ Arquitetura & Boas Práticas

- **Componentes Standalone** → modularidade e manutenção facilitada.  
- **Lazy Loading de Rotas** → páginas carregadas sob demanda (login, cadastro, dashboard).  
- **Serviços (Core)** → comunicação com API + token centralizados (`AuthService`).  
- **Guards** → proteção de rotas privadas como `/dashboard`.  
- **Formulários Reativos** → validações robustas em cadastro/login.

---

## 🗺️ Status & Roadmap

✅ Estrutura inicial (Angular)  
✅ Autenticação (cadastro/login)  
✅ Guards de rota  
✅ Layout do Dashboard (dados mock)

**Próximos passos**
- Conectar Dashboard ao backend real (dados dinâmicos)
- CRUD de Disciplinas
- Upload/gestão de materiais

---

## 🔎 Para recrutadores

- Dê uma olhada em:
  - `src/app/core/auth.ts` (serviço e DTOs)
  - `src/app/app.routes.ts` (roteamento + lazy)
  - `src/app/features/**` (organização por feature)
- O objetivo aqui é demonstrar **arquitetura, padrões e evolução**, não um produto final.

---

## 📄 Licença & Uso

**Todos os direitos reservados.**  
Uso permitido **somente para avaliação**.  
Não é permitido clonar, executar, distribuir, sublicenciar ou criar derivados neste momento.

> Se você tiver interesse técnico ou feedback, fale comigo 🙂

---

## 👨‍💻 Autor

Wesley Bruno – [LinkedIn](https://linkedin.com/in/seu-perfil)

---

⭐ Curtiu a ideia? Deixe um **Star** para acompanhar a evolução.
