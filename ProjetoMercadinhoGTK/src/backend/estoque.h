#ifndef ESTOQUE_H
#define ESTOQUE_H

#include <string>

class Estoque {
public:
    void adicionarProduto(const std::string& nome, int quantidade);
    void removerProduto(const std::string& nome, int quantidade);
};

#endif