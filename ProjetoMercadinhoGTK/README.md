# Documentação do Projeto Mercadinho com GTK

Este projeto utiliza o GTK para a criação da interface gráfica.

ProjetoMercadinhoGTK/
├── README.md # Documentação do projeto
├── database.db # Banco de dados (ex: SQLite, para persistência)
├── assets/ # Estilos e recursos visuais
│ └── styles.css # Arquivo CSS para estilização do GTK
├── src/ # Código-fonte principal do projeto
│ ├── main.cpp # Arquivo principal que inicializa o aplicativo
│ ├── ui/ # Interfaces gráficas
│ │ ├── login.cpp # Lógica da tela de login
│ │ ├── login.h # Declaração da função de login
│ │ ├── cadastro.cpp # Lógica da tela de cadastro
│ │ ├── cadastro.h # Declaração da função de cadastro
│ │ ├── vendas.cpp # Lógica da tela de vendas
│ │ └── vendas.h # Declaração da função de vendas
│ ├── backend/ # Lógica de backend (estoque, vendas, relatórios)
│ │ ├── estoque.cpp # Implementação da classe Estoque
│ │ ├── estoque.h # Declaração da classe Estoque
│ │ ├── vendas.cpp # Implementação da classe Vendas
│ │ ├── vendas.h # Declaração da classe Vendas
│ │ ├── relatorios.cpp # Implementação da classe Relatórios
│ │ └── relatorios.h # Declaração da classe Relatórios
│ ├── database/ # Conexão com o banco de dados
│ │ ├── database.cpp # Implementação da classe Database
│ │ └── database.h # Declaração da classe Database
├── builddir/ # Arquivos temporários de construção (criado pelo Meson)
│ └── ... # Arquivos como build.ninja
├── meson.build # Arquivo de configuração do Meson
