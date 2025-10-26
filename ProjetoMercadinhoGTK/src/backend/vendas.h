#ifndef VENDAS_H
#define VENDAS_H

#include <string>

class Vendas {
public:
    void registrarVenda(const std::string& produto, int quantidade, double preco);
};

#endif