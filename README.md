plann.er

Next steps:
- No modal de confirmar viagem e colocar o owner, o nome e data da viagem tá estático
- Listar Links Importantes
- Cadastrar Novo Link
- Botão para copiar o link
- Botão para clicar no link e abrir uma nova página com o link
- Alterar local/data
- Gerenciar convidados (adicionar novo convidado)
- Gerenciar convidados (owner pode remover convidado)
- Status da atividade (ícone) - deixar verde quando a atividade tiver passado
- format do date-fns para ptBR em tudo
- Fazer de um jeito mais performático: ao Cadastrar uma atividade, a atividade aparecer na lista sem que o usuário precise dar reload na página. Atualmente, está assim: [link](src/pages/trip-details/create-activity-modal.tsx#L26)
- (BUG) Quando é selecionada uma viagem de 1 dia, não é possível cadastrar atividade (apenas se a viagem for 00:00 do dia)
- Apenas carregar página da viagem, se existir uma viagem. Caso contrário, retornar 404.