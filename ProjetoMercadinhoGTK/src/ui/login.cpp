#include "login.h"
#include "cadastro.h"
#include <gtk/gtk.h>

// Callback para tratar o clique no botão de login
void on_login_button_clicked(GtkWidget *widget, gpointer user_data)
{
    g_print("Botão de login clicado!\n");

    GtkWidget **entries = (GtkWidget **)user_data;

    // Logs para depuração: Verificando os widgets no array
    g_print("Verificando os widgets no array entries...\n");
    for (int i = 0; i < 4; i++)
    {
        g_print("entries[%d]: %p\n", i, entries[i]);
    }

    // Verificações para garantir que os campos de entrada são válidos
    if (!GTK_IS_EDITABLE(entries[0]) || !GTK_IS_EDITABLE(entries[1]))
    {
        g_warning("Um ou mais campos de entrada não são do tipo GtkEditable.");
        return;
    }

    if (entries[2] == NULL || entries[3] == NULL)
    {
        g_warning("Rótulo de mensagem ou janela principal não foi inicializado corretamente.");
        return;
    }

    const gchar *username = gtk_editable_get_text(GTK_EDITABLE(entries[0])); // Obtém o texto do campo de usuário
    const gchar *password = gtk_editable_get_text(GTK_EDITABLE(entries[1])); // Obtém o texto do campo de senha
    GtkWidget *message_label = entries[2];                                   // Rótulo de
    // Logs para depuração
    g_print("Usuário: %s\n", username);
    g_print("Senha: %s\n", password);

    // Validação de entrada
    if (username == NULL || g_strcmp0(username, "") == 0)
    {
        g_print("Campo de usuário está vazio.\n");
        gtk_label_set_text(GTK_LABEL(message_label), "Por favor, preencha o campo de usuário.");
    }
    else if (g_strcmp0(username, "admin") == 0 && g_strcmp0(password, "1234") == 0)
    {
        g_print("Login bem-sucedido para o usuário '%s'.\n", username);
        gtk_label_set_text(GTK_LABEL(message_label), "Login bem-sucedido!");

        show_cadastro_window(GTK_WINDOW(entries[3]));
    }

    else
    {
        g_print("Credenciais inválidas para o usuário '%s'.\n", username);
        gtk_label_set_text(GTK_LABEL(message_label), "Usuário ou senha inválidos.");
    }

    g_print("Fim do callback on_login_button_clicked.\n");
}

// Função para exibir a interface de login
void show_login_window(GtkApplication *app)
{
    g_print("Inicializando a janela de login...\n");

    GtkCssProvider *provider = gtk_css_provider_new();

    // Verificando e carregando o CSS
    if (!g_file_test("../assets/styles.css", G_FILE_TEST_EXISTS))
    {
        g_warning("O arquivo CSS não foi encontrado. Verifique o caminho.");
    }
    else
    {
        gtk_css_provider_load_from_path(provider, "../assets/styles.css");
        g_print("CSS carregado com sucesso.\n");
    }

    gtk_style_context_add_provider_for_display(
        gdk_display_get_default(),
        GTK_STYLE_PROVIDER(provider),
        GTK_STYLE_PROVIDER_PRIORITY_USER);

    // Criação da janela principal
    GtkWidget *window = gtk_application_window_new(app);
    gtk_window_set_title(GTK_WINDOW(window), "Tela de Login");
    gtk_window_set_default_size(GTK_WINDOW(window), 800, 600);
    gtk_window_maximize(GTK_WINDOW(window));

    // Layout principal (caixa vertical)
    // Layout principal (caixa vertical)
    GtkWidget *vbox = gtk_box_new(GTK_ORIENTATION_VERTICAL, 10);
    gtk_widget_set_halign(vbox, GTK_ALIGN_CENTER);
    gtk_widget_set_valign(vbox, GTK_ALIGN_CENTER);
    gtk_widget_add_css_class(vbox, "central-box");
    gtk_window_set_child(GTK_WINDOW(window), vbox);
    gtk_window_set_default_size(vbox, 400, 400);

    // Criação dos widgets
    GtkWidget *username_label = gtk_label_new("Usuário:");
    GtkWidget *username_entry = gtk_entry_new(); // Campo de entrada para usuário
    gtk_widget_set_name(username_entry, "username_entry");
    gtk_widget_add_css_class(username_entry, "username_entry");
    gtk_window_set_default_size(username_entry, 300, 30);

    GtkWidget *password_label = gtk_label_new("Senha:");
    GtkWidget *password_entry = gtk_entry_new();                // Campo de entrada para senha
    gtk_entry_set_visibility(GTK_ENTRY(password_entry), FALSE); // Oculta os caracteres
    gtk_widget_set_name(password_entry, "password_entry");
    gtk_widget_add_css_class(password_entry, "password_entry");
    gtk_window_set_default_size(password_entry, 300, 30);

    GtkWidget *login_button = gtk_button_new_with_label("Login");
    gtk_widget_add_css_class(login_button, "login_btn");
    gtk_window_set_default_size(login_button, 100, 20);

    GtkWidget *message_label = gtk_label_new(""); // Criação do rótulo de mensagens
    gtk_widget_set_name(message_label, "message_label");

    // Adicionando widgets ao layout
    gtk_box_append(GTK_BOX(vbox), username_label);
    gtk_box_append(GTK_BOX(vbox), username_entry);
    gtk_box_append(GTK_BOX(vbox), password_label);
    gtk_box_append(GTK_BOX(vbox), password_entry);
    gtk_box_append(GTK_BOX(vbox), login_button);
    gtk_box_append(GTK_BOX(vbox), message_label);

    // Array de widgets para o callback (alocado dinamicamente)
    GtkWidget **entries = g_new(GtkWidget *, 4);
    entries[0] = username_entry;
    entries[1] = password_entry;
    entries[2] = message_label;
    entries[3] = window;

    // Logs para verificar os widgets
    g_print("username_entry: %p\n", username_entry);
    g_print("password_entry: %p\n", password_entry);
    g_print("message_label: %p\n", message_label);
    g_print("window: %p\n", window);

    // Vinculando o callback do botão ao clique
    g_signal_connect(login_button, "clicked", G_CALLBACK(on_login_button_clicked), entries);

    gtk_window_present(GTK_WINDOW(window));
    g_print("Janela de login exibida.\n");
}
