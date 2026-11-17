para fazer login backend

$dados = @{
    email = "SEU_EMAIL"
    senha = "SUA_SENHA"
} | ConvertTo-Json

$respostaLogin = Invoke-RestMethod `
    -Uri "http://localhost:3001/api/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $dados `
    -SessionVariable sessao

    cadastrar usuario backend

    $novoUsuario = @{
    nome = "..."
    email = "..."
    senha = "Senha123456"
    perfil = "DENTISTA"
    cro = "16895"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3001/api/usuarios" `
    -Method POST `
    -ContentType "application/json" `
    -Body $novoUsuario `
    -WebSession $sessao