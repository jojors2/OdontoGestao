sem comentario

para comitar pegar o codigo que foi feito em outro pc:

Quando abrir o projeto:
-> git pull origin main

Depois de programar:
git status
git add .
git commit -m "Descrição da alteração"
git push origin main

copiar tudo de uma vez para o outro PC:
git clone https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
cd SEU-REPOSITORIO
code .

tema dark horizon
tema bluloco dark theme





Primeira versão: 
- Login (Permitir acesso ao sistema)
- Dashboard (Mostrar informações do dia)
- Agenda (Marcar, alterar e cancelar consultas)
- Lembretes (Confirmação de consulta por e-mail, SMS ou integração futura)
- Orçamentos (Gerar valores estimados por tratamento)
- Pacientes (Cadastrar e gerenciar pacientes)
- Configurações

- Perfis
	- Administrador (Gerencia usuários e configurações gerais)
	- Dentista (Acessa agenda, pacientes e informações clínicas)
	- Recepcionista (Gerencia agenda e cadastro, com acesso clínico restrito)
-Consultas
	-Cadastro:
		Paciente
		Data
		Horário inicial
		Duração ou horário final
		Procedimento
		Observações
		Status da consulta
	-Status:
		Agendada
		Confirmada
		Em atendimento
		Concluída
		Cancelada
		Paciente não compareceu
	

Segunda versão (futuramente): 
Prontuário (Registrar observações e evolução de cada atendimento)
Anamnese (Registrar histórico e informações clínicas do paciente)
Odontograma (Representar os dentes e registrar condições/procedimentos)
Tratamentos (Planejar procedimentos e acompanhar o que foi realizado)
Financeiro (Pagamentos, parcelas, receitas e relatórios)
Arquivos (Fotos, exames e radiografias)
Relatórios (Consultas, faltas, pacientes e indicadores do consultório)
Auditoria (Registrar quem alterou informações importantes)