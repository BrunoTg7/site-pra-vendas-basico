project('ProjetoMercadinhoGTK', 'cpp',
        version: '1.0',
        default_options: ['cpp_std=c++17', 'buildtype=release'])

executable('mercadinho',
           'src/main.cpp',
           'src/ui/login.cpp',
           'src/ui/cadastro.cpp',
           'src/ui/vendas.cpp',
           'src/backend/estoque.cpp',
           'src/backend/vendas.cpp',
           'src/backend/relatorios.cpp',
           'src/database/database.cpp',
           dependencies: dependency('gtk4'),
           install: true,
           cpp_args: ['-mwindows'])


gtk_dep = dependency('gtk4')  # Dependência do GTK4

