import os

def criar_estrutura_projeto(base_dir):
    estrutura = {
        "src": {
            "main.cpp": "#include <gtk/gtk.h>\n\nint main(int argc, char *argv[]) {\n    GtkApplication *app;\n    int status;\n\n    app = gtk_application_new(\"com.mercadinho.app\", G_APPLICATION_FLAGS_NONE);\n\n    // Placeholder para adicionar as janelas e lógica do aplicativo\n\n    g_object_unref(app);\n    return status;\n}\n",
            "ui": {
                "login.cpp": "// Código da interface de login com GTK\n",
                "cadastro.cpp": "// Código da interface de cadastro com GTK\n",
                "vendas.cpp": "// Código da interface de vendas com GTK\n"
            },
            "backend": {
                "estoque.cpp": "#include \"estoque.h\"\n",
                "estoque.h": "#ifndef ESTOQUE_H\n#define ESTOQUE_H\n\n#include <string>\n\nclass Estoque {\npublic:\n    void adicionarProduto(const std::string& nome, int quantidade);\n    void removerProduto(const std::string& nome, int quantidade);\n};\n\n#endif",
                "vendas.cpp": "#include \"vendas.h\"\n",
                "vendas.h": "#ifndef VENDAS_H\n#define VENDAS_H\n\n#include <string>\n\nclass Vendas {\npublic:\n    void registrarVenda(const std::string& produto, int quantidade, double preco);\n};\n\n#endif",
                "relatorios.cpp": "#include \"relatorios.h\"\n",
                "relatorios.h": "#ifndef RELATORIOS_H\n#define RELATORIOS_H\n\nclass Relatorios {\npublic:\n    void gerarRelatorioVendas();\n};\n\n#endif"
            },
            "database": {
                "database.cpp": "#include \"database.h\"\n\nvoid Database::conectar() {\n    // Código para conectar ao banco de dados (ex: SQLite)\n}\n\nvoid Database::criarTabela() {\n    // Código para criar tabelas no banco de dados\n}\n",
                "database.h": "#ifndef DATABASE_H\n#define DATABASE_H\n\nclass Database {\npublic:\n    void conectar();\n    void criarTabela();\n};\n\n#endif"
            }
        },
        "assets": {
            "styles.css": "/* Arquivo de estilos, caso necessário */"
        },
        "database.db": "",
        "README.md": "# Documentação do Projeto Mercadinho com GTK\n\nEste projeto utiliza o GTK para a criação da interface gráfica."
    }

    def criar_pasta_e_arquivos(caminho_base, estrutura):
        for nome, conteudo in estrutura.items():
            caminho = os.path.join(caminho_base, nome)
            if isinstance(conteudo, dict):
                os.makedirs(caminho, exist_ok=True)
                criar_pasta_e_arquivos(caminho, conteudo)
            else:
                with open(caminho, "w", encoding="utf-8") as arquivo:
                    arquivo.write(conteudo)

    criar_pasta_e_arquivos(base_dir, estrutura)
    print(f"Estrutura criada no diretório: {base_dir}")

# Diretório onde o projeto será criado
diretorio_base = os.path.join(os.getcwd(), "ProjetoMercadinhoGTK")
criar_estrutura_projeto(diretorio_base)
