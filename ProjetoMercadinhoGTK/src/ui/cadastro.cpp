#include "cadastro.h"
#include "login.h"
#include <gtk/gtk.h>

// Callback para voltar à tela de login
static void on_back_to_login_button_clicked(GtkWidget *widget, gpointer user_data)
{
    GtkWindow *window = GTK_WINDOW(user_data);

    // Troca o conteúdo da janela para o layout de login
    show_login_window(gtk_window_get_application(window));
}

// Função para exibir a área de cadastro
void show_cadastro_window(GtkWindow *parent_window)
{
    // Ajusta o título da janela para "Cadastro"
    gtk_window_set_title(GTK_WINDOW(parent_window), "cadastro");

    GtkWidget *vbox = gtk_box_new(GTK_ORIENTATION_VERTICAL, 10);

    GtkWidget *label = gtk_label_new("Bem-vindo à área de cadastro!");
    GtkWidget *back_button = gtk_button_new_with_label("Voltar ao Login");

    gtk_box_append(GTK_BOX(vbox), label);
    gtk_box_append(GTK_BOX(vbox), back_button);

    // Conecta o botão "Voltar ao Login" ao callback
    g_signal_connect(back_button, "clicked", G_CALLBACK(on_back_to_login_button_clicked), parent_window);

    // Define o novo layout na mesma janela
    gtk_window_set_child(GTK_WINDOW(parent_window), vbox);
}
