# 🎬 PerpetualWeb

Um aplicativo de catálogo de filmes e séries que consome a API do [The Movie Database (TMDb)](https://www.themoviedb.org/), desenvolvido com React + TypeScript. O projeto permite visualizar detalhes completos de produções, como trailers, elenco, provedores de streaming e muito mais.

## ✨ Funcionalidades

- Exibição dos filmes em destaque/trending no Hero com swipe (mobile e desktop)
- Página de detalhes com trailer, elenco, provedores, sinopse e mais
- Barra de busca funcional com redirecionamento para a página de detalhes
- Suporte tanto para **filmes** quanto para **séries**
- Animações com `framer-motion`
- Navegação com `react-router-dom`
- Design responsivo e estiloso com Tailwind CSS

## 🧪 Tecnologias

- React
- TypeScript
- Tailwind CSS
- Framer Motion
- React Router DOM
- TMDb API

## 📁 Estrutura de pastas

```bash
src/
├── assets/            # Imagens e mídias estáticas
├── components/                 # Componentes reutilizáveis e páginas principais
│   ├── header.tsx              # Componente fixo do topo com barra de busca
│   ├── heroBanner.tsx          # Banner principal com filmes em destaque
│   ├── homePage.tsx            # Página principal exibida na rota "/"
│   └── detailsPage.tsx         # Página de detalhes do filme/série
├── App.tsx            # Arquivo principal da aplicação
├── main.tsx           # Ponto de entrada da aplicação
