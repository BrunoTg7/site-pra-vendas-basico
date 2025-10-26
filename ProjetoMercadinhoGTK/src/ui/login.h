#ifndef LOGIN_H
#define LOGIN_H

#include <gtk/gtk.h>

// Declaração da função que exibe a janela de login
void show_login_window(GtkApplication *app);

// Declaração do callback do botão de login
void on_login_button_clicked(GtkWidget *widget, gpointer user_data);

#endif
