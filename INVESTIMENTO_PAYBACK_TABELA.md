# Tabela de investimento — Payback Movi Kids

> **Preencher na planilha Google (aba INVESTIMENTO):**  
> [MOVIKIDS_Planilha_Base — INVESTIMENTO](https://docs.google.com/spreadsheets/d/1ULMUx8AqZkZ75Ed0iRK_lQWc3I7YV9Itfoe-1JY5618/edit)

Preencha a coluna **Valor (R$)** (coluna D). Marque **N** em *Entra?* se o item não deve entrar no payback.  
**Total investimento (I)** = célula **B6** (fórmula automática) = soma dos itens com *Entra?* = **S**.

Recriar/atualizar estrutura da aba:

```powershell
cd C:\Users\riboc\Projects\google-drive-sheets-auth
node scripts/criar-aba-investimento-movikids.js
```

---

## Datas


| Campo                              | Preencher    |
| ---------------------------------- | ------------ |
| Data de inauguração                | ***/***/2026 |
| Mês início do payback (1ª receita) | ___/2026     |


---

## 1. Frota e equipamentos


| #    | Item                              | Valor (R$)  | Entra? | Observação |
| ---- | --------------------------------- | ----------- | ------ | ---------- |
| 1.1  | Carro elétrico 01                 | 5300       | S      |            |
| 1.2  | Carro elétrico 02                 |             | S      |            |
| 1.3  | Carro elétrico 03                 |             | S      |            |
| 1.4  | Carro elétrico 04                 |             | S      |            |
| 1.5  | Carro elétrico 05                 |             | S      |            |
| 1.6  | Carro elétrico 06                 |             | S      |            |
| 1.7  | Triciclo 01                       |             | S      |            |
| 1.8  | Triciclo 02                       |             | S      |            |
| 1.9  | Pelúcia / veículo pelúcia 01      |             | S      |            |
| 1.10 | Pelúcia / veículo pelúcia 02      |             | S      |            |
| 1.11 | Baterias extras                   |             | S      |            |
| 1.12 | Carregadores                      |             | S      |            |
| 1.13 | Frota reserva / reposição inicial |             | S      |            |
| 1.14 | Outro veículo: _______________    |             | S      |            |
|      | **Subtotal frota**                | **_______** |        |            |


---

## 2. Loja / quiosque (Golden Shopping Calhau)


| #   | Item                                        | Valor (R$)  | Entra? | Observação |
| --- | ------------------------------------------- | ----------- | ------ | ---------- |
| 2.1 | Montagem do quiosque                        |             | S      |            |
| 2.2 | Identidade visual (logo, fachada, adesivos) |             | S      |            |
| 2.3 | Decoração e ambientação                     |             | S      |            |
| 2.4 | Balcão / mobiliário                         |             | S      |            |
| 2.5 | TV / painel / suporte                       |             | S      |            |
| 2.6 | Iluminação                                  |             | S      |            |
| 2.7 | Caução shopping (se não devolvida)          |             | S      |            |
| 2.8 | Taxa de entrada / setup shopping            |             | S      |            |
| 2.9 | Outro: _______________                      |             | S      |            |
|     | **Subtotal loja**                           | **_______** |        |            |


---

## 3. Tecnologia e operação


| #   | Item                             | Valor (R$)  | Entra? | Observação |
| --- | -------------------------------- | ----------- | ------ | ---------- |
| 3.1 | Sistema / software / implantação |             | S      |            |
| 3.2 | Tablet(s) operacional(is)        |             | S      |            |
| 3.3 | Celular(es) operacional(is)      |             | S      |            |
| 3.4 | Impressora / material QR balcão  |             | S      |            |
| 3.5 | Roteador / rede / cabos          |             | S      |            |
| 3.6 | Outro: _______________           |             | S      |            |
|     | **Subtotal tecnologia**          | **_______** |        |            |


---

## 4. Abertura e outros (únicos)


| #   | Item                                      | Valor (R$)  | Entra? | Observação                                  |
| --- | ----------------------------------------- | ----------- | ------ | ------------------------------------------- |
| 4.1 | Estoque inicial / acessórios              |             | S      |                                             |
| 4.2 | Marketing de inauguração (campanha única) |             | S      |                                             |
| 4.3 | Jurídico / contábil abertura              |             | S      |                                             |
| 4.4 | Transporte / frete da frota               |             | S      |                                             |
| 4.5 | Seguro antecipado (parte não recuperável) |             | N      |                                             |
| 4.6 | Capital de giro (caixa reserva)           |             | N      | Só marque S se quiser payback “caixa total” |
| 4.7 | Outro: _______________                    |             | S      |                                             |
|     | **Subtotal abertura**                     | **_______** |        |                                             |


---

## Total


|                            | Valor (R$)  |
| -------------------------- | ----------- |
| Subtotal frota (1)         |             |
| Subtotal loja (2)          |             |
| Subtotal tecnologia (3)    |             |
| Subtotal abertura (4)      |             |
| **INVESTIMENTO TOTAL (I)** | **_______** |


---

## O que NÃO preencher aqui

Estes valores **não** entram nesta tabela — o sistema já calcula sozinho todo mês:


| Item                   | Onde fica no sistema     |
| ---------------------- | ------------------------ |
| Aluguel CTO (shopping) | Contrato + Dashboard CTO |
| Salários, luz, água    | Aba **CUSTOS**           |
| Marketing mensal       | Aba **CUSTOS**           |
| Manutenção corrente    | Aba **CUSTOS**           |
| Faturamento            | Locações encerradas      |


---

## Depois de preencher

Envie esta tabela (ou foto/planilha) para cadastrar no **CONFIG** e ligar o painel **Payback** no Dashboard.

Arquivo de fórmulas: `MEMORIAL_PAYBACK_INVESTIMENTO.md`