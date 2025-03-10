#include <gtk/gtk.h>
#include "ui/login.h"

int main(int argc, char *argv[])
{
    // Inicializa a aplicação GTK com a flag atualizada
    GtkApplication *app = gtk_application_new("com.mercadinho.app", G_APPLICATION_DEFAULT_FLAGS);

    // Conecta o sinal de ativação para mostrar a janela de login
    g_signal_connect(app, "activate", G_CALLBACK(show_login_window), NULL);

    // Executa a aplicação
    int status = g_application_run(G_APPLICATION(app), argc, argv);

    // Limpa recursos após a execução
    g_object_unref(app);

    return status;
}

/*
cd "C:\Users\BRUNOTG\OneDrive\Documentos\site pra vendas basico\ProjetoMercadinhoGTK\src"

g++ -Wall -o mercadinho.exe main.cpp \
ui/login.cpp ui/cadastro.cpp ui/vendas.cpp \
backend/estoque.cpp backend/vendas.cpp backend/relatorios.cpp \
database/database.cpp resource.o `pkg-config --cflags --libs gtk4` -mwindows
 ou
 g++ -Wall -o mercadinho.exe src/main.cpp \
src/ui/login.cpp src/ui/cadastro.cpp src/ui/vendas.cpp \
src/backend/estoque.cpp src/backend/vendas.cpp src/backend/relatorios.cpp \
src/database/database.cpp `pkg-config --cflags --libs gtk4` -mwindows


*/