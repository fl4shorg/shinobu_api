#!/bin/bash

# === Cores ANSI ===
NOCOLOR='\033[0m'
RED='\033[0;31m'
GREEN='\033[1;32m'
MAGENTA='\033[0;35m'

clear

# Mensagem inicial toda vermelha
printf "${RED}Iniciando NEEXT API...\n\n${NOCOLOR}"

# Executa o index.js
node index.js

# Mensagem após fechamento (opcional)
printf "${RED}Api Desligada!\n${NOCOLOR}"